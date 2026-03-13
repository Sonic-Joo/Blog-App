<<<<<<< HEAD

# Blog App (REST API)

This project is a **REST API for a blogging platform** built with `Node.js`, `Express`, and `MongoDB` (via `mongoose`).  
It supports managing users, posts, comments, and categories, with image upload via `cloudinary` and email sending via `nodemailer`.

---

## Key Features

- **User registration and login** with `JWT` authentication.
- **Create / update / delete Posts**.
- **Post comments** and comment management.
- **Categories** for organizing posts.
- **Image uploads** using `multer` and `cloudinary`.
- **API protection** using:
  - `express-rate-limit` to throttle requests.
  - Token verification middleware `verifyToken`.
  - Global error handling with `notFound` / `errorHandler` middlewares.

---

## Tech Stack

- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **multer** + **cloudinary** for image upload and management
- **nodemailer** for sending emails (e.g. account activation or password reset)
- **express-rate-limit**, , **joi**, for data validation and API security

---

## Setup & Installation

### 1️ Prerequisites

- Node.js (latest stable version recommended)
- MongoDB (local or cloud-based via Atlas)
- A `Cloudinary` account (for image uploads)
- SMTP configuration (e.g. Gmail) for `nodemailer`

### Install Dependencies

Inside the project folder (where `package.json` is located), run:

```bash
npm install
```

### Configure the `.env` File

Create a `.env` file in the project root (next to `main.js`) and add the required variables. Example (update values to match your setup):

```env
PORT=8000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/blog-app
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EMAIL_FROM="Blog App <your_email@gmail.com>"
```

> **Note:** Never push your `.env` file to GitHub or any public repository.

### 4️⃣ Run in Development Mode

A `dev` script is defined in `package.json`:

```bash
npm run dev
```

The server will start on the port defined in `PORT`, defaulting to `8000`.  
The entry point is `main.js`, which wires up all routes and middlewares.

---

## Main Routes

All routes are prefixed with `/api/...` as defined in `main.js`:

- `POST /api/auth/...`  
  User registration / login / account activation ... (as configured in `auth.route.js` and `auth.controller.js`)

- `GET/POST/PUT/DELETE /api/users/...`  
  User management (`user.route.js`, `user.controller.js`)

- `GET/POST/PUT/DELETE /api/posts/...`  
  Post management (`post.route.js`, `post.controller.js`)

- `GET/POST/PUT/DELETE /api/comments/...`  
  Comment management (`comment.route.js`, `comment.controller.js`)

- `GET/POST/PUT/DELETE /api/categories/...`  
  Category management (`category.route.js`, `category.controller.js`)

> Full route details can be found inside the `routes` and `controllers` files.

---

## Security & Error Handling

- **Rate Limiting:**
  - `authLimiter` — applied to `auth` routes (login/registration).
  - `apiLimiter` — applied to all other routes (`users`, `posts`, `comments`, `categories`).
- **Error Middlewares:**
  - `notFound` — handles any unrecognized route.
  - `errorHandler` — catches errors and returns a formatted response to the client.

These middlewares are registered at the bottom of `main.js`.

---

## Folder Structure (Overview)

```text
config/
  connectToDB.js        # Database connection
controllers/
  auth.controller.js
  user.controller.js
  post.controller.js
  comment.controller.js
  category.controller.js
middleware/
  apiLimiter.js
  error.js => Error Handler + Not Found Path
  verifyToken.js
  photoUpload.js
models/
  user.js
  post.js
  comment.js
  category.js
  verificationToken.js
routes/
  auth.route.js
  user.route.js
  post.route.js
  comment.route.js
  category.route.js
utilities/
  cloudinary.js
  sendEmail.js

main.js
package.json
.env (not tracked in Git)
```

---

## General Notes

- Make sure all environment variables are properly configured before running the project.
- You can update the project name and author info in `package.json`.
- It is recommended to use **Git** for version control, and to add `node_modules` and `.env` to your `.gitignore`.

You can now push this file along with the rest of the project to GitHub or any other code hosting platform.
