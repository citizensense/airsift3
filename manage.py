#!/usr/bin/env python
import os
import sys
from pathlib import Path


import environ
import os

ROOT_DIR = Path(__file__).resolve(strict=True).parent
# airsift/
APPS_DIR = ROOT_DIR / "airsift"
env = environ.Env()

READ_DOT_ENV_FILE = env.bool("DJANGO_READ_DOT_ENV_FILE", default=True)
if READ_DOT_ENV_FILE:
    # OS environment variables take precedence over variables from .env
    env.read_env(str(ROOT_DIR / ".env"))

if __name__ == "__main__":
    os.environ.setdefault(env.str("DJANGO_SETTINGS_MODULE", default="config.settings.local"), "config.settings.local")

    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        # The above import may fail for some other reason. Ensure that the
        # issue is really that Django is missing to avoid masking other
        # exceptions on Python 2.
        try:
            import django  # noqa
        except ImportError:
            raise ImportError(
                "Couldn't import Django. Are you sure it's installed and "
                "available on your PYTHONPATH environment variable? Did you "
                "forget to activate a virtual environment?"
            )

        raise

    # This allows easy placement of apps within the interior
    # airsift directory.
    current_path = Path(__file__).parent.resolve()
    sys.path.append(str(current_path / "airsift"))

    execute_from_command_line(sys.argv)
