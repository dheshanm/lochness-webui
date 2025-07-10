import datetime
import pytest
from playwright.sync_api import Page, expect, TimeoutError
from tests.utils import login, delete_entity
from tests.shared_data import save_shared_data, load_shared_data

def test_add_new_project(page: Page):
    """
    Tests the functionality of adding a new project.
    """
    project_id = None # Initialize to None
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

        # Store the project_id in the shared data
        shared_data = load_shared_data()
        shared_data["created_project_id"] = project_id
        save_shared_data(shared_data)

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
    finally:
        if project_id:
            print(f"Cleaning up project: {project_id}")
            delete_entity("project", project_id=project_id)
