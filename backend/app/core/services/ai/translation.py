from typing import Literal

from app.core.services.ai.providers import LLMProvider

SupportedLanguages = Literal[
    "English", "French", "Chinese", "Japanese", "Spanish", "German"
]


async def translate(text: str, language: SupportedLanguages):
    translation_provider = LLMProvider(model="gemini")
    translated_text = await translation_provider.ask(
        message=f"Translate this text into {language}"
        f"do not comment and be straigtforward but DO NOT remove the markdown inside. \n{text}"
    )
    return translated_text
