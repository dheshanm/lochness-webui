# Playwright End-to-End Testing

This document outlines how to run and understand the Playwright end-to-end (E2E) tests for the `lochness-webui` application.

## Overview

Our E2E tests use [Playwright](https://playwright.dev/) with [pytest](https://docs.pytest.org/) to simulate user interactions with the `lochness-webui` application running in a browser. Each test is designed to be self-contained, creating its own necessary data (e.g., projects, sites, data sources) and cleaning it up afterwards.

## Prerequisites

Before running the tests, ensure you have:

1.  **Python 3.8+** installed.
2.  **`lochness-webui` server running:** The web application must be accessible at `http://localhost:3000`.
    ```bash
    cd /Users/kc244/lochness_new/lochness-webui
    npm run dev
    ```
3.  **Playwright and pytest installed:**
    ```bash
    /Users/kc244/miniforge3/bin/python -m pip install playwright pytest pytest-playwright requests
    /Users/kc244/miniforge3/bin/playwright install
    ```
4.  **REDCap API Token:** For tests involving REDCap data sources, a `.redcap_cred` file (or similar mechanism) containing a valid REDCap API token is required. This token is used by the tests to interact with the REDCap API. The token is accessed via `REDCAP_API_TOKEN` in `tests/utils.py`.

## Test Structure

Tests are located in the `tests/` directory within the `lochness-webui` project. Each major functionality has its own dedicated test file:

*   `tests/test_lochness_webui_title.py`: Verifies the main page title.
*   `tests/test_login.py`: Tests user login functionality.
*   `tests/test_add_new_project.py`: Tests creating a new project.
*   `tests/test_add_new_site.py`: Tests creating a new site within a project.
*   `tests/test_add_redcap_data_source.py`: Tests adding a REDCap data source to a site.
*   `tests/test_delete_entities.py`: Tests deleting projects and sites.

### Utility Files

*   `tests/utils.py`: Contains shared functions like `login()` and `delete_entity()`.
*   `tests/shared_data.py`: A simple mechanism to pass data (like created project/site IDs) between test steps within a single test run, or for debugging purposes.

## Running Tests

To run a specific test, navigate to the `lochness-webui` directory and use `pytest`:

```bash
cd /Users/kc244/lochness_new/lochness-webui
/Users/kc244/miniforge3/bin/pytest tests/test_login.py
```

To run all tests:

```bash
cd /Users/kc244/lochness_new/lochness-webui
/Users/kc244/miniforge3/bin/pytest tests/
```

### Debugging Tests

If a test fails, Playwright can provide valuable debugging information:

*   **Screenshots:** Tests are configured to take screenshots on failure, saved in the `lochness-webui` directory (e.g., `test_add_new_project_failure_YYYYMMDDHHMMSS.png`).
*   **Verbose Output:** Run `pytest` with the `-s` flag to see `print()` statements from your tests:
    ```bash
    /Users/kc244/miniforge3/bin/pytest tests/test_add_redcap_data_source.py -s
    ```
*   **Headed Mode:** To see the browser UI during test execution, set `headless=False` in your `pytest.ini` or pass `--headed` to pytest:
    ```bash
    /Users/kc244/miniforge3/bin/pytest tests/test_login.py --headed
    ```

## Cleanup Strategy

Each test that creates entities (projects, sites, data sources) is designed to clean up its own created data using API calls in a `finally` block. This ensures that your database remains clean after test runs, regardless of whether the test passes or fails.

**Note on API Cleanup:** The `delete_entity` function in `tests/utils.py` attempts to delete entities via API calls. For this to work, the `lochness-webui` API must be configured to accept `DELETE` requests and handle authentication correctly. If you encounter `405 Method Not Allowed` or authentication errors during cleanup, it indicates an issue with the API's configuration or the authentication mechanism used by the `requests` library in `delete_entity`.