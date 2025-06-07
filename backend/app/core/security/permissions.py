from collections.abc import Sequence
from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

from app.core.db.models import Permission, Role
from app.core.security.checkers import check_existence

POST_RESOURCE = "post"
FILE_RESOURCE = "file"
INFOFIELD_RESOURCE = "info_field"
COMMENT_RESOURCE = "comment"
TAG_RESOURCE = "tag"

ACTION_CREATE = "create"
ACTION_READ = "read"
ACTION_READWRITE = "rw"
ACTION_UPDATE = "update"
ACTION_DELETE = "delete"
ACTION_CRUD = "crud"
ADMIN_ACTION = "admin_action"


def create_global_permission(
    role_id: str,
    db_session: Session,
    resource_name: str,
    action_name: str,
    commit: bool = True,
):
    role = db_session.get(Role, role_id)
    if not role:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND, detail="Role not found."
        )
    permission_in_db = db_session.exec(
        select(Permission).where(
            Permission.role_id == role_id,
            Permission.name == f"{resource_name}:{action_name}",
        )
    ).first()
    if permission_in_db:
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail="The user already has this permission.",
        )
    permission = Permission(
        name=f"{resource_name}:{action_name}",
        role_id=role_id,
    )
    if commit:
        db_session.add(permission)
        db_session.commit()
        db_session.refresh(permission)
    else:
        db_session.add(permission)
        return permission


def create_permission(
    _role: Role | None,
    db_session: Session,
    resource_name: str,
    resource_id: Any,
    action_name: str,
    commit: bool = True,
):
    role = check_existence(
        _role,
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Not authorized to access this resource.",
    )
    permission_in_db = db_session.exec(
        select(Permission).where(
            Permission.role_id == role.id,
            Permission.name
            == f"{resource_name}:{str(resource_id)}:{action_name}",
        )
    ).first()
    if permission_in_db:
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail="The user already has this permission.",
        )
    permission = Permission(
        name=f"{resource_name}:{resource_id}:{action_name}",
        role_id=role.id,
    )
    if commit:
        db_session.add(permission)
        db_session.commit()
        db_session.refresh(permission)
    return permission


def has_permission(
    db_session: Session,
    role: Role,
    resource_name: str,
    resource_id: str,
    action_name: str,
) -> bool:
    permission = db_session.exec(
        select(Permission).where(
            Permission.role_id == role.id,
            Permission.name == f"{resource_name}:{resource_id}:{action_name}",
        )
    ).first()
    return permission is not None


def has_crud_permission(
    db_session: Session,
    role: Role,
    resource_name: str,
    resource_id: str,
) -> bool:
    return has_permission(
        db_session=db_session,
        role=role,
        resource_name=resource_name,
        resource_id=resource_id,
        action_name=ACTION_CRUD,
    )


def has_global_permission(
    db_session: Session,
    role: Role,
    resource_name: str,
    action_name: str,
) -> bool:
    permission = db_session.exec(
        select(Permission).where(
            Permission.role_id == role.id,
            Permission.name == f"{resource_name}:{action_name}",
        )
    ).first()
    return permission is not None


def has_global_crud_permission(
    db_session: Session,
    role: Role,
    resource_name: str,
) -> bool:
    return has_global_permission(
        db_session=db_session,
        role=role,
        resource_name=resource_name,
        action_name=ACTION_CRUD,
    )


class PermissionCheckModel(BaseModel):
    resource_name: str
    resource_id: Any
    action_names: list[str]


class GlobalPermissionCheckModel(BaseModel):
    resource_name: str
    action_names: list[str]


class PermissionChecker(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    db_session: Session
    roles: list[Role]
    bypass_role: str | None = None
    pcheck_models: Sequence[PermissionCheckModel | GlobalPermissionCheckModel]

    def _is_allowed(
        self,
        role: Role,
        pcheck: PermissionCheckModel | GlobalPermissionCheckModel,
        action_name: str,
    ) -> bool:
        if isinstance(pcheck, PermissionCheckModel):
            return has_permission(
                db_session=self.db_session,
                role=role,
                resource_name=pcheck.resource_name,
                resource_id=str(pcheck.resource_id),
                action_name=action_name,
            )
        elif isinstance(pcheck, GlobalPermissionCheckModel):
            return has_global_permission(
                db_session=self.db_session,
                role=role,
                resource_name=pcheck.resource_name,
                action_name=action_name,
            )

    def check(self, either: bool = False) -> bool:
        if self.bypass_role in [role.name for role in self.roles]:
            return True
        if either:
            if any(
                self._is_allowed(role, pcheck, action_name)
                for role in self.roles
                for pcheck in self.pcheck_models
                for action_name in pcheck.action_names
            ):
                return True
            raise HTTPException(401, "Not authorized to access this resource")

        for role in self.roles:
            if all(
                self._is_allowed(role, pcheck, action_name)
                for pcheck in self.pcheck_models
                for action_name in pcheck.action_names
            ):
                return True

        raise HTTPException(401, "Not authorized to access resource")
