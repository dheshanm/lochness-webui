import datetime
import pytest
from playwright.sync_api import Page, expect, TimeoutError
from tests.utils import login, delete_entity

def test_add_cantab_data_source(page: Page):
    """
    Tests adding a CANTAB data source to a new site.
    """
    project_id = None
    site_id = None
    cantab_instance_name = None
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        project_id = f"TEST_PROJ_CANTAB_{timestamp}"
        project_name = f"Test Project for CANTAB - {timestamp}"
        project_description = f"Description for {project_name}"
        site_id = f"TEST_SITE_CANTAB_{timestamp}"
        site_name = f"Test Site for CANTAB - {timestamp}"
        site_description = f"Description for {site_name}"
        login(page)
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
        # Add CANTAB Data Source
        page.goto(f"http://localhost:3000/config/projects/{project_id}/sites/{site_id}")
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        expect(page.get_by_role("link", name=project_id)).to_be_visible()
        expect(page.get_by_role("link", name=site_id)).to_be_visible()
        add_data_source_btn = page.get_by_role("button", name="Add Data Source")
        add_data_source_btn.wait_for(state="visible", timeout=10000)
        add_data_source_btn.click(timeout=10000)
        cantab_link = page.get_by_role("link", name="CANTAB")
        cantab_link.wait_for(state="visible", timeout=10000)
        cantab_link.click(timeout=10000)
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/cantab/new")
        expect(page.locator("h1")).to_have_text("Add CANTAB Data Source")
        cantab_instance_name = f"TEST_CANTAB_{timestamp}"
        page.get_by_label("CANTAB Instance Name").fill(cantab_instance_name)
        page.get_by_label("Keystore Name").fill("cantab_prod")
        page.get_by_label("API Endpoint").fill("https://app.cantab.com/api")
        page.get_by_role("button", name="Create CANTAB Data Source").click(timeout=10000)
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/cantab/{cantab_instance_name}")
        expect(page.get_by_text(cantab_instance_name, exact=True)).to_be_visible()
        expect(page.get_by_text("https://app.cantab.com/api")).to_be_visible()
        print(f"Test passed: Successfully added CANTAB data source '{cantab_instance_name}'")
    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_add_cantab_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_add_cantab_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    finally:
        if project_id:
            print(f"Cleaning up project {project_id}, site {site_id}, and CANTAB data source {cantab_instance_name}.")
            delete_entity("cantab_data_source", project_id=project_id, site_id=site_id, instance_name=cantab_instance_name)
            delete_entity("site", project_id=project_id, site_id=site_id)
            delete_entity("project", project_id=project_id)

def test_add_xnat_data_source(page: Page):
    """
    Tests adding an XNAT data source to a new site.
    """
    project_id = None
    site_id = None
    xnat_instance_name = None
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        project_id = f"TEST_PROJ_XNAT_{timestamp}"
        project_name = f"Test Project for XNAT - {timestamp}"
        project_description = f"Description for {project_name}"
        site_id = f"TEST_SITE_XNAT_{timestamp}"
        site_name = f"Test Site for XNAT - {timestamp}"
        site_description = f"Description for {site_name}"
        login(page)
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
        # Add XNAT Data Source
        page.goto(f"http://localhost:3000/config/projects/{project_id}/sites/{site_id}")
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        expect(page.get_by_role("link", name=project_id)).to_be_visible()
        expect(page.get_by_role("link", name=site_id)).to_be_visible()
        add_data_source_btn = page.get_by_role("button", name="Add Data Source")
        add_data_source_btn.wait_for(state="visible", timeout=10000)
        add_data_source_btn.click(timeout=10000)
        xnat_link = page.get_by_role("link", name="XNAT")
        xnat_link.wait_for(state="visible", timeout=10000)
        xnat_link.click(timeout=10000)
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/xnat/new")
        expect(page.locator("h1")).to_have_text("Add XNAT Data Source")
        xnat_instance_name = f"TEST_XNAT_{timestamp}"
        page.get_by_label("XNAT Instance Name").fill(xnat_instance_name)
        page.get_by_label("API Token").fill("dummy_xnat_token")
        page.get_by_label("Endpoint URL").fill("https://xnat.example.com")
        page.get_by_label("Subject ID Variable").fill("subject_id")
        page.get_by_role("button", name="Create XNAT Data Source").click(timeout=10000)
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/xnat/{xnat_instance_name}")
        expect(page.get_by_text(xnat_instance_name, exact=True)).to_be_visible()
        expect(page.get_by_text("https://xnat.example.com")).to_be_visible()
        print(f"Test passed: Successfully added XNAT data source '{xnat_instance_name}'")
    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_add_xnat_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_add_xnat_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    finally:
        if project_id:
            print(f"Cleaning up project {project_id}, site {site_id}, and XNAT data source {xnat_instance_name}.")
            delete_entity("xnat_data_source", project_id=project_id, site_id=site_id, instance_name=xnat_instance_name)
            delete_entity("site", project_id=project_id, site_id=site_id)
            delete_entity("project", project_id=project_id)

def test_add_sharepoint_data_source(page: Page):
    """
    Tests adding a SharePoint data source to a new site.
    """
    project_id = None
    site_id = None
    sharepoint_instance_name = None
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        project_id = f"TEST_PROJ_SHAREPOINT_{timestamp}"
        project_name = f"Test Project for SharePoint - {timestamp}"
        project_description = f"Description for {project_name}"
        site_id = f"TEST_SITE_SHAREPOINT_{timestamp}"
        site_name = f"Test Site for SharePoint - {timestamp}"
        site_description = f"Description for {site_name}"
        login(page)
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
        # Add SharePoint Data Source
        page.goto(f"http://localhost:3000/config/projects/{project_id}/sites/{site_id}")
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        expect(page.get_by_role("link", name=project_id)).to_be_visible()
        expect(page.get_by_role("link", name=site_id)).to_be_visible()
        add_data_source_btn = page.get_by_role("button", name="Add Data Source")
        add_data_source_btn.wait_for(state="visible", timeout=10000)
        add_data_source_btn.click(timeout=10000)
        sharepoint_link = page.get_by_role("link", name="SharePoint")
        sharepoint_link.wait_for(state="visible", timeout=10000)
        sharepoint_link.click(timeout=10000)
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/sharepoint/new")
        expect(page.locator("h1")).to_have_text("Add SharePoint Data Source")
        sharepoint_instance_name = f"TEST_SHAREPOINT_{timestamp}"
        page.get_by_label("SharePoint Instance Name").fill(sharepoint_instance_name)
        page.get_by_label("Keystore Name").fill("sharepoint_prod")
        page.get_by_label("Site URL").fill("https://yourcompany.sharepoint.com/sites/TestTeam")
        page.get_by_label("Form ID").fill("00000000-0000-0000-0000-000000000000")
        page.get_by_role("button", name="Create SharePoint Data Source").click(timeout=10000)
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/sharepoint/{sharepoint_instance_name}")
        expect(page.get_by_text(sharepoint_instance_name, exact=True)).to_be_visible()
        expect(page.get_by_text("https://yourcompany.sharepoint.com/sites/TestTeam")).to_be_visible()
        print(f"Test passed: Successfully added SharePoint data source '{sharepoint_instance_name}'")
    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_add_sharepoint_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_add_sharepoint_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    finally:
        if project_id:
            print(f"Cleaning up project {project_id}, site {site_id}, and SharePoint data source {sharepoint_instance_name}.")
            delete_entity("sharepoint_data_source", project_id=project_id, site_id=site_id, instance_name=sharepoint_instance_name)
            delete_entity("site", project_id=project_id, site_id=site_id)
            delete_entity("project", project_id=project_id)

def test_add_mindlamp_data_source(page: Page):
    """
    Tests adding a MindLAMP data source to a new site.
    """
    project_id = None
    site_id = None
    mindlamp_instance_name = None
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        project_id = f"TEST_PROJ_MINDLAMP_{timestamp}"
        project_name = f"Test Project for MindLAMP - {timestamp}"
        project_description = f"Description for {project_name}"
        site_id = f"TEST_SITE_MINDLAMP_{timestamp}"
        site_name = f"Test Site for MindLAMP - {timestamp}"
        site_description = f"Description for {site_name}"
        login(page)
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
        # Add MindLAMP Data Source
        page.goto(f"http://localhost:3000/config/projects/{project_id}/sites/{site_id}")
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}")
        expect(page.get_by_role("link", name=project_id)).to_be_visible()
        expect(page.get_by_role("link", name=site_id)).to_be_visible()
        add_data_source_btn = page.get_by_role("button", name="Add Data Source")
        add_data_source_btn.wait_for(state="visible", timeout=10000)
        add_data_source_btn.click(timeout=10000)
        mindlamp_link = page.get_by_role("link", name="MindLAMP")
        mindlamp_link.wait_for(state="visible", timeout=10000)
        mindlamp_link.click(timeout=10000)
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/mindlamp/new")
        expect(page.locator("h1")).to_have_text("Add MindLAMP Data Source")
        mindlamp_instance_name = f"TEST_MINDLAMP_{timestamp}"
        page.get_by_label("MindLAMP Instance Name").fill(mindlamp_instance_name)
        page.get_by_label("API URL").fill("https://api.mindlamp.com")
        page.get_by_label("API Key").fill("dummy_mindlamp_key")
        page.get_by_label("Project ID").fill("test_mindlamp_project")
        page.get_by_role("button", name="Create MindLAMP Data Source").click(timeout=10000)
        page.wait_for_url(f"**/config/projects/{project_id}/sites/{site_id}/data-sources/mindlamp/{mindlamp_instance_name}")
        expect(page.get_by_text(mindlamp_instance_name, exact=True)).to_be_visible()
        expect(page.get_by_text("https://api.mindlamp.com")).to_be_visible()
        print(f"Test passed: Successfully added MindLAMP data source '{mindlamp_instance_name}'")
    except TimeoutError as e:
        print(f"Test failed due to timeout: {e}")
        page.screenshot(path=f"test_add_mindlamp_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    except Exception as e:
        print(f"Test failed: {e}")
        page.screenshot(path=f"test_add_mindlamp_data_source_failure_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png")
        raise
    finally:
        if project_id:
            print(f"Cleaning up project {project_id}, site {site_id}, and MindLAMP data source {mindlamp_instance_name}.")
            delete_entity("mindlamp_data_source", project_id=project_id, site_id=site_id, instance_name=mindlamp_instance_name)
            delete_entity("site", project_id=project_id, site_id=site_id)
            delete_entity("project", project_id=project_id) 