import datetime
import pytest
from playwright.sync_api import Page, expect, TimeoutError
from tests.utils import login, delete_entity

def test_data_sink_crud(page: Page):
    """
    Tests adding, viewing, editing, and deleting a generic data sink via the UI.
    """
    project_id = None
    site_id = None
    data_sink_name = None
    try:
        print("=== Starting Data Sink CRUD Test ===")
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        project_id = f"TEST_PROJ_SINK_{timestamp}"
        project_name = f"Test Project for Sink - {timestamp}"
        project_description = f"Description for {project_name}"
        site_id = f"TEST_SITE_SINK_{timestamp}"
        site_name = f"Test Site for Sink - {timestamp}"
        site_description = f"Description for {site_name}"
        print(f"Created test IDs - Project: {project_id}, Site: {site_id}")
        login(page)
        print("✓ Login successful")
        # Create Project
        print("--- Creating Project ---")
        page.goto("http://localhost:3000/config/projects/new")
        expect(page.locator("h1")).to_have_text("New Project")
        page.get_by_label("Project ID").fill(project_id)
        page.get_by_label("Project Name").fill(project_name)
        page.get_by_label("Is Active").check()
        page.get_by_label("Project Description").fill(project_description)
        page.get_by_role("button", name="Update Project").click()
        page.wait_for_url(f"**/config/projects/{project_id}")
        expect(page.get_by_role("heading", name=project_name)).to_be_visible()
        print(f"✓ Project '{project_name}' created successfully")
        # Create Site
        print("--- Creating Site ---")
        page.goto(f"http://localhost:3000/config/projects/{project_id}")
        page.wait_for_url(f"**/config/projects/{project_id}")
        expect(page.get_by_text(project_id)).to_be_visible()
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
        print(f"✓ Site '{site_name}' created successfully")
        # Add Data Sink


        print("--- Creating Data Sink ---")
        page.goto(f"http://localhost:3000/config/projects/{project_id}/sites/{site_id}")
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        expect(page.get_by_role("link", name=project_id)).to_be_visible()
        expect(page.get_by_role("link", name=site_id)).to_be_visible()
        page.get_by_role("tab", name="Data Sinks").click()
        add_sink_btn = page.get_by_role("link", name="Add Data Sink")
        add_sink_btn.wait_for(state="visible", timeout=10000)
        add_sink_btn.click()
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sinks/new")
        expect(page.locator("h1")).to_have_text("Add Data Sink")
        data_sink_name = f"TEST_SINK_{timestamp}"
        print(f"Creating data sink with name: {data_sink_name}")
        page.locator('input[name="data_sink_name"]').fill(data_sink_name)
        page.locator('textarea[name="data_sink_metadata"]').fill('{"type": "generic", "note": "test"}')
        page.get_by_role("button", name="Create Data Sink").click(timeout=10000)
        print("✓ Data sink creation form submitted")


        # Should return to site page, Data Sinks tab
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        page.get_by_role("tab", name="Data Sinks").click()
        expect(page.get_by_text(data_sink_name, exact=True)).to_be_visible()
        print(f"✓ Data sink '{data_sink_name}' created and visible in list")

        # View details page
        print("--- Viewing Data Sink Details ---")
        page.get_by_role("link", name=data_sink_name).click()
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sinks/{data_sink_name}")
        expect(page.get_by_text(data_sink_name, exact=True)).to_be_visible()
        expect(page.get_by_text('"type": "generic"')).to_be_visible()
        print("✓ Data sink details page loaded successfully")

        # Go to edit page
        print("--- Editing Data Sink ---")
        # page.get_by_role("button", name="Edit").click()  # didn't work
        page.locator('[data-slot="button"]:has-text("Edit")').click()
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sinks/{data_sink_name}/edit")
        expect(page.get_by_text("Update Data Sink")).to_be_visible()

        # Edit metadata
        new_metadata = '{"type": "generic", "note": "updated", "extra": 123}'
        print(f"Updating metadata to: {new_metadata}")
        # textarea = page.get_by_label("Data Sink Metadata (JSON)")  # didn't work
        textarea = page.locator('[data-slot="textarea"]')
        textarea.fill(new_metadata)
        page.get_by_role("button", name="Update Data Sink").click()
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sinks/{data_sink_name}")
        expect(page.get_by_text('"note": "updated"')).to_be_visible()
        expect(page.get_by_text('"extra": 123')).to_be_visible()
        print("✓ Data sink metadata updated successfully")

        # Delete via UI
        print("--- Deleting Data Sink ---")
        # Click the Delete button to open the native confirm dialog
        with page.expect_dialog() as dialog_info:
            page.get_by_role("button", name="Delete").click()
        dialog = dialog_info.value
        dialog.accept()  # This clicks "OK"
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        page.get_by_role("tab", name="Data Sinks").click()
        expect(page.get_by_text(data_sink_name)).not_to_be_visible()
        print(f"✓ Data sink '{data_sink_name}' deleted successfully")
        print(f"🎉 Test passed: Data sink '{data_sink_name}' add/view/edit/delete successful.")
    except TimeoutError as e:
        print(f"❌ Test failed due to timeout: {e}")
        page.screenshot(path=f"test_data_sink_crud_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    except Exception as e:
        print(f"❌ Test failed: {e}")
        page.screenshot(path=f"test_data_sink_crud_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    finally:
        print("--- Cleaning up test data ---")
        print(f"Cleaning up project {project_id}, site {site_id}, and data sink {data_sink_name}.")
        if project_id and site_id and data_sink_name:
            delete_entity("data_sink", project_id=project_id, site_id=site_id, instance_name=data_sink_name)
            print(f"✓ Deleted data sink: {data_sink_name}")
        if project_id and site_id:
            delete_entity("site", project_id=project_id, site_id=site_id)
            print(f"✓ Deleted site: {site_id}")
        if project_id:
            delete_entity("project", project_id=project_id)
            print(f"✓ Deleted project: {project_id}")
        print("=== Test cleanup completed ===") 
