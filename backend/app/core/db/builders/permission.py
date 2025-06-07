from typing import Optional

from app.core.db.models import Permission, Role


class PermissionBuilder:
    def __init__(self) -> None:
        self.resource_name: Optional[str] = None
        self.action_name: Optional[str] = None
        self.resource_id: Optional[str] = None
        self.role: Optional[Role] = None
        self.permission_id: Optional[str] = None

    def withResourceName(self, name: str):
        self.resource_name = name
        return self

    def withActionName(self, action: str):
        self.action_name = action
        return self

    def withResourceId(self, resource_id: str):
        self.resource_id = resource_id
        return self

    def forRole(self, role: Role):
        self.role = role
        return self

    def make(self) -> Permission:
        if not self.resource_name or not self.action_name:
            raise ValueError("Both resource_name and action_name must be set.")
        if not self.role:
            raise ValueError("Role not set.")

        if self.resource_id:
            name = (
                f"{self.resource_name}:{self.resource_id}:{self.action_name}"
            )
        else:
            name = f"{self.resource_name}:{self.action_name}"

        return Permission(
            name=name,
            role=self.role,
        )
