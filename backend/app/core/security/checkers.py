from typing import Any

from fastapi import HTTPException, WebSocketException, status
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)


def check_non_existences(
    instances: list[object | None],
    *,
    is_ws: bool = False,
    detail: str = "Resource not found",
    status_code: int = HTTP_409_CONFLICT,
    ws_code: int = status.WS_1008_POLICY_VIOLATION,
):
    for instance in instances:
        if instance:
            if is_ws:
                raise WebSocketException(code=ws_code, reason=detail)
            raise HTTPException(status_code=status_code, detail=detail)


def check_non_existence(
    instance: object | None,
    *,
    is_ws: bool = False,
    detail: str = "Resource not found",
    status_code: int = HTTP_409_CONFLICT,
    ws_code: int = status.WS_1008_POLICY_VIOLATION,
):
    if instance:
        if is_ws:
            raise WebSocketException(code=ws_code, reason=detail)
        raise HTTPException(status_code=status_code, detail=detail)


def check_existences[T](
    instances: list[T | None],
    *,
    is_ws: bool = False,
    detail: str = "Resource not found",
    status_code: int = HTTP_404_NOT_FOUND,
    ws_code: int = status.WS_1008_POLICY_VIOLATION,
) -> list[T | None]:
    for instance in instances:
        if not instances:
            if is_ws:
                raise WebSocketException(code=ws_code, reason=detail)
            raise HTTPException(status_code=status_code, detail=detail)
    return instances


def check_existence[T](
    instance: T | None,
    *,
    is_ws: bool = False,
    detail: str = "Resource not found",
    status_code: int = HTTP_404_NOT_FOUND,
    ws_code: int = status.WS_1008_POLICY_VIOLATION,
) -> T:
    if instance is None:
        if is_ws:
            raise WebSocketException(code=ws_code, reason=detail)
        raise HTTPException(status_code=status_code, detail=detail)
    return instance


def check_equality(
    a: Any,
    b: Any,
    *,
    is_ws: bool = False,
    detail: str = "Resources do not match",
    status_code: int = HTTP_401_UNAUTHORIZED,
    ws_code: int = status.WS_1008_POLICY_VIOLATION,
):
    if a != b:
        if is_ws:
            raise WebSocketException(code=ws_code, reason=detail)
        raise HTTPException(status_code=status_code, detail=detail)


def check_conditions(
    check_list: list[bool],
    *,
    is_ws: bool = False,
    detail: str = "Unauthorized",
    status_code: int = HTTP_401_UNAUTHORIZED,
    ws_code: int = status.WS_1008_POLICY_VIOLATION,
):
    for condition in check_list:
        if not condition:
            if is_ws:
                raise WebSocketException(code=ws_code, reason=detail)
            raise HTTPException(status_code=status_code, detail=detail)
