import os
import shutil
from io import BytesIO

from fastapi import UploadFile

from app.core.config import env
from app.core.db.models import FileResource

STORAGE = env.get_env("STORAGE", "fs/storage")
os.makedirs(STORAGE, exist_ok=True)


def write_bytes(stream: BytesIO, resource: FileResource):
    with open(f"{STORAGE}/{resource.id}", "wb") as buffer:
        shutil.copyfileobj(stream, buffer)


def write_file(uploaded_file: UploadFile, resource: FileResource):
    with open(f"{STORAGE}/{resource.id}", "wb") as buffer:
        shutil.copyfileobj(uploaded_file.file, buffer)


def get_file(resource: FileResource):
    with open(f"{STORAGE}/{resource.id}", "rb") as buffer:
        return buffer.read()


def delete_file(resource: FileResource):
    os.remove(f"{STORAGE}/{resource.id}")
