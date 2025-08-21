import uuid
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlmodel import Field, Relationship, SQLModel

from app.api.routes.v1.dto.comments import CommentDTO
from app.api.routes.v1.dto.file import ResourceDTO
from app.api.routes.v1.dto.post import PostDTO
from app.api.routes.v1.dto.tag import TagDTO
from app.api.routes.v1.dto.user import DetailedUserInfo, UserDTO
from app.api.routes.v1.dto.user_action import UserMessageDTO
from app.utils.crypto import gen_id


class RoleUserLink(SQLModel, table=True):
    user_id: str = Field(foreign_key="user.id", primary_key=True)
    role_id: str = Field(foreign_key="role.id", primary_key=True)


class UserCommentLikeLink(SQLModel, table=True):
    comment_id: UUID = Field(foreign_key="comment.id", primary_key=True)
    user_id: str = Field(foreign_key="user.id", primary_key=True)


class UserPostLikeLink(SQLModel, table=True):
    user_id: str = Field(foreign_key="user.id", primary_key=True)
    post_id: UUID = Field(foreign_key="post.id", primary_key=True)


class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(10), primary_key=True)
    email: str
    username: str
    name: str
    joined_at: datetime = Field(default_factory=datetime.now)
    banned: bool = False
    last_ban_motive: str | None = None
    login_sessions: list["LoginSession"] = Relationship(
        back_populates="user", cascade_delete=True
    )
    auth_sessions: list["AuthSession"] = Relationship(
        back_populates="user", cascade_delete=True
    )
    roles: list["Role"] = Relationship(
        back_populates="users", link_model=RoleUserLink
    )
    comments: list["Comment"] = Relationship(
        back_populates="author", cascade_delete=True
    )
    posts: list["Post"] = Relationship(
        back_populates="author", cascade_delete=True
    )
    files: list["FileResource"] = Relationship(
        back_populates="owner", cascade_delete=True
    )
    liked_comments: list["Comment"] = Relationship(
        back_populates="liked_by", link_model=UserCommentLikeLink
    )
    liked_posts: list["Post"] = Relationship(
        back_populates="liked_by", link_model=UserPostLikeLink
    )
    visits: list["VisitAction"] = Relationship(
        back_populates="user", cascade_delete=True
    )
    view_actions: list["ViewAction"] = Relationship(
        back_populates="user", cascade_delete=True
    )
    in_newsletter: bool = Field(default=False)

    def to_dto(self):
        return UserDTO(id=self.id, username=self.username, name=self.name)

    def detailed_dto(self):
        return DetailedUserInfo(
            id=self.id,
            username=self.username,
            name=self.name,
            email=self.email,
            joined_at=self.joined_at,
            banned=self.banned,
            last_ban_motive=self.last_ban_motive,
            in_newsletter=self.in_newsletter,
        )


class UserMessage(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    subject: str
    content: str
    viewed: bool = False
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def to_dto(self):
        return UserMessageDTO(
            id=self.id,
            user_id=self.user_id,
            subject=self.subject,
            content=self.content,
            viewed=self.viewed,
            created_at=self.created_at,
        )


class PostTagLink(SQLModel, table=True):
    post_id: UUID = Field(foreign_key="post.id", primary_key=True)
    tag_id: str = Field(foreign_key="tag.id", primary_key=True)


class Tag(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(8), primary_key=True)
    name: str
    posts: list["Post"] = Relationship(
        back_populates="tags", link_model=PostTagLink
    )

    def to_dto(self):
        return TagDTO(name=self.name, id=self.id)


class Post(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=100)
    description: str = Field(max_length=400)
    content: str
    cover: UUID | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    likes: int = 0
    published: bool = False
    archived: bool = False
    featured: bool = False
    user_id: str = Field(foreign_key="user.id")
    author: User = Relationship(back_populates="posts")
    comments: list["Comment"] = Relationship(
        back_populates="post", cascade_delete=True
    )
    tags: list[Tag] = Relationship(
        back_populates="posts", link_model=PostTagLink
    )
    liked_by: list[User] = Relationship(
        back_populates="liked_posts", link_model=UserPostLikeLink
    )
    views: list["ViewAction"] = Relationship(
        back_populates="post", cascade_delete=True
    )

    def to_dto(self):
        return PostDTO(
            id=self.id,
            title=self.title,
            description=self.description,
            likes=self.likes,
            cover=self.cover,
            content=self.content,
            published=self.published,
            archived=self.archived,
            featured=self.featured,
            created_at=self.created_at,
            author=self.author.to_dto(),
            tags=[tag.to_dto() for tag in self.tags],
        )


class Comment(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str
    likes: int = 0
    level: int = 0
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    parent_id: UUID | None = Field(foreign_key="comment.id", default=None)
    user_id: str = Field(foreign_key="user.id")
    post_id: UUID = Field(foreign_key="post.id")
    author: User = Relationship(back_populates="comments")
    post: Post = Relationship(back_populates="comments")
    parent: "Comment" = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Comment.id"},
    )
    children: list["Comment"] = Relationship(back_populates="parent")
    liked_by: list[User] = Relationship(
        back_populates="liked_comments", link_model=UserCommentLikeLink
    )

    def to_dto(self):
        return CommentDTO(
            id=self.id,
            likes=self.likes,
            content=self.content,
            created_at=self.created_at,
            children=[child.to_dto() for child in self.children],
            author=self.author.to_dto(),
            parent_id=self.parent_id,
            level=self.level,
        )


class FileResource(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    protected: bool = Field(default=True)
    name: str
    filetype: str
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    owner: User = Relationship(back_populates="files")

    def to_dto(self):
        return ResourceDTO(
            id=self.id,
            owner=self.owner.to_dto(),
            protected=self.protected,
            created_at=self.created_at,
            name=self.name,
        )


class ViewAction(SQLModel, table=True):
    id: str = Field(default_factory=gen_id, primary_key=True)
    user_id: str | None = Field(foreign_key="user.id", default=None)
    post_id: UUID = Field(foreign_key="post.id")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    post: Post = Relationship(back_populates="views")
    view_time: int = 0  # in seconds
    user: User | None = Relationship(back_populates="view_actions")


class VisitAction(SQLModel, table=True):
    id: str = Field(default_factory=gen_id, primary_key=True)
    user_id: str | None = Field(foreign_key="user.id", default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    user: User | None = Relationship(back_populates="visits")
    visit_time: int = 0  # in seconds


class Role(SQLModel, table=True):
    id: str = Field(default_factory=gen_id, primary_key=True)
    name: str | None = None
    permissions: list["Permission"] = Relationship(back_populates="role")
    users: list[User] = Relationship(
        back_populates="roles", link_model=RoleUserLink
    )


class Permission(SQLModel, table=True):
    permission_id: str = Field(default_factory=gen_id, primary_key=True)
    name: str = Field(primary_key=True)
    role_id: str | None = Field(foreign_key="role.id", default=None)
    role: Role = Relationship(back_populates="permissions")


class LoginSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(30), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=60)
    )
    expired: bool = False
    user: User = Relationship(back_populates="login_sessions")


class AuthSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(50), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=2)
    )
    expired: bool = False
    user: User = Relationship(back_populates="auth_sessions")
