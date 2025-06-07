import secrets


def gen_id(size: int = 32) -> str:
    return secrets.token_urlsafe(size)


def gen_otp(length: int = 8):
    otp = "".join([str(secrets.randbelow(10)) for _ in range(length)])
    return otp
