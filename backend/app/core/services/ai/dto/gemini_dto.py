from typing import Any, List

from pydantic import BaseModel


class GeminiRequest(BaseModel):
    message: str

    def to_dict(self):
        base: dict[str, list | str | Any] = {}
        base["contents"] = [{"parts": {"text": self.message}}]
        return base


class SimpleCandidate(BaseModel):
    text: str
    role: str
    finish_reason: str
    avg_logprobs: float


class SimpleUsageMetadata(BaseModel):
    prompt_tokens: int
    candidates_tokens: int
    total_tokens: int


class GeminiResponse(BaseModel):
    candidates: List[SimpleCandidate]
    usage: SimpleUsageMetadata
    model_version: str
    response_id: str

    @classmethod
    def from_raw(cls, data: dict) -> "GeminiResponse":
        # Extract flattened candidates
        candidates = [
            SimpleCandidate(
                text=c["content"]["parts"][0]["text"],
                role=c["content"]["role"],
                finish_reason=c["finishReason"],
                avg_logprobs=c["avgLogprobs"],
            )
            for c in data["candidates"]
        ]

        usage_data = data["usageMetadata"]
        usage = SimpleUsageMetadata(
            prompt_tokens=usage_data["promptTokenCount"],
            candidates_tokens=usage_data["candidatesTokenCount"],
            total_tokens=usage_data["totalTokenCount"],
        )

        return cls(
            candidates=candidates,
            usage=usage,
            model_version=data["modelVersion"],
            response_id=data["responseId"],
        )
