# 🛠️ BlogStory Backend – RESTful API for Blogging Platform

Welcome to the **backend of BlogStory** – a secure and scalable REST API built with **Node.js**, **Express**, and **MySQL**. This server powers the BlogStory platform, handling authentication, content management, and user permissions efficiently.

---

## 🚀 Tech Stack

- **Backend Framework**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **CORS**: Configured for frontend integration

---

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- JWT-based session authentication
- Access control for protected routes

### 📝 Blog Management
- Create, read, update, and delete blog posts
- Authenticated users can manage only their posts
- Public access to view all and single blog posts

### 🧾 Input Validation & Error Handling
- Validates all request inputs using express-validator
- Clear error responses with proper HTTP codes
- Secure error handling without exposing internals

### 🗃️ Database Handling
- Automatic database and table creation (if not exists)
- Clean, normalized schema for users and posts

---

## 📁 Project Structure
blogging-platform-backend/
├── database/
│ └── connection.js # MySQL connection + DB/table setup
├── middleware/
│ └── auth.js # JWT authentication middleware
├── routes/
│ ├── auth.js # Auth-related routes
│ └── posts.js # Post CRUD routes
├── .env # Environment variables
├── .gitignore # Ignored files
├── package.json # Dependencies and scripts
├── README.md # Project overview
└── server.js # App entry point


## ⚙️ Setup Instructions

### Prerequisites
- Node.js v14+
- MySQL (v5.7+)
- npm or yarn

### Steps

```bash
# 1. Clone the repo
git clone <your-backend-repo-url>
cd blogging-platform-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
Update .env:

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=blogging_platform
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=development
 
# 4. Start the server
npm run dev     # for development
# or
npm start       # for production
Go to: http://localhost:5000/api/health to check server status.

```

🧠 Development Strategy
Backend Architecture
Modular routing and middleware structure
RESTful principles with clean endpoint design
Config-driven environment setup
Proper error and exception handling

##Security First
Hashed passwords with bcrypt (12 salt rounds)
JWT-based authentication with expiry
SQL injection prevention using prepared statements
Validated all inputs with express-validator

🔌 API Endpoints

🔐 Auth Routes (/api/auth)
POST /signup – Register user
POST /login – Login and receive JWT
GET /me – Fetch logged-in user info

📝 Post Routes (/api/posts)

GET / – List all public posts
GET /:id – View single post
POST / – Create new post (auth required)
PUT /:id – Edit own post (auth required)
DELETE /:id – Delete own post (auth required)
GET /user/my-posts – Get logged-in user's posts


🛡️ Security Highlights

🔐 Hashed passwords with bcrypt (12 rounds)
🔒 JWT authentication with custom secret and expiry
📤 Input validation for all routes
🧱 SQL injection prevention via mysql2 prepared statements
🌐 CORS configured for frontend communication


