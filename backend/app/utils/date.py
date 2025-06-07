from datetime import UTC, datetime


def utc(d: datetime) -> datetime:
    return d.replace(tzinfo=UTC)
