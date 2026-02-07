"""Regression tests for main app middleware wiring."""

import re
from pathlib import Path
from unittest import TestCase

class MainMiddlewareTests(TestCase):
    def test_rate_limit_middleware_is_wired_in_main(self) -> None:
        main_py = Path(__file__).resolve().parents[1] / "app" / "main.py"
        content = main_py.read_text(encoding="utf-8")

        self.assertIn("RateLimitMiddleware", content)
        self.assertRegex(
            content,
            re.compile(r"app\.add_middleware\(\s*RateLimitMiddleware", re.DOTALL),
        )
