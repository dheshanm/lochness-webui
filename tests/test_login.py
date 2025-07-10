import pytest
from playwright.sync_api import Page, expect
from tests.utils import login

def test_login(page: Page):
    """
    Tests the login functionality.
    """
    login(page)
    # Additional assertions can be added here to verify successful login, e.g., presence of user dashboard elements
    expect(page.locator("text=Welcome")).to_be_visible() # Assuming a welcome message after login
    print("Test passed: Login functionality works.")