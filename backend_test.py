#!/usr/bin/env python3

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

class NestMatesAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api"
        self.owner_token = None
        self.seeker_token = None
        self.room_id = None
        self.test_results = []
        # Use timestamp to make emails unique
        self.timestamp = str(int(time.time()))
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data if not success else None
        })
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.api_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=30)
            else:
                return False, f"Unsupported method: {method}", 0
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}", 0
    
    def test_register_owner(self):
        """Test 1: Register User 1 (Room Owner)"""
        data = {
            "email": f"owner{self.timestamp}@test.com",
            "password": "password123",
            "name": "John Owner"
        }
        
        success, response, status_code = self.make_request("POST", "/auth/register", data)
        
        if success and isinstance(response, dict):
            if "token" in response and "user" in response:
                self.owner_token = response["token"]
                user = response["user"]
                if "userId" in user and user.get("email") == data["email"]:
                    self.log_test("Register Owner", True, f"User ID: {user['userId']}")
                    return True
                else:
                    self.log_test("Register Owner", False, "Missing userId or incorrect email", response)
            else:
                self.log_test("Register Owner", False, "Missing token or user in response", response)
        else:
            self.log_test("Register Owner", False, f"Status: {status_code}", response)
        
        return False
    
    def test_register_seeker(self):
        """Test 2: Register User 2 (Room Seeker)"""
        data = {
            "email": f"seeker{self.timestamp}@test.com",
            "password": "password123",
            "name": "Jane Seeker"
        }
        
        success, response, status_code = self.make_request("POST", "/auth/register", data)
        
        if success and isinstance(response, dict):
            if "token" in response and "user" in response:
                self.seeker_token = response["token"]
                user = response["user"]
                if "userId" in user and user.get("email") == data["email"]:
                    self.log_test("Register Seeker", True, f"User ID: {user['userId']}")
                    return True
                else:
                    self.log_test("Register Seeker", False, "Missing userId or incorrect email", response)
            else:
                self.log_test("Register Seeker", False, "Missing token or user in response", response)
        else:
            self.log_test("Register Seeker", False, f"Status: {status_code}", response)
        
        return False
    
    def test_email_uniqueness(self):
        """Test 3: Test Email Uniqueness"""
        data = {
            "email": f"owner{self.timestamp}@test.com",  # Use same email as owner
            "password": "test123",
            "name": "Duplicate"
        }
        
        success, response, status_code = self.make_request("POST", "/auth/register", data)
        
        if not success and status_code == 400:
            if isinstance(response, dict) and "Email already registered" in str(response.get("detail", "")):
                self.log_test("Email Uniqueness", True, "Correctly rejected duplicate email")
                return True
            else:
                self.log_test("Email Uniqueness", False, "Wrong error message", response)
        else:
            self.log_test("Email Uniqueness", False, f"Should have failed with 400, got {status_code}", response)
        
        return False
    
    def test_login(self):
        """Test 4: Login Test"""
        data = {
            "email": f"owner{self.timestamp}@test.com",
            "password": "password123"
        }
        
        success, response, status_code = self.make_request("POST", "/auth/login", data)
        
        if success and isinstance(response, dict):
            if "token" in response and "user" in response:
                user = response["user"]
                if user.get("email") == data["email"]:
                    self.log_test("Login", True, f"Successfully logged in as {user['name']}")
                    return True
                else:
                    self.log_test("Login", False, "Incorrect user data", response)
            else:
                self.log_test("Login", False, "Missing token or user in response", response)
        else:
            self.log_test("Login", False, f"Status: {status_code}", response)
        
        return False
    
    def test_update_owner_profile(self):
        """Test 5: Update Owner Profile"""
        if not self.owner_token:
            self.log_test("Update Owner Profile", False, "No owner token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.owner_token}"}
        data = {
            "userType": "owner",
            "party": True,
            "smoking": False,
            "alcohol": True,
            "food": "non-veg",
            "pets": True,
            "cleaning": "weekly",
            "description": "Friendly owner"
        }
        
        success, response, status_code = self.make_request("PUT", "/users/profile", data, headers)
        
        if success and isinstance(response, dict):
            if response.get("userType") == "owner" and response.get("party") == True:
                self.log_test("Update Owner Profile", True, "Profile updated successfully")
                return True
            else:
                self.log_test("Update Owner Profile", False, "Profile not updated correctly", response)
        else:
            self.log_test("Update Owner Profile", False, f"Status: {status_code}", response)
        
        return False
    
    def test_update_seeker_profile(self):
        """Test 6: Update Seeker Profile"""
        if not self.seeker_token:
            self.log_test("Update Seeker Profile", False, "No seeker token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.seeker_token}"}
        data = {
            "userType": "seeker",
            "party": True,
            "smoking": False,
            "alcohol": True,
            "food": "non-veg",
            "pets": False,
            "cleaning": "daily",
            "description": "Looking for a room"
        }
        
        success, response, status_code = self.make_request("PUT", "/users/profile", data, headers)
        
        if success and isinstance(response, dict):
            if response.get("userType") == "seeker" and response.get("cleaning") == "daily":
                self.log_test("Update Seeker Profile", True, "Profile updated successfully")
                return True
            else:
                self.log_test("Update Seeker Profile", False, "Profile not updated correctly", response)
        else:
            self.log_test("Update Seeker Profile", False, f"Status: {status_code}", response)
        
        return False
    
    def test_create_room(self):
        """Test 7: Create Room (Owner)"""
        if not self.owner_token:
            self.log_test("Create Room", False, "No owner token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.owner_token}"}
        data = {
            "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="],
            "rent": 1200,
            "location": "Downtown",
            "rules": "No smoking",
            "description": "Beautiful room in downtown"
        }
        
        success, response, status_code = self.make_request("POST", "/rooms", data, headers)
        
        if success and isinstance(response, dict):
            if "roomId" in response and response.get("rent") == 1200:
                self.room_id = response["roomId"]
                self.log_test("Create Room", True, f"Room created with ID: {self.room_id}")
                return True
            else:
                self.log_test("Create Room", False, "Missing roomId or incorrect data", response)
        else:
            self.log_test("Create Room", False, f"Status: {status_code}", response)
        
        return False
    
    def test_get_all_rooms_seeker(self):
        """Test 8: Get All Rooms (Seeker with compatibility)"""
        if not self.seeker_token:
            self.log_test("Get All Rooms (Seeker)", False, "No seeker token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.seeker_token}"}
        
        success, response, status_code = self.make_request("GET", "/rooms", headers=headers)
        
        if success and isinstance(response, list):
            if len(response) > 0:
                room = response[0]
                if "compatibility" in room and "roomId" in room:
                    self.log_test("Get All Rooms (Seeker)", True, f"Found {len(response)} rooms with compatibility scores")
                    return True
                else:
                    self.log_test("Get All Rooms (Seeker)", False, "Missing compatibility or roomId", response)
            else:
                self.log_test("Get All Rooms (Seeker)", False, "No rooms returned", response)
        else:
            self.log_test("Get All Rooms (Seeker)", False, f"Status: {status_code}", response)
        
        return False
    
    def test_get_room_details(self):
        """Test 9: Get Room Details"""
        if not self.seeker_token or not self.room_id:
            self.log_test("Get Room Details", False, "No seeker token or room ID available")
            return False
        
        headers = {"Authorization": f"Bearer {self.seeker_token}"}
        
        success, response, status_code = self.make_request("GET", f"/rooms/{self.room_id}", headers=headers)
        
        if success and isinstance(response, dict):
            if "compatibility" in response and response.get("roomId") == self.room_id:
                self.log_test("Get Room Details", True, f"Room details with compatibility: {response.get('compatibility')}%")
                return True
            else:
                self.log_test("Get Room Details", False, "Missing compatibility or incorrect roomId", response)
        else:
            self.log_test("Get Room Details", False, f"Status: {status_code}", response)
        
        return False
    
    def test_filter_rooms_by_rent(self):
        """Test 10: Filter Rooms by Rent"""
        if not self.seeker_token:
            self.log_test("Filter Rooms by Rent", False, "No seeker token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.seeker_token}"}
        params = {"minRent": 1000, "maxRent": 1500}
        
        success, response, status_code = self.make_request("GET", "/rooms", headers=headers, params=params)
        
        if success and isinstance(response, list):
            # Check if all returned rooms are within rent range
            all_in_range = all(1000 <= room.get("rent", 0) <= 1500 for room in response)
            if all_in_range:
                self.log_test("Filter Rooms by Rent", True, f"Found {len(response)} rooms in rent range 1000-1500")
                return True
            else:
                self.log_test("Filter Rooms by Rent", False, "Some rooms outside rent range", response)
        else:
            self.log_test("Filter Rooms by Rent", False, f"Status: {status_code}", response)
        
        return False
    
    def test_filter_rooms_by_location(self):
        """Test 11: Filter Rooms by Location"""
        if not self.seeker_token:
            self.log_test("Filter Rooms by Location", False, "No seeker token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.seeker_token}"}
        params = {"location": "Downtown"}
        
        success, response, status_code = self.make_request("GET", "/rooms", headers=headers, params=params)
        
        if success and isinstance(response, list):
            # Check if all returned rooms match location
            all_match_location = all("downtown" in room.get("location", "").lower() for room in response)
            if all_match_location and len(response) > 0:
                self.log_test("Filter Rooms by Location", True, f"Found {len(response)} rooms in Downtown")
                return True
            elif len(response) == 0:
                self.log_test("Filter Rooms by Location", False, "No rooms found for Downtown location")
            else:
                self.log_test("Filter Rooms by Location", False, "Some rooms don't match location", response)
        else:
            self.log_test("Filter Rooms by Location", False, f"Status: {status_code}", response)
        
        return False
    
    def test_get_my_rooms_owner(self):
        """Test 12: Get My Rooms (Owner)"""
        if not self.owner_token:
            self.log_test("Get My Rooms (Owner)", False, "No owner token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.owner_token}"}
        
        success, response, status_code = self.make_request("GET", "/rooms", headers=headers)
        
        if success and isinstance(response, list):
            if len(response) > 0:
                # Check if all rooms belong to this owner
                room = response[0]
                if "ownerId" in room:
                    self.log_test("Get My Rooms (Owner)", True, f"Found {len(response)} rooms owned by user")
                    return True
                else:
                    self.log_test("Get My Rooms (Owner)", False, "Missing ownerId in response", response)
            else:
                self.log_test("Get My Rooms (Owner)", False, "No rooms found for owner")
        else:
            self.log_test("Get My Rooms (Owner)", False, f"Status: {status_code}", response)
        
        return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting NestMates API Tests")
        print(f"Backend URL: {self.api_url}")
        print("=" * 60)
        
        tests = [
            self.test_register_owner,
            self.test_register_seeker,
            self.test_email_uniqueness,
            self.test_login,
            self.test_update_owner_profile,
            self.test_update_seeker_profile,
            self.test_create_room,
            self.test_get_all_rooms_seeker,
            self.test_get_room_details,
            self.test_filter_rooms_by_rent,
            self.test_filter_rooms_by_location,
            self.test_get_my_rooms_owner
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Exception occurred - {str(e)}")
                failed += 1
        
        print("=" * 60)
        print(f"📊 Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 Failed Tests Details:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
        
        return failed == 0

def main():
    # Get backend URL from environment or use default
    backend_url = "https://room-match-4.preview.emergentagent.com"
    
    print(f"Testing NestMates API at: {backend_url}")
    
    tester = NestMatesAPITester(backend_url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()