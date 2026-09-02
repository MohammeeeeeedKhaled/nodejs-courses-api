# 📚 Nodejs Courses API

A RESTful API built with **Node.js**, **Express**, and **MongoDB (Mongoose)** for managing online courses and users with JWT authentication and role-based access control.

🌐 **Live Demo:** [https://nodejs-courses-api-rjzx.onrender.com](https://nodejs-courses-api-rjzx.onrender.com)

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Server & routing |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Multer | Image/file uploads |
| express-validator | Input validation |
| dotenv | Environment variables |
| cors | Cross-Origin support |

---

## 📁 Project Structure

```
nodejs-courses-api/
├── controllers/
│   ├── courses.controller.js
│   └── users.controller.js
├── middleware/
│   ├── allowedTo.js        # Role-based authorization
│   ├── asyncWrapper.js     # Async error handler
│   ├── middlewareSchema.js # Validation schemas
│   └── verifyToken.js      # JWT verification
├── models/
│   ├── course.model.js
│   └── user.model.js
├── routes/
│   ├── courses.route.js
│   └── users.route.js
├── utils/
│   ├── appError.js
│   ├── generateJwt.js
│   ├── httpStatusText.js
│   └── user.roles.js
├── uploads/               # Uploaded user avatars
├── index.js               # App entry point
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
```

---

## 🔐 Authentication & Authorization

This API uses **JWT (JSON Web Token)** for authentication.

- After **register** or **login**, you receive a `token`.
- Include it in protected request headers:

```
Authorization: Bearer <your_token>
```

### User Roles

| Role | Permissions |
|---|---|
| `USER` | Read courses, view profile |
| `MANAGER` | Create & delete courses |
| `ADMIN` | Delete courses |

---

## 📡 API Endpoints

### Base URL

```
https://nodejs-courses-api-rjzx.onrender.com
```

---

## 👤 Users Routes

### `POST /api/users/register`

Register a new user with an avatar image.

**Auth required:** ❌ No

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | String | ✅ | User's first name |
| `lastName` | String | ✅ | User's last name |
| `email` | String | ✅ | Must be a valid, unique email |
| `password` | String | ✅ | User's password (will be hashed) |
| `role` | String | ❌ | `USER`, `MANAGER`, or `ADMIN` (default: `USER`) |
| `avatar` | File | ✅ | Profile image (jpg, jpeg, png, gif, webp) |

**Response:** `200 OK`

```json
{
  "status": "SUCCESS",
  "data": {
    "user": {
      "_id": "64abc...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "password": "$2a$10$hashedpassword...",
      "role": "USER",
      "avatar": "user-1234567890.jpg",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Email already exists |
| `400` | Invalid file type (non-image) |

---

### `POST /api/users/login`

Login with email and password.

**Auth required:** ❌ No

**Request:** `application/json`

```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response:** `200 OK`

```json
{
  "status": "SUCCESS",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Invalid email or password |

---

### `GET /api/users`

Get a paginated list of all users.

**Auth required:** ✅ Yes (any authenticated user)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | Number | `1` | Page number |
| `limit` | Number | `10` | Results per page |

**Response:** `200 OK`

```json
{
  "status": "SUCCESS",
  "data": {
    "users": [
      {
        "_id": "64abc...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "USER",
        "avatar": "user-1234567890.jpg",
        "token": "..."
      }
    ]
  }
}
```

> **Note:** `password` field is excluded from the response.

**Error Responses:**

| Status | Reason |
|---|---|
| `401` | Token is required or invalid |

---

## 📘 Courses Routes

### `GET /api/courses`

Get a paginated list of all courses.

**Auth required:** ❌ No

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | Number | `1` | Page number |
| `limit` | Number | `10` | Results per page |

**Response:** `200 OK`

```json
{
  "status": "SUCCESS",
  "data": {
    "courses": [
      {
        "_id": "64xyz...",
        "name": "Node.js Masterclass",
        "price": 99
      }
    ]
  }
}
```

---

### `POST /api/courses`

Create a new course.

**Auth required:** ✅ Yes
**Allowed roles:** `MANAGER` only

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:** `application/json`

```json
{
  "name": "Node.js Masterclass",
  "price": 99
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| `name` | Required, minimum 3 characters |
| `price` | Required |

**Response:** `201 Created`

```json
{
  "status": "SUCCESS",
  "data": {
    "course": {
      "_id": "64xyz...",
      "name": "Node.js Masterclass",
      "price": 99
    }
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `400` | Validation error (name/price missing or invalid) |
| `401` | Token missing, invalid, or role not authorized |

---

### `GET /api/courses/:courseId`

Get a single course by ID.

**Auth required:** ❌ No

**URL Params:**

| Param | Description |
|---|---|
| `courseId` | The MongoDB `_id` of the course |

**Response:** `200 OK`

```json
{
  "status": "SUCCESS",
  "data": {
    "course": {
      "_id": "64xyz...",
      "name": "Node.js Masterclass",
      "price": 99
    }
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `404` | Course not found |

---

### `PATCH /api/courses/:courseId`

Update an existing course (partial update).

**Auth required:** ❌ No

**URL Params:**

| Param | Description |
|---|---|
| `courseId` | The MongoDB `_id` of the course |

**Request Body:** `application/json` *(send only the fields to update)*

```json
{
  "price": 79
}
```

**Response:** `200 OK`

```json
{
  "status": "SUCCESS",
  "data": {
    "course": {
      "_id": "64xyz...",
      "name": "Node.js Masterclass",
      "price": 79
    }
  }
}
```

---

### `DELETE /api/courses/:courseId`

Delete a course by ID.

**Auth required:** ✅ Yes
**Allowed roles:** `ADMIN` or `MANAGER`

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Params:**

| Param | Description |
|---|---|
| `courseId` | The MongoDB `_id` of the course |

**Response:** `200 OK`

```json
{
  "status": "SUCCESS",
  "data": "null"
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| `401` | Token missing, invalid, or role not authorized |

---

## 🗂️ Data Models

### Course

```js
{
  _id:   ObjectId,   // Auto-generated
  name:  String,     // Required
  price: Number      // Required
}
```

### User

```js
{
  _id:       ObjectId,  // Auto-generated
  firstName: String,    // Required
  lastName:  String,    // Required
  email:     String,    // Required, unique, valid email format
  password:  String,    // Required, stored as bcrypt hash
  role:      String,    // "USER" | "MANAGER" | "ADMIN" (default: "USER")
  avatar:    String,    // Filename of uploaded image (default: "uploads/profile.jpg")
  token:     String     // JWT token stored on register
}
```

---

## ❌ Error Response Format

All errors follow this structure:

```json
{
  "status": "ERROR" | "FAIL",
  "message": "Description of the error",
  "code": 400,
  "data": null
}
```

| Status Text | Meaning |
|---|---|
| `SUCCESS` | Request completed successfully |
| `FAIL` | Client-side error (bad input, not found, etc.) |
| `ERROR` | Server-side or auth error |

---

## 🖼️ Static Files

Uploaded user avatars are served as static files:

```
GET /uploads/<filename>
```

**Example:**
```
https://nodejs-courses-api-rjzx.onrender.com/uploads/user-1234567890.jpg
```

---

## 🔧 Running Locally

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd nodejs-courses-api

# 2. Install dependencies
npm install

# 3. Create .env file
MONGO_URL=your_mongodb_url
JWT_SECRET_KEY=your_secret_key

# 4. Start the server
npm start
# Server runs on http://localhost:5000
```

---

## 📋 Routes Summary

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/courses` | ❌ | - | Get all courses (paginated) |
| `POST` | `/api/courses` | ✅ | MANAGER | Create a new course |
| `GET` | `/api/courses/:courseId` | ❌ | - | Get single course |
| `PATCH` | `/api/courses/:courseId` | ❌ | - | Update a course |
| `DELETE` | `/api/courses/:courseId` | ✅ | ADMIN, MANAGER | Delete a course |
| `GET` | `/api/users` | ✅ | Any | Get all users (paginated) |
| `POST` | `/api/users/register` | ❌ | - | Register new user |
| `POST` | `/api/users/login` | ❌ | - | Login user |
