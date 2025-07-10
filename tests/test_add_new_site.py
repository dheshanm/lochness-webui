import datetime
import pytest
from playwright.sync_api import Page, expect, TimeoutError
from tests.utils import login, delete_entity
from tests.shared_data import save_shared_data, load_shared_data

def test_add_new_site(page: Page):
    """
    Tests the functionality of adding a new site to the created project.
    """
    project_id = None
    site_id = None
    try:
        # Create a project first for this test
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        project_id = f"TEST_PROJ_SITE_{timestamp}"
        project_name = f"Test Project for Site - {timestamp}"
        project_description = f"Description for {project_name}"

        login(page) # Ensure logged in

        # Manually create project for this test
        page.goto("http://localhost:3000/config/projects/new")
        expect(page.locator("h1")).to_have_text("New Project")
        page.get_by_label("Project ID").fill(project_id)
        page.get_by_label("Project Name").fill(project_name)
        page.get_by_label("Is Active").check()
        page.get_by_label("Project Description").fill(project_description)
        page.get_by_role("button", name="Update Project").click()
        page.wait_for_url(f"**/config/projects/{project_id}")
        expect(page.get_by_role("heading", name=project_name)).to_be_visible()

        print(f"Adding site to project: {project_id}")
        # Navigate to the project-specific page first
        page.goto(f"http://localhost:3000/config/projects/{project_id}")
        page.wait_for_url(f"**/config/projects/{project_id}")
        # Assert project ID and Site ID are visible in the breadcrumbs
        expect(page.get_by_role("link", name=project_id)).to_be_visible() # Project ID in breadcrumb

        # Click the 'Add Site' link
        add_site_link = page.get_by_role("link", name="Add Site")
        add_site_link.wait_for(state="visible", timeout=10000)
        add_site_link.click()

        # Wait for the new site form to appear
        page.wait_for_url(f"**/config/projects/{project_id}/sites/new")
        expect(page.locator("h1")).to_have_text(f"Adding Site for {project_id}")

        # Generate unique site ID and name
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        site_id = f"TEST_SITE_{timestamp}"
        site_name = f"Test Site - Created by Playwright - {timestamp}"
        site_description = f"Description for {site_name}"

        # Store the site_id in the shared data
        shared_data = load_shared_data()
        shared_data["created_site_id"] = site_id
        shared_data["created_project_id"] = project_id # Also save project_id for cleanup
        save_shared_data(shared_data)

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
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        expect(page.get_by_text(site_name, exact=True)).to_be_visible() # Assert that the site name is visible
        expect(page.get_by_text(site_description)).to_be_visible() # Assert description is visible

        print(f"Test passed: Successfully added site '{site_name}' to project '{project_id}'")

    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_add_new_site_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_add_new_site_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed
    finally:
        if project_id:
            print(f"Cleaning up project {project_id} and its sites.")
            delete_entity("project", project_id=project_id)
