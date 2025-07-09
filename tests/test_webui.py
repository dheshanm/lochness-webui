import re
import datetime
import pytest
from playwright.sync_api import Page, expect, TimeoutError

# Credentials provided by the user
USERNAME = "kevincho@bwh.harvard.edu"
PASSWORD = "kevincho@bwh.harvard.edu"

def login(page: Page):
    """
    Performs login operation with provided credentials.
    Checks if already logged in and logs out first if necessary.
    """
    print(f"Attempting to log in as {USERNAME}...")
    page.goto("http://localhost:3000/") # Go to home page to check login status

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
    page.goto("http://localhost:3000/auth/login")
    expect(page).to_have_title(re.compile("Lochness - WebUI"))

    page.get_by_label("Email").fill(USERNAME)
    page.get_by_label("Password").fill(PASSWORD)
    page.get_by_role("button", name="Login", exact=True).click()

    page.wait_for_url("http://localhost:3000/")
    print("Login successful.")

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

@pytest.mark.dependency()
def test_login(page: Page):
    """
    Tests the login functionality.
    """
    login(page)
    # Additional assertions can be added here to verify successful login, e.g., presence of user dashboard elements
    expect(page.locator("text=Welcome")).to_be_visible() # Assuming a welcome message after login
    print("Test passed: Login functionality works.")

# Global variable to store the project_id created by test_add_new_project
# For more complex scenarios, consider pytest fixtures or a shared state object
created_project_id = None

@pytest.mark.dependency(depends=["test_login"])
def test_add_new_project(page: Page):
    """
    Tests the functionality of adding a new project.
    """
    global created_project_id
    try:
        login(page) # Perform login first

        print("Going to projects page")
        # Navigate to the Projects configuration page
        page.get_by_text("Projects").click()

        print("Waiting for projects page to load")
        page.wait_for_url("**/config/projects", timeout=60000) # Increased timeout to 60 seconds
        print("projects page loaded")

        expect(page.locator("h1")).to_have_text("Projects")

        # Click the 'New Project' link (it's an <a> tag styled as a button)
        new_project_link = page.get_by_role("link", name="New Project")
        new_project_link.wait_for(state="visible", timeout=30000) # Increased timeout to 30 seconds
        new_project_link.click()

        # The subsequent assertion will implicitly wait for navigation
        expect(page.locator("h1")).to_have_text("New Project") # Corrected assertion
        print("new project page loaded")

        # Generate unique project ID and name
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        project_id = f"TEST_PROJ_{timestamp}"
        project_name = f"Test Project - Created by Playwright - {timestamp}"
        project_description = f"Description for {project_name}"

        # Store the project_id in the global variable
        created_project_id = project_id

        # Fill in the project ID
        page.get_by_label("Project ID").fill(project_id)

        # Fill in the project name
        page.get_by_label("Project Name").fill(project_name)

        # Check the 'Is Active' checkbox
        page.get_by_label("Is Active").check()

        # Fill in the project description
        page.get_by_label("Project Description").fill(project_description)

        # Submit the form
        page.get_by_role("button", name="Update Project").click()

        # Verify the project was added successfully by waiting for the project-specific URL
        page.wait_for_url(f"**/config/projects/{project_id}")
        expect(page.get_by_role("heading", name=project_name)).to_be_visible() # Assert that the H2 on the project page is the project name
        expect(page.get_by_text(project_description)).to_be_visible() # Assert description is visible

        print(f"Test passed: Successfully added project '{project_name}'")

    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_add_new_project_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_add_new_project_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed

@pytest.mark.dependency(depends=["test_add_new_project"])
def test_add_new_site(page: Page):
    """
    Tests the functionality of adding a new site to the created project.
    """
    global created_project_id
    if created_project_id is None:
        pytest.skip("No project was created by test_add_new_project.")

    try:
        login(page) # Ensure logged in

        print(f"Adding site to project: {created_project_id}")
        # Navigate to the project-specific page first
        page.goto(f"http://localhost:3000/config/projects/{created_project_id}")
        page.wait_for_url(f"**/config/projects/{created_project_id}")
        expect(page.get_by_text(f"Project ID: {created_project_id}")).to_be_visible() # Assert project ID is visible

        # Click the 'Add Site' link
        add_site_link = page.get_by_role("link", name="Add Site")
        add_site_link.wait_for(state="visible", timeout=10000)
        add_site_link.click()

        # Wait for the new site form to appear
        page.wait_for_url(f"**/config/projects/{created_project_id}/sites/new")
        expect(page.locator("h1")).to_have_text(f"Adding Site for {created_project_id}")

        # Generate unique site ID and name
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        site_id = f"TEST_SITE_{timestamp}"
        site_name = f"Test Site - Created by Playwright - {timestamp}"
        site_description = f"Description for {site_name}"

        # Fill in the site ID
        page.get_by_label("Site ID").fill(site_id)

        # Fill in the site name
        page.get_by_label("Site Name").fill(site_name)

        # Check the 'Is Active' checkbox
        page.get_by_label("Is Active").check()

        # Fill in the site description
        page.get_by_label("Site Description").fill(site_description)

        # Submit the form
        page.get_by_role("button", name="Create Site").click()

        # Verify the site was added successfully by waiting for the site-specific URL
        page.wait_for_url(f"**/config/projects/{created_project_id}/sites/{site_id}")
        expect(page.get_by_text(site_name, exact=True)).to_be_visible() # Assert that the site name is visible
        expect(page.get_by_text(site_description)).to_be_visible() # Assert description is visible

        print(f"Test passed: Successfully added site '{site_name}' to project '{created_project_id}'")

    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_add_new_site_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_add_new_site_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed