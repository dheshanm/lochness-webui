
import pytest
import requests
from tests.utils import login
from playwright.sync_api import Page

BASE_URL = "http://localhost:3000"


def test_get_keystore_entries(page: Page):
    session_cookie = login(page)
    assert session_cookie is not None

    cookies = {session_cookie['name']: session_cookie['value']}
    headers = {'Content-Type': 'application/json'}

    # Test with a valid project_id
    response = requests.get(f"{BASE_URL}/api/v1/keystore?project_id=ProCAN_WEB", cookies=cookies, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert 'entries' in data

    # Test without a project_id
    response = requests.get(f"{BASE_URL}/api/v1/keystore", cookies=cookies, headers=headers)
    assert response.status_code == 400
    data = response.json()
    assert data['error'] == 'Project ID is required'
