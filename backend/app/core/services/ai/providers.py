from dataclasses import dataclass
from typing import Literal

import requests
from fastapi import HTTPException
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE

from app.core.config.env import get_env
from app.core.logging.log import log_error, log_info
from app.core.services.ai.dto import gemini_dto

SupportedModels = Literal["gemini"]


async def ask_gemini(message: str):
    try:
        GEMINI_API_KEY = get_env("GEMINI_API_KEY")
        base_url = (
            "https://generativelanguage.googleapis.com"
            "/v1beta/models/"
            f"gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        )
        request_data = gemini_dto.GeminiRequest(message=message)
        response = requests.post(url=base_url, json=request_data.to_dict())
        json_response = response.json()
        log_info(json_response)
        parsed_response = gemini_dto.GeminiResponse.from_raw(json_response)
        return parsed_response.candidates[0].text
    except Exception as e:
        log_error(e)
        raise HTTPException(
            status_code=HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not get a response.",
        )


@dataclass
class LLMProvider:
    model: SupportedModels

    async def ask(self, message: str):
        match self.model:
            case "gemini":
                return await ask_gemini(message=message)
