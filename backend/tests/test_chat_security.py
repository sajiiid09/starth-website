"""Security-focused tests for chat access controls."""

import uuid
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock

from app.services import chat_service
from app.utils.exceptions import ForbiddenError


def _result(value):
    result = Mock()
    result.scalar_one_or_none.return_value = value
    return result


class ChatSecurityTests(IsolatedAsyncioTestCase):
    async def test_send_message_rejects_non_participant(self) -> None:
        user_id = uuid.uuid4()
        event_id = uuid.uuid4()
        chat_group_id = uuid.uuid4()

        db = Mock()
        db.execute = AsyncMock(
            side_effect=[
                _result(SimpleNamespace(id=chat_group_id, event_id=event_id)),  # chat group lookup
                _result(SimpleNamespace(id=event_id, user_id=uuid.uuid4(), venue_id=uuid.uuid4())),  # event
                _result(None),  # venue ownership
                _result(None),  # service provider profile
                _result(None),  # collaborator record
            ]
        )
        db.add = Mock()
        db.flush = AsyncMock()

        with self.assertRaises(ForbiddenError):
            await chat_service.send_message(
                db=db,
                chat_group_id=chat_group_id,
                sender_id=user_id,
                content="hello team",
            )

        db.add.assert_not_called()

    async def test_send_message_allows_event_organizer(self) -> None:
        user_id = uuid.uuid4()
        event_id = uuid.uuid4()
        chat_group_id = uuid.uuid4()

        db = Mock()
        db.execute = AsyncMock(
            side_effect=[
                _result(SimpleNamespace(id=chat_group_id, event_id=event_id)),  # chat group lookup
                _result(SimpleNamespace(id=event_id, user_id=user_id, venue_id=None)),  # access check
                _result(SimpleNamespace(id=event_id, user_id=user_id, venue_id=None)),  # anon name resolve
            ]
        )
        db.add = Mock()
        db.flush = AsyncMock()

        result = await chat_service.send_message(
            db=db,
            chat_group_id=chat_group_id,
            sender_id=user_id,
            content="event update",
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["message"]["sender_anonymous_name"], "Event Organizer")
        db.add.assert_called_once()

    async def test_get_messages_rejects_non_participant(self) -> None:
        user_id = uuid.uuid4()
        event_id = uuid.uuid4()
        chat_group_id = uuid.uuid4()

        db = Mock()
        db.execute = AsyncMock(
            side_effect=[
                _result(SimpleNamespace(id=chat_group_id, event_id=event_id)),  # chat group lookup
                _result(SimpleNamespace(id=event_id, user_id=uuid.uuid4(), venue_id=uuid.uuid4())),  # event
                _result(None),  # venue ownership
                _result(None),  # service provider profile
                _result(None),  # collaborator record
            ]
        )

        with self.assertRaises(ForbiddenError):
            await chat_service.get_messages(
                db=db,
                chat_group_id=chat_group_id,
                user_id=user_id,
                limit=20,
            )
