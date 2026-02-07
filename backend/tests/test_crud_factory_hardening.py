"""Static regression checks for CRUD factory security hardening."""

from pathlib import Path
from unittest import TestCase


class CrudFactoryHardeningTests(TestCase):
    def test_crud_factory_supports_exclude_fields(self) -> None:
        crud_factory = Path(__file__).resolve().parents[1] / "app" / "api" / "crud_factory.py"
        content = crud_factory.read_text(encoding="utf-8")
        self.assertIn("exclude_fields", content)
        self.assertIn("def _serialize_row(row: Any, exclude_fields", content)

    def test_crud_factory_audits_state_changes(self) -> None:
        crud_factory = Path(__file__).resolve().parents[1] / "app" / "api" / "crud_factory.py"
        content = crud_factory.read_text(encoding="utf-8")
        self.assertIn("action=\"crud_create\"", content)
        self.assertIn("action=\"crud_update\"", content)
        self.assertIn("action=\"crud_delete\"", content)
