#!/usr/bin/env python3
"""
Test script to verify keystore API functionality.
"""

import requests
import json

def test_keystore_api():
    """Test the keystore API endpoint."""
    
    # Test without authentication (should return 401)
    print("Testing keystore API without authentication...")
    response = requests.get("http://localhost:3000/api/v1/keystore?project_id=ProCAN_WEB")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Test with authentication (you'll need to get a session cookie)
    print("To test with authentication, you need to:")
    print("1. Log in to the webui at http://localhost:3000")
    print("2. Get the session cookie from your browser")
    print("3. Use the cookie in the request")
    print()
    
    # Check if the server is running
    try:
        response = requests.get("http://localhost:3000")
        print(f"Server is running: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("Server is not running. Please start it with 'npm run dev'")

if __name__ == "__main__":
    test_keystore_api() 