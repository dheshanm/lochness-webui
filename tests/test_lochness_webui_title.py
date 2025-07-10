import re
from playwright.sync_api import Page, expect

def test_lochness_webui_title(page: Page):
    """
    Tests that the Lochness WebUI page loads and its title contains "Lochness".
    """
    # Navigate to the Lochness WebUI application
    # Ensure your lochness_webui server is running at http://localhost:3000
    page.goto("http://localhost:3000")

    # Assert that the page title contains "Lochness"
    expect(page).to_have_title(re.compile("Lochness"))

    print("Test passed: Lochness WebUI title contains 'Lochness'")