import datetime
import pytest
from playwright.sync_api import Page, expect, TimeoutError
from tests.utils import login, delete_entity

def test_delete_most_recent_site_and_project(page: Page):
    """
    Tests the functionality of deleting the most recently added site and project
    that have 'test' in their names.
    """
    project_id_to_delete = None
    site_id_to_delete = None

    try:
        login(page) # Ensure logged in

        print("Navigating to projects list to find test projects...")
        page.goto("http://localhost:3000/config/projects")
        page.wait_for_url("**/config/projects")
        expect(page.locator("h1")).to_have_text("Projects")

        # Find the most recent test project
        # Assuming projects are listed in a way that the most recent is easily identifiable
        # For example, if they are in a list and the first one is the most recent.
        # This might need refinement based on actual UI sorting.
        project_links = page.locator("a[href^=\"/config/projects/TEST_PROJ_\"]")
        project_links.first.wait_for(state="visible", timeout=10000) # Wait for at least one project link to be visible
        project_count = project_links.count()

        if project_count == 0:
            pytest.skip("No test projects found to delete.")

        # Get the project_id from the first link found (assuming it's the most recent)
        # Extract project_id from the href attribute
        project_href = project_links.first.get_attribute("href") # Corrected line
        if project_href:
            project_id_to_delete = project_href.split("/")[-1]
            print(f"Found most recent test project: {project_id_to_delete}")
        else:
            pytest.fail("Could not extract project ID from link.")

        # --- Delete Site --- #
        print(f"Attempting to delete site from project '{project_id_to_delete}'")
        page.goto(f"http://localhost:3000/config/projects/{project_id_to_delete}")
        page.wait_for_url(f"**/config/projects/{project_id_to_delete}")
        expect(page.get_by_text(f"Project ID: {project_id_to_delete}")).to_be_visible()

        # Find the most recent test site within this project
        # Assuming sites are listed in a way that the most recent is easily identifiable
        site_links = page.locator("a[href^=\"/config/projects/" + project_id_to_delete + "/sites/TEST_SITE_\"]")
        site_count = site_links.count()

        if site_count == 0:
            print(f"No test sites found in project {project_id_to_delete}. Skipping site deletion.")
        else:
            site_href = site_links.first.get_attribute("href") # Corrected line
            if site_href:
                site_id_to_delete = site_href.split("/")[-1]
                print(f"Found most recent test site: {site_id_to_delete}")

                # Navigate to the site-specific page
                page.goto(f"http://localhost:3000/config/projects/{project_id_to_delete}/sites/{site_id_to_delete}")
                page.wait_for_url(f"**/config/projects/{project_id_to_delete}/sites/{site_id_to_delete}")
                expect(page.get_by_text(site_id_to_delete)).to_be_visible()

                # Click the 'Delete Site' button
                # This is a guess, verify with UI inspection
                page.get_by_role("button", name="Delete Site").click()

                # Verify redirection back to project page and site is gone
                page.wait_for_url(f"**/config/projects/{project_id_to_delete}")
                expect(page.get_by_text(site_id_to_delete)).not_to_be_visible()
                print(f"Site '{site_id_to_delete}' deleted successfully.")
            else:
                pytest.fail("Could not extract site ID from link.")

        # --- Delete Project --- #
        print(f"Attempting to delete project '{project_id_to_delete}'")

        # Navigate back to the projects list page (if not already there)
        page.goto(f"http://localhost:3000/config/projects")
        page.wait_for_url("**/config/projects")

        # Click the 'Delete Project' button
        # This is a guess, verify with UI inspection
        page.get_by_role("button", name="Delete Project").click()

        # Verify redirection and project is gone
        page.wait_for_url("**/config/projects") # Should redirect back to projects list
        expect(page.get_by_text(project_id_to_delete)).not_to_be_visible()
        print(f"Project '{project_id_to_delete}' deleted successfully.")

    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_delete_entities_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_delete_entities_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise # Re-raise the exception to mark the test as failed
    finally:
        # Final cleanup attempt in case of test failure before explicit deletion steps
        if project_id_to_delete and site_id_to_delete:
            delete_entity("site", project_id=project_id_to_delete, site_id=site_id_to_delete)
        if project_id_to_delete:
            delete_entity("project", project_id=project_id_to_delete)
