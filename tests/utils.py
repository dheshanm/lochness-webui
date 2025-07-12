import re
import os
import datetime
from playwright.sync_api import Page, expect, TimeoutError
import requests

# Credentials provided by the user
USERNAME = "kevincho@bwh.harvard.edu"
PASSWORD = "kevincho@bwh.harvard.edu"
REDCAP_API_ADDRESS = "https://redcap.partners.org/redcap/api/"
if os.path.exists('.redcap_cred'):
    with open('.redcap_cred', 'r') as fp:
        REDCAP_API_TOKEN = fp.read().strip()
else:
    REDCAP_API_TOKEN = 'TEST_REDCAP_API_TOKEN'

BASE_URL = "http://localhost:3000"

def login(page: Page):
    """
    Performs login operation with provided credentials.
    Checks if already logged in and logs out first if necessary.
    """
    print(f"Attempting to log in as {USERNAME}...")
    page.goto(BASE_URL) # Go to home page to check login status

    try:
        # Check if "Not Logged In" text is visible
        not_logged_in_text = page.get_by_text("Not Logged In")
        not_logged_in_text.wait_for(state="visible", timeout=5000)
        print("Not logged in. Proceeding with login.")
    except TimeoutError:
        # If "Not Logged In" text is not visible, assume logged in and try to log out
        print("Already logged in. Attempting to log out...")
        try:
            # Find and click the logout button/link
            page.get_by_role("button", name="Logout").click()
            page.wait_for_url("**/auth/login") # Wait for redirection to login page after logout
            print("Logged out successfully.")
        except TimeoutError:
            print("Logout button not found or logout failed. Proceeding with login attempt anyway.")

    # Proceed with login
    page.goto(f"{BASE_URL}/auth/login")
    expect(page).to_have_title(re.compile("Lochness - WebUI"))

    page.get_by_label("Email").fill(USERNAME)
    page.get_by_label("Password").fill(PASSWORD)
    page.get_by_role("button", name="Login", exact=True).click()

    page.wait_for_url(BASE_URL)
    print("Login successful.")

def delete_entity(entity_type: str, project_id: str = None, site_id: str = None, instance_name: str = None):
    """
    Deletes an entity (project, site, or data source) via API.
    """
    headers = {
        "Authorization": f"Bearer {REDCAP_API_TOKEN}", # This token is for REDCap, not for API auth. Need proper API auth.
        "Content-Type": "application/json"
    }
    url = ""

    if entity_type == "project":
        if not project_id:
            print("No project_id provided for project deletion.")
            return
        url = f"{BASE_URL}/api/v1/projects/{project_id}"
    elif entity_type == "site":
        if not project_id or not site_id:
            print("No project_id or site_id provided for site deletion.")
            return
        url = f"{BASE_URL}/api/v1/projects/{project_id}/sites/{site_id}"
    elif entity_type == "redcap_data_source":
        if not project_id or not site_id or not instance_name:
            print("Missing project_id, site_id, or instance_name for data source deletion.")
            return
        url = f"{BASE_URL}/api/v1/projects/{project_id}/sites/{site_id}/sources/{instance_name}"
    elif entity_type == "data_sink":
        if not project_id or not site_id or not instance_name:
            print("Missing project_id, site_id, or instance_name for data sink deletion.")
            return
        url = f"{BASE_URL}/api/v1/projects/{project_id}/sites/{site_id}/sinks/{instance_name}"
    else:
        print(f"Unknown entity type for deletion: {entity_type}")
        return

    print(f"Attempting to delete {entity_type} at URL: {url}") # Added URL logging
    response = requests.delete(url, headers=headers)

    if response.status_code == 200:
        print(f"{entity_type} {project_id or site_id or instance_name} deleted successfully.")
    else:
        print(f"Failed to delete {entity_type} {project_id or site_id or instance_name}. Status: {response.status_code}, Response: {response.text}")

