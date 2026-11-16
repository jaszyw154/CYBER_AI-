import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.config.settings import get_settings

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(seconds=settings.jwt_expire_seconds),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


# ---------- in-memory user store ----------

_user_store: dict[str, dict[str, Any]] = {}
_email_index: dict[str, str] = {}


class UserExistsError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


def create_user(email: str, password: str, display_name: str = "") -> dict[str, Any]:
    if email.lower() in _email_index:
        raise UserExistsError("A user with this email already exists")
    user_id = str(uuid.uuid4())
    now = datetime.now(UTC)
    record = {
        "id": user_id,
        "email": email.lower(),
        "hashed_password": hash_password(password),
        "display_name": display_name or email.split("@")[0],
        "role": "analyst",
        "created_at": now,
    }
    _user_store[user_id] = record
    _email_index[email.lower()] = user_id
    return _user_store[user_id]


def authenticate_user(email: str, password: str) -> dict[str, Any]:
    email_lower = email.lower()
    user_id = _email_index.get(email_lower)
    if not user_id:
        raise InvalidCredentialsError("Invalid email or password")
    record = _user_store[user_id]
    if not verify_password(password, record["hashed_password"]):
        raise InvalidCredentialsError("Invalid email or password")
    return record


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    return _user_store.get(user_id)


def get_user_by_email(email: str) -> dict[str, Any] | None:
    user_id = _email_index.get(email.lower())
    if user_id:
        return _user_store.get(user_id)
    return None


def seed_default_user() -> None:
    if "admin@cyberai.io" not in _email_index:
        create_user("admin@cyberai.io", "admin123", "SOC Admin")


seed_default_user()
