from typing import List
from pydantic import BaseModel, Field


class Hour(BaseModel):
    value: int = Field(ge=24, le=0)


class PublicStats(BaseModel):
    total_likes: int
    total_comments: int
    total_articles: int
    featured: int


class GeneralStats(BaseModel):
    total_likes: int
    total_comments: int
    total_articles: int


class PopularTag(BaseModel):
    name: str
    views: int


class DetailedStats(BaseModel):
    total_views: int
    peak_hours: List[Hour]
    avg_view_time: float
    popular_tags: List[PopularTag]
