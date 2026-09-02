# 📚 Nodejs Courses API

A RESTful API built with **Node.js**, **Express**, and **MongoDB (Mongoose)** for managing online courses and users with JWT authentication and role-based access control.

🌐 **Live Demo:** [https://nodejs-courses-api-rjzx.onrender.com](https://nodejs-courses-api-rjzx.onrender.com)

---

## 🚀 Tech Stack

| Technology         | Purpose               |
| ------------------ | --------------------- |
| Node.js + Express  | Server & routing      |
| MongoDB + Mongoose | Database & ODM        |
| JWT (jsonwebtoken) | Authentication        |
| bcryptjs           | Password hashing      |
| Multer             | Image/file uploads    |
| express-validator  | Input validation      |
| dotenv             | Environment variables |
| cors               | Cross-Origin support  |

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

### 🔑 How to generate `JWT_SECRET_KEY`

The `JWT_SECRET_KEY` is any random secret string used to sign and verify tokens. You can generate one using any of these methods:

**Option 1 — Node.js (recommended):**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2 — Online generator:**
Go to [https://generate-secret.vercel.app/64](https://generate-secret.vercel.app/64) and copy the generated key.

**Option 3 — Write your own string** _(not recommended for production)_:

```env
JWT_SECRET_KEY=my_super_secret_key_123
```

Then paste the result in `.env`:

```env
JWT_SECRET_KEY=a3f9c2e1d7b4e8a2c6f0d1e5b9c3a7f2e4d8b6c0a1e3d5f7b2c4a6e8d0f1b3...
```

> ⚠️ **Never share or commit your `.env` file to GitHub.** Make sure `.env` is listed in `.gitignore`.

### 🍃 How to get `MONGO_URL`

Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Create a cluster → Connect → **Drivers** → Copy the connection string:

```env
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
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

| Role      | Permissions                                                              |
| --------- | ------------------------------------------------------------------------ |
| `USER`    | Login, Register, View courses only                                       |
| `MANAGER` | All USER permissions + Create / Update / Delete courses + View all users |
| `ADMIN`   | All MANAGER permissions                                                  |

> 🔒 **Note:** When registering, the role is always set to `USER` automatically. `ADMIN` and `MANAGER` roles must be assigned manually from the database.

---

## 🔑 How JWT is Generated

The API generates a JWT token automatically during **register** and **login** using the `generateJwt` utility.

### Token Payload

The token encodes the following user data:

```json
{
  "email": "john@example.com",
  "id": "64abc...",
  "role": "USER"
}
```

### Token Settings

| Property   | Value                        |
| ---------- | ---------------------------- |
| Algorithm  | `HS256` (default)            |
| Secret Key | `JWT_SECRET_KEY` from `.env` |
| Expiry     | `1 day` (`expiresIn: '1d'`)  |

### How it Works (Flow)

```
User registers / logs in
        ↓
Server collects → { email, id, role }
        ↓
jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1d' })
        ↓
Token returned to client
        ↓
Client sends: Authorization: Bearer <token>
        ↓
verifyToken middleware → jwt.verify(token, JWT_SECRET_KEY)
        ↓
Request is allowed ✅ or rejected ❌
```

### generateJwt Utility (source)

```js
const jwt = require("jsonwebtoken");

module.exports = async (payload) => {
  const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return token;
};
```

> ℹ️ **Note:** The token expires after **1 day**. You must login again to get a new token.

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

| Field       | Type   | Required | Description                               |
| ----------- | ------ | -------- | ----------------------------------------- |
| `firstName` | String | ✅       | User's first name                         |
| `lastName`  | String | ✅       | User's last name                          |
| `email`     | String | ✅       | Must be a valid, unique email             |
| `password`  | String | ✅       | User's password (will be hashed)          |
| `avatar`    | File   | ✅       | Profile image (jpg, jpeg, png, gif, webp) |

> 🔒 `role` is always set to `USER` automatically — you cannot register as `ADMIN` or `MANAGER`.

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

| Status | Reason                        |
| ------ | ----------------------------- |
| `400`  | Email already exists          |
| `400`  | Invalid file type (non-image) |

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

| Status | Reason                    |
| ------ | ------------------------- |
| `400`  | Invalid email or password |

---

### `GET /api/users`

Get a paginated list of all users.

**Auth required:** ✅ Yes — `ADMIN` or `MANAGER` only

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

| Param   | Type   | Default | Description      |
| ------- | ------ | ------- | ---------------- |
| `page`  | Number | `1`     | Page number      |
| `limit` | Number | `10`    | Results per page |

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

| Status | Reason                                        |
| ------ | --------------------------------------------- |
| `401`  | Token is required or invalid                  |
| `401`  | Role not authorized (USER cannot access this) |

---

## 📘 Courses Routes

### `GET /api/courses`

Get a paginated list of all courses.

**Auth required:** ❌ No

**Query Parameters:**

| Param   | Type   | Default | Description      |
| ------- | ------ | ------- | ---------------- |
| `page`  | Number | `1`     | Page number      |
| `limit` | Number | `10`    | Results per page |

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
**Allowed roles:** `ADMIN` or `MANAGER`

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

| Field   | Rule                           |
| ------- | ------------------------------ |
| `name`  | Required, minimum 3 characters |
| `price` | Required                       |

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

| Status | Reason                                           |
| ------ | ------------------------------------------------ |
| `400`  | Validation error (name/price missing or invalid) |
| `401`  | Token missing, invalid, or role not authorized   |

---

### `GET /api/courses/:courseId`

Get a single course by ID.

**Auth required:** ❌ No

**URL Params:**

| Param      | Description                     |
| ---------- | ------------------------------- |
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

| Status | Reason           |
| ------ | ---------------- |
| `404`  | Course not found |

---

### `PATCH /api/courses/:courseId`

Update an existing course (partial update).

**Auth required:** ✅ Yes
**Allowed roles:** `ADMIN` or `MANAGER`

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Params:**

| Param      | Description                     |
| ---------- | ------------------------------- |
| `courseId` | The MongoDB `_id` of the course |

**Request Body:** `application/json` _(send only the fields to update)_

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

**Error Responses:**

| Status | Reason                                         |
| ------ | ---------------------------------------------- |
| `401`  | Token missing, invalid, or role not authorized |

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

| Param      | Description                     |
| ---------- | ------------------------------- |
| `courseId` | The MongoDB `_id` of the course |

**Response:** `200 OK`

```json
{
  "status": "SUCCESS",
  "data": "null"
}
```

**Error Responses:**

| Status | Reason                                         |
| ------ | ---------------------------------------------- |
| `401`  | Token missing, invalid, or role not authorized |

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

| Status Text | Meaning                                        |
| ----------- | ---------------------------------------------- |
| `SUCCESS`   | Request completed successfully                 |
| `FAIL`      | Client-side error (bad input, not found, etc.) |
| `ERROR`     | Server-side or auth error                      |

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

| Method   | Endpoint                 | Auth | Role           | Description                            |
| -------- | ------------------------ | ---- | -------------- | -------------------------------------- |
| `GET`    | `/api/courses`           | ❌   | -              | Get all courses (paginated)            |
| `POST`   | `/api/courses`           | ✅   | ADMIN, MANAGER | Create a new course                    |
| `GET`    | `/api/courses/:courseId` | ❌   | -              | Get single course                      |
| `PATCH`  | `/api/courses/:courseId` | ✅   | ADMIN, MANAGER | Update a course                        |
| `DELETE` | `/api/courses/:courseId` | ✅   | ADMIN, MANAGER | Delete a course                        |
| `GET`    | `/api/users`             | ✅   | ADMIN, MANAGER | Get all users (paginated)              |
| `POST`   | `/api/users/register`    | ❌   | -              | Register new user (role always = USER) |
| `POST`   | `/api/users/login`       | ❌   | -              | Login user                             |
