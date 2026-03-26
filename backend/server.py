from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "nestmates-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ========== MODELS ==========

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    userType: str  # "owner" or "seeker"
    phoneNumber: str
    area: str  # Area/location where user lives
    images: List[str] = []  # Profile images for seekers
    party: bool = False
    smoking: bool = False
    alcohol: bool = False
    food: str = "veg"  # "veg", "non-veg", "vegan"
    pets: bool = False
    cleaning: str = "weekly"  # "daily", "weekly", "rarely"
    description: str = ""

class UserResponse(BaseModel):
    userId: str
    email: str
    name: str
    userType: Optional[str] = None
    phoneNumber: Optional[str] = ""
    area: Optional[str] = ""
    images: Optional[List[str]] = []
    party: Optional[bool] = False
    smoking: Optional[bool] = False
    alcohol: Optional[bool] = False
    food: Optional[str] = "veg"
    pets: Optional[bool] = False
    cleaning: Optional[str] = "weekly"
    description: Optional[str] = ""
    compatibility: Optional[int] = None

class RoomCreate(BaseModel):
    images: List[str]  # base64 encoded images
    rent: float
    location: str
    rules: str
    description: str

class RoomResponse(BaseModel):
    roomId: str
    ownerId: str
    ownerName: Optional[str] = ""
    ownerPhone: Optional[str] = ""
    images: List[str]
    rent: float
    location: str
    rules: str
    description: str
    createdAt: datetime
    compatibility: Optional[int] = None

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

# ========== HELPER FUNCTIONS ==========

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_compatibility(user1: dict, user2: dict) -> int:
    """Calculate compatibility percentage between two users"""
    if not user1.get('userType') or not user2.get('userType'):
        return 0
    
    matches = 0
    total = 0
    
    # Check boolean preferences
    for field in ['party', 'smoking', 'alcohol', 'pets']:
        if field in user1 and field in user2:
            total += 1
            if user1[field] == user2[field]:
                matches += 1
    
    # Check food preference
    if 'food' in user1 and 'food' in user2:
        total += 1
        if user1['food'] == user2['food']:
            matches += 1
    
    # Check cleaning preference
    if 'cleaning' in user1 and 'cleaning' in user2:
        total += 1
        if user1['cleaning'] == user2['cleaning']:
            matches += 1
    
    if total == 0:
        return 0
    
    return int((matches / total) * 100)

# ========== AUTH ROUTES ==========

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = {
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "userType": None,
        "phoneNumber": "",
        "area": "",
        "images": [],
        "party": False,
        "smoking": False,
        "alcohol": False,
        "food": "veg",
        "pets": False,
        "cleaning": "weekly",
        "description": "",
        "createdAt": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    # Create token
    token = create_access_token({"sub": str(result.inserted_id)})
    
    return {
        "token": token,
        "user": {
            "userId": str(result.inserted_id),
            "email": user_data.email,
            "name": user_data.name,
            "userType": None
        }
    }

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token({"sub": str(user["_id"])})
    
    return {
        "token": token,
        "user": {
            "userId": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "userType": user.get("userType"),
            "phoneNumber": user.get("phoneNumber", ""),
            "area": user.get("area", ""),
            "images": user.get("images", []),
            "party": user.get("party", False),
            "smoking": user.get("smoking", False),
            "alcohol": user.get("alcohol", False),
            "food": user.get("food", "veg"),
            "pets": user.get("pets", False),
            "cleaning": user.get("cleaning", "weekly"),
            "description": user.get("description", "")
        }
    }

# ========== USER ROUTES ==========

@api_router.get("/users/me", response_model=UserResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    
    return {
        "userId": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "userType": user.get("userType"),
        "phoneNumber": user.get("phoneNumber", ""),
        "area": user.get("area", ""),
        "images": user.get("images", []),
        "party": user.get("party", False),
        "smoking": user.get("smoking", False),
        "alcohol": user.get("alcohol", False),
        "food": user.get("food", "veg"),
        "pets": user.get("pets", False),
        "cleaning": user.get("cleaning", "weekly"),
        "description": user.get("description", "")
    }

@api_router.put("/users/profile", response_model=UserResponse)
async def update_profile(
    profile: UserProfile,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    user = await get_current_user(credentials)
    
    # Update user profile
    update_data = profile.dict()
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": user["_id"]})
    
    return {
        "userId": str(updated_user["_id"]),
        "email": updated_user["email"],
        "name": updated_user["name"],
        "userType": updated_user.get("userType"),
        "phoneNumber": updated_user.get("phoneNumber", ""),
        "area": updated_user.get("area", ""),
        "images": updated_user.get("images", []),
        "party": updated_user.get("party", False),
        "smoking": updated_user.get("smoking", False),
        "alcohol": updated_user.get("alcohol", False),
        "food": updated_user.get("food", "veg"),
        "pets": updated_user.get("pets", False),
        "cleaning": updated_user.get("cleaning", "weekly"),
        "description": updated_user.get("description", "")
    }

# ========== SEEKERS ROUTES ==========

@api_router.get("/seekers", response_model=List[UserResponse])
async def get_seekers(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    area: Optional[str] = None
):
    current_user = await get_current_user(credentials)
    
    # Build query - get all seekers except current user
    query = {
        "userType": "seeker",
        "_id": {"$ne": current_user["_id"]}
    }
    
    # Apply area filter if provided
    if area:
        query["area"] = {"$regex": area, "$options": "i"}
    
    seekers = await db.users.find(query).to_list(1000)
    
    result = []
    for seeker in seekers:
        seeker_data = {
            "userId": str(seeker["_id"]),
            "email": seeker["email"],
            "name": seeker["name"],
            "userType": seeker.get("userType"),
            "phoneNumber": seeker.get("phoneNumber", ""),
            "area": seeker.get("area", ""),
            "images": seeker.get("images", []),
            "party": seeker.get("party", False),
            "smoking": seeker.get("smoking", False),
            "alcohol": seeker.get("alcohol", False),
            "food": seeker.get("food", "veg"),
            "pets": seeker.get("pets", False),
            "cleaning": seeker.get("cleaning", "weekly"),
            "description": seeker.get("description", "")
        }
        
        # Calculate compatibility
        compatibility = calculate_compatibility(current_user, seeker)
        seeker_data["compatibility"] = compatibility
        
        result.append(seeker_data)
    
    return result

# ========== ROOM ROUTES ==========

@api_router.post("/rooms", response_model=RoomResponse)
async def create_room(
    room_data: RoomCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    user = await get_current_user(credentials)
    
    # Check if user is an owner
    if user.get("userType") != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can create rooms"
        )
    
    # Validate image count
    if len(room_data.images) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 images allowed per room"
        )
    
    room_dict = {
        "ownerId": str(user["_id"]),
        "ownerName": user.get("name", ""),
        "ownerPhone": user.get("phoneNumber", ""),
        "images": room_data.images,
        "rent": room_data.rent,
        "location": room_data.location,
        "rules": room_data.rules,
        "description": room_data.description,
        "createdAt": datetime.utcnow()
    }
    
    result = await db.rooms.insert_one(room_dict)
    room_dict["_id"] = result.inserted_id
    
    return {
        "roomId": str(result.inserted_id),
        "ownerId": room_dict["ownerId"],
        "ownerName": room_dict["ownerName"],
        "ownerPhone": room_dict["ownerPhone"],
        "images": room_dict["images"],
        "rent": room_dict["rent"],
        "location": room_dict["location"],
        "rules": room_dict["rules"],
        "description": room_dict["description"],
        "createdAt": room_dict["createdAt"]
    }

@api_router.get("/rooms", response_model=List[RoomResponse])
async def get_rooms(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    minRent: Optional[float] = None,
    maxRent: Optional[float] = None,
    location: Optional[str] = None
):
    user = await get_current_user(credentials)
    
    # Build query
    query = {}
    
    # If user is owner, show only their rooms
    if user.get("userType") == "owner":
        query["ownerId"] = str(user["_id"])
    
    # Apply filters
    if minRent is not None or maxRent is not None:
        query["rent"] = {}
        if minRent is not None:
            query["rent"]["$gte"] = minRent
        if maxRent is not None:
            query["rent"]["$lte"] = maxRent
    
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    rooms = await db.rooms.find(query).sort("createdAt", -1).to_list(1000)
    
    result = []
    for room in rooms:
        room_data = {
            "roomId": str(room["_id"]),
            "ownerId": room["ownerId"],
            "ownerName": room.get("ownerName", ""),
            "ownerPhone": room.get("ownerPhone", ""),
            "images": room["images"],
            "rent": room["rent"],
            "location": room["location"],
            "rules": room["rules"],
            "description": room["description"],
            "createdAt": room["createdAt"]
        }
        
        # Calculate compatibility if user is a seeker
        if user.get("userType") == "seeker":
            owner = await db.users.find_one({"_id": ObjectId(room["ownerId"])})
            if owner:
                room_data["compatibility"] = calculate_compatibility(user, owner)
        
        result.append(room_data)
    
    return result

@api_router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    user = await get_current_user(credentials)
    
    try:
        room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    except:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room_data = {
        "roomId": str(room["_id"]),
        "ownerId": room["ownerId"],
        "ownerName": room.get("ownerName", ""),
        "ownerPhone": room.get("ownerPhone", ""),
        "images": room["images"],
        "rent": room["rent"],
        "location": room["location"],
        "rules": room["rules"],
        "description": room["description"],
        "createdAt": room["createdAt"]
    }
    
    # Calculate compatibility if user is a seeker
    if user.get("userType") == "seeker":
        owner = await db.users.find_one({"_id": ObjectId(room["ownerId"])})
        if owner:
            room_data["compatibility"] = calculate_compatibility(user, owner)
    
    return room_data

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
