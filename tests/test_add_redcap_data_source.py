import datetime
import pytest
from playwright.sync_api import Page, expect, TimeoutError
from tests.utils import login, REDCAP_API_TOKEN, REDCAP_API_ADDRESS, delete_entity
from tests.shared_data import load_shared_data

def test_add_redcap_data_source(page: Page):
    """
    Tests the functionality of adding a REDCap data source to the created site.
    """
    project_id = None
    site_id = None
    redcap_instance_name = None
    try:
        # Create a project and site for this test
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        project_id = f"TEST_PROJ_REDCAP_{timestamp}"
        project_name = f"Test Project for REDCap - {timestamp}"
        project_description = f"Description for {project_name}"

        site_id = f"TEST_SITE_REDCAP_{timestamp}"
        site_name = f"Test Site for REDCap - {timestamp}"
        site_description = f"Description for {site_name}"

        login(page) # Ensure logged in

        # Create Project
        page.goto("http://localhost:3000/config/projects/new")
        expect(page.locator("h1")).to_have_text("New Project")
        page.get_by_label("Project ID").fill(project_id)
        page.get_by_label("Project Name").fill(project_name)
        page.get_by_label("Is Active").check()
        page.get_by_label("Project Description").fill(project_description)
        page.get_by_role("button", name="Update Project").click()
        page.wait_for_url(f"**/config/projects/{project_id}")
        expect(page.get_by_role("heading", name=project_name)).to_be_visible()

        # Create Site
        page.goto(f"http://localhost:3000/config/projects/{project_id}")
        page.wait_for_url(f"**/config/projects/{project_id}")
        expect(page.get_by_text(project_id)).to_be_visible() # More general locator for project ID in breadcrumb

        add_site_link = page.get_by_role("link", name="Add Site")
        add_site_link.wait_for(state="visible", timeout=10000)
        add_site_link.click()

        page.wait_for_url(f"**/config/projects/{project_id}/sites/new")
        expect(page.locator("h1")).to_have_text(f"Adding Site for {project_id}")

        page.get_by_label("Site ID").fill(site_id)
        page.get_by_label("Site Name").fill(site_name)
        page.get_by_label("Is Active").check()
        page.get_by_label("Site Description").fill(site_description)
        page.get_by_role("button", name="Create Site").click()

        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        expect(page.get_by_text(site_name, exact=True)).to_be_visible()

        print(f"Adding REDCap data source to project '{project_id}', site '{site_id}'")
        # Navigate to the site-specific page first
        page.goto(f"http://localhost:3000/config/projects/{project_id}/sites/{site_id}")
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        # Assert project ID and Site ID are visible on the site page
        expect(page.get_by_role("link", name=project_id)).to_be_visible() # Project ID in breadcrumb
        expect(page.get_by_role("link", name=site_id)).to_be_visible() # Site ID in breadcrumb

        # Click the 'Add Data Source' link
        # Looking at src/app/config/projects/[project_id]/sites/[site_id]/page.tsx, it's a Link with text "Add Data Source"
        add_data_source_link = page.get_by_role("button", name="Add Data Source")
        add_data_source_link.wait_for(state="visible", timeout=10000)
        add_data_source_link.click(timeout=10000) # Increased click timeout

        add_data_source_link = page.get_by_role("link", name="REDCap")
        add_data_source_link.wait_for(state="visible", timeout=10000)
        add_data_source_link.click(timeout=10000) # Increased click timeout

        # Wait for the REDCap form to appear
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/redcap/new")
        expect(page.locator("h1")).to_have_text("Add REDCap Data Source")

        # Generate unique REDCap instance name
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        redcap_instance_name = f"TEST_REDCAP_{timestamp}"
        subject_id_variable = "record_id"

        # Fill in the form fields
        page.get_by_label("RedCAP Instance Name").fill(redcap_instance_name)
        page.get_by_label("RedCAP API Endpoint URL").fill(REDCAP_API_ADDRESS)
        page.get_by_label("RedCAP API Token").fill(REDCAP_API_TOKEN)
        page.get_by_label("Subject ID Variable").fill(subject_id_variable)
        page.get_by_label("Start Activated").check()

        page.screenshot(path=f"redcap_screen_{timestamp}.png")
        # Submit the form
        page.get_by_role("button", name="Create RedCAP Data Source").click(timeout=10000)

        # Verify redirection to the new REDCap data source page
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/redcap/{redcap_instance_name}")
        expect(page.locator("p.mt-1.font-medium").filter(has_text=redcap_instance_name)).to_be_visible()
        # expect(page.get_by_text(redcap_instance_name, exact=True)).to_be_visible()
        expect(page.get_by_text(REDCAP_API_ADDRESS)).to_be_visible()
        expect(page.get_by_text(subject_id_variable)).to_be_visible()

        print(f"Test passed: Successfully added REDCap data source '{redcap_instance_name}'")

    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_add_redcap_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_add_redcap_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed
    finally:
        if project_id:
            print(f"Cleaning up project {project_id}, site {site_id}, and REDCap data source {redcap_instance_name}.")
            delete_entity("redcap_data_source", project_id=project_id, site_id=site_id, instance_name=redcap_instance_name)
            delete_entity("site", project_id=project_id, site_id=site_id)
            delete_entity("project", project_id=project_id)
