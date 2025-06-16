from io import BytesIO
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.api.routes.v1.dto.message import MessageResponse
from app.core.db.builders.permission import PermissionBuilder
from app.core.db.models import FileResource, Role, User
from app.core.security.checkers import check_existence
from app.core.security.permissions import (
    ACTION_READ,
    ACTION_READWRITE,
    FILE_RESOURCE,
    PermissionChecker,
    PermissionCheckModel,
)
from app.core.services import storage


async def get_file_resource(
    db_session: Session, current_user: User | None, resource_id: UUID
):
    resource = check_existence(
        db_session.get(FileResource, resource_id), detail="File not found."
    )
    if resource.protected is True:
        user = check_existence(current_user)
        PermissionChecker(
            roles=user.roles,
            db_session=db_session,
            pcheck_models=[
                PermissionCheckModel(
                    resource_name=FILE_RESOURCE,
                    resource_id=resource.id,
                    action_names=[ACTION_READ],
                ),
                PermissionCheckModel(
                    resource_name=FILE_RESOURCE,
                    resource_id=resource.id,
                    action_names=[ACTION_READWRITE],
                ),
            ],
        ).check(either=True)
    return StreamingResponse(
        content=BytesIO(
            storage.get_file(resource),
        ),
        headers={
            "Content-Disposition": f"attachment; filename={resource.name}",
            "Content-Type": resource.filetype,
        },
    )


async def create_file_resource(
    db_session: Session,
    current_user: User,
    file: UploadFile,
    name: Optional[str] = None,
    protected: bool = False,
):
    if not file.size:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="File size is required",
        )

    if file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit",
        )
    if not file.filename:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="File name is required",
        )

    if not file.content_type:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="File content type is required",
        )

    resource = FileResource(
        user_id=current_user.id,
        name=name or file.filename,
        protected=protected,
        filetype=file.content_type,
    )

    rw_role = Role(users=[current_user])
    permission = (
        PermissionBuilder()
        .forRole(rw_role)
        .withResourceName(FILE_RESOURCE)
        .withResourceId(str(resource.id))
        .withActionName(ACTION_READWRITE)
    ).make()

    try:
        storage.write_file(file, resource)
    except Exception as e:
        db_session.rollback()
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=f"Failed to save file: {str(e)}",
        )

    db_session.add(resource)
    db_session.add(rw_role)
    db_session.add(permission)
    db_session.commit()

    return resource.to_dto()


async def create_file_resources(
    db_session: Session,
    current_user: User,
    files: list[UploadFile],
    protected: bool = False,
):
    resources: list[FileResource] = []
    for file in files:
        if not file.size:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="File size is required",
            )

        if file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="File size exceeds 5MB limit",
            )
        if not file.filename:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="File name is required",
            )

        if not file.content_type:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="File content type is required",
            )

        # Create media record
        resource = FileResource(
            user_id=current_user.id,
            name=file.filename,
            protected=protected,
            filetype=file.content_type,
        )
        rw_role = Role(users=[current_user])
        permission = (
            PermissionBuilder()
            .forRole(rw_role)
            .withResourceName(FILE_RESOURCE)
            .withResourceId(str(resource.id))
            .withActionName(ACTION_READWRITE)
        ).make()
        db_session.add(rw_role)
        db_session.add(permission)
        db_session.add(resource)
        resources.append(resource)

        try:
            storage.write_file(file, resource)
        except Exception as e:
            db_session.rollback()
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail=f"Failed to save file: {str(e)}",
            )

    db_session.commit()
    for resource in resources:
        db_session.refresh(resource)

    return [resource.to_dto() for resource in resources]


async def delete_file_resource(
    db_session: Session, user: User, resource_id: UUID
):
    resource = check_existence(
        db_session.get(FileResource, resource_id), detail="File not found."
    )
    PermissionChecker(
        db_session=db_session,
        roles=user.roles,
        pcheck_models=[
            PermissionCheckModel(
                resource_name=FILE_RESOURCE,
                resource_id=resource.id,
                action_names=[ACTION_READWRITE],
            )
        ],
    ).check()
    db_session.delete(resource)
    try:
        storage.delete_file(resource)
    except Exception:
        db_session.rollback()
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete file.",
        )
    return MessageResponse(message="File deleted successfully")
