"""Usage:

from app.env import Mode, mode

if mode == Mode.PROD:
    print("Running in deployed service")
else:
    print("Running in development workspace")
"""

import os
from enum import Enum


class Mode(str, Enum):
    DEV = "development"
    PROD = "production"


env_setting = os.environ.get("ENV", "dev").lower()
mode = Mode.PROD if env_setting == "prod" else Mode.DEV

__all__ = [
    "Mode",
    "mode",
]
