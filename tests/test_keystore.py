
import pytest
from unittest.mock import patch, MagicMock

@pytest.fixture
def mock_db_connection():
    with patch('lochness-webui.src.lib.db.getConnection') as mock_get_connection:
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection
        yield mock_connection

def test_get_keystore_entries_success(mock_db_connection):
    # Mock the database query result
    mock_db_connection.query.return_value = {
        'rows': [
            {'key_name': 'key1', 'key_type': 'type1', 'project_id': 'proj1', 'key_metadata': {}},
            {'key_name': 'key2', 'key_type': 'type2', 'project_id': 'proj1', 'key_metadata': {}},
        ]
    }

    # Mock the auth session
    with patch('lochness-webui.src.lib.auth.auth.api.getSession') as mock_get_session:
        mock_get_session.return_value = {'user': {'email': 'test@example.com'}}

        # Make a request to the API endpoint
        from lochness_webui.src.app.api.v1.keystore.route import GET
        import { NextRequest } from 'next/server';

        request = NextRequest('http://localhost/api/v1/keystore?project_id=proj1')
        response = await GET(request)

        assert response.status == 200
        data = await response.json()
        assert data['entries'] == [
            {'keystore_name': 'key1', 'key_type': 'type1', 'project_id': 'proj1', 'key_metadata': {}},
            {'keystore_name': 'key2', 'key_type': 'type2', 'project_id': 'proj1', 'key_metadata': {}},
        ]
