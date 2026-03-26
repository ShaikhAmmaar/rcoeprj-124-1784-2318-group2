# NestMates - Roommate & Room Finding App

A modern mobile application built with Expo/React Native that helps users find rooms and compatible roommates based on lifestyle preferences.

## 🎯 Features

### Authentication
- Email/password registration and login
- Unique email constraint
- JWT-based authentication
- Persistent login sessions

### User Types
1. **Room Owner**
   - Upload room listings with multiple images (up to 10)
   - Manage room details (rent, location, rules, description)
   - View all your room listings

2. **Room Seeker**
   - Browse available rooms
   - Filter rooms by rent range and location
   - View compatibility scores with room owners
   - See detailed room information

### Profile System
- Lifestyle preferences:
  - Party, Smoking, Alcohol, Pets (Yes/No)
  - Food preference (Veg/Non-Veg/Vegan)
  - Cleaning habits (Daily/Weekly/Rarely)
  - Personal description

### Matching Algorithm
- Simple percentage-based compatibility scoring
- Compares lifestyle preferences between seekers and owners
- Displayed on room cards and detail pages

## 🛠️ Tech Stack

**Frontend:**
- Expo (React Native)
- React Navigation
- Zustand (State Management)
- Axios (API calls)
- Expo Image Picker
- AsyncStorage

**Backend:**
- FastAPI (Python)
- MongoDB
- JWT Authentication
- bcrypt (Password hashing)

## 📱 Screens

1. **Splash Screen** - App logo and loading
2. **Auth Screen** - Login/Signup toggle
3. **User Type Selection** - Choose Owner or Seeker
4. **Profile Setup** - Set lifestyle preferences
5. **Home Screen** - Browse rooms (different for Owner vs Seeker)
6. **Add Room** - Upload new room listing (Owner only)
7. **Room Details** - View room info with compatibility
8. **Profile** - View/manage user profile

## 🎨 Design

**Color Palette:**
- Primary: #1E8E9E (Teal)
- Background: #F5F7FA (Light Grey)
- Text Primary: #1A1A1A
- Text Secondary: #6B7280

**UI Style:**
- Modern, clean, minimal design
- Card-based layout
- Rounded corners (12-16px)
- Soft shadows
- Smooth animations

## 🚀 Getting Started

### Backend
The FastAPI backend is running on port 8001 with the following endpoints:

**Auth:**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

**User:**
- GET `/api/users/me` - Get current user
- PUT `/api/users/profile` - Update user profile

**Rooms:**
- POST `/api/rooms` - Create room (Owner only)
- GET `/api/rooms` - Get all rooms (with filters)
- GET `/api/rooms/{id}` - Get room details

### Frontend
The Expo app is accessible at:
- Web Preview: https://room-match-4.preview.emergentagent.com
- Mobile: Scan QR code with Expo Go app

## 📊 Database Schema

**Users Collection:**
```
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  name: string,
  userType: "owner" | "seeker",
  party: boolean,
  smoking: boolean,
  alcohol: boolean,
  food: "veg" | "non-veg" | "vegan",
  pets: boolean,
  cleaning: "daily" | "weekly" | "rarely",
  description: string
}
```

**Rooms Collection:**
```
{
  _id: ObjectId,
  ownerId: string,
  ownerName: string,
  images: string[] (base64),
  rent: number,
  location: string,
  rules: string,
  description: string,
  createdAt: datetime
}
```

## ✅ Tested & Working

- ✅ User registration with unique email validation
- ✅ User login/logout
- ✅ Profile setup and updates
- ✅ Room creation with image upload (base64)
- ✅ Room listing with filters
- ✅ Compatibility matching calculation
- ✅ JWT authentication on all protected routes
- ✅ Owner can only see their rooms
- ✅ Seeker can browse all rooms with compatibility scores

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Protected API endpoints
- Email uniqueness constraint

## 📝 Notes

- Images are stored as base64 in MongoDB
- Maximum 10 images per room listing
- Compatibility calculated based on 6 lifestyle factors
- Mobile-first responsive design
