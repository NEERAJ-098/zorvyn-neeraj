# Financial Management Backend API

A comprehensive backend system for managing financial records with role-based access control, user management, and dashboard analytics.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Role-Based Access Control](#role-based-access-control)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Data Persistence](#data-persistence)

---

## Features

### ✅ User and Role Management

- Create and manage users with different roles
- Three predefined roles: **Viewer**, **Analyst**, **Admin**
- Manage user status (active/inactive)
- Role-based access control for all operations

### ✅ Financial Records Management

- Create, read, update, and delete financial records
- Track transactions with detailed information:
  - Amount
  - Type (Income/Expense)
  - Category
  - Date
  - Description/Notes
- Advanced filtering by type, category, and date range

### ✅ Dashboard Summary APIs

- Total income and expenses calculation
- Net balance tracking
- Category-wise breakdown
- Recent transaction history
- Period-based analytics (with date range filtering)

### ✅ Access Control Logic

- Middleware-based authentication and authorization
- Role-based endpoint restrictions
- User data isolation (users can only see their own records)
- Admin-only operations

### ✅ Validation and Error Handling

- Comprehensive input validation
- Proper HTTP status codes
- Meaningful error messages
- Custom error classes for different scenarios

### ✅ Data Persistence

- SQLite3 for reliable data storage
- Database schema with proper constraints
- Foreign key relationships
- Indexed columns for query optimization

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Body Parser**: body-parser
- **CORS**: cors
- **Environment**: dotenv

---

## Project Structure

```
learning1/
├── src/
│   ├── index.js                    # Main application entry point
│   ├── db/
│   │   ├── database.js             # Database connection
│   │   ├── init.js                 # Database schema initialization
│   │   └── seed.js                 # Sample data seeding
│   ├── models/
│   │   ├── user.js                 # User model (CRUD operations)
│   │   └── financialRecord.js      # Financial record model
│   ├── controllers/
│   │   ├── userController.js       # User business logic
│   │   ├── recordController.js     # Record business logic
│   │   └── dashboardController.js  # Dashboard analytics logic
│   ├── routes/
│   │   ├── users.js                # User endpoints
│   │   ├── records.js              # Record endpoints
│   │   └── dashboard.js            # Dashboard endpoints
│   ├── middleware/
│   │   └── auth.js                 # Authentication & authorization
│   └── utils/
│       ├── errors.js               # Custom error classes
│       └── validation.js           # Input validation utilities
├── package.json
├── .env
└── README.md
```

---

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm

### Steps

1. **Navigate to project directory**:

   ```bash
   cd learning1
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   - Edit `.env` file to change PORT (default: 3000)

---

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Expected Output

```
✅ Backend server running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

---

## Authentication

The system uses a mock authentication system where users send credentials in the Authorization header.

### Header Format

```
Authorization: Bearer user:<user_id>:<username>:<role>:<status>
```

### Example

```
Authorization: Bearer user:1:admin_user:admin:active
```

### Components

- `user_id`: Integer ID of the user (from database)
- `username`: Username string
- `role`: One of `viewer`, `analyst`, `admin`
- `status`: Either `active` or `inactive`

> **Note**: In a production environment, replace this with JWT tokens or OAuth2

---

## API Endpoints

### Health Check

**GET** `/api/health`

- No authentication required
- Returns server status

### Documentation

**GET** `/api/docs`

- No authentication required
- Returns API documentation and endpoint list

---

## User Management Endpoints

### Create User (Admin Only)

**POST** `/api/users`

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "analyst",
  "status": "active"
}
```

Response: User object with ID

---

### Get Current User

**GET** `/api/users/me`

- Authentication required
- Returns current authenticated user's profile

---

### Get All Users (Admin Only)

**GET** `/api/users?limit=20&offset=0`

- Authentication required (Admin)
- Returns paginated list of all users

---

### Get User by ID

**GET** `/api/users/:id`

- Authentication required
- Admin can view any user, others can only view themselves

---

### Update User

**PUT** `/api/users/:id`

```json
{
  "role": "analyst",
  "status": "inactive"
}
```

- Users can update their own account
- Only admins can change roles
- Non-admins cannot modify their own role

---

### Delete User (Admin Only)

**DELETE** `/api/users/:id`

- Admin only
- Cannot delete your own account

---

## Financial Records Endpoints

### Create Record (Analyst/Admin Only)

**POST** `/api/records`

```json
{
  "amount": 150.5,
  "type": "expense",
  "category": "Groceries",
  "description": "Weekly shopping",
  "record_date": "2024-01-15"
}
```

Response: Created record object

---

### Get User's Records

**GET** `/api/records?type=expense&category=Food&startDate=2024-01-01&endDate=2024-01-31&limit=100&offset=0`

Query parameters (all optional):

- `type`: Filter by `income` or `expense`
- `category`: Filter by category name
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `limit`: Records per page (default: 100)
- `offset`: Pagination offset (default: 0)

---

### Get Specific Record

**GET** `/api/records/:id`

- Users can only view their own records

---

### Update Record (Analyst/Admin Only)

**PUT** `/api/records/:id`

```json
{
  "amount": 200,
  "category": "Food",
  "description": "Updated shopping"
}
```

---

### Delete Record (Analyst/Admin Only)

**DELETE** `/api/records/:id`

---

## Dashboard Endpoints

### Comprehensive Dashboard

**GET** `/api/dashboard?startDate=2024-01-01&endDate=2024-01-31`

Returns:

- Summary (total income, expenses, net balance)
- Recent transactions (last 5)
- Category breakdown

---

### Get Summary

**GET** `/api/dashboard/summary?startDate=2024-01-01&endDate=2024-01-31`

Response:

```json
{
  "success": true,
  "data": {
    "total_income": 7000,
    "total_expenses": 2275,
    "net_balance": 4725,
    "total_records": 8
  }
}
```

---

### Get Category Breakdown

**GET** `/api/dashboard/categories?type=expense`

Optional `type` parameter: `income` or `expense`

Response:

```json
{
  "success": true,
  "data": [
    {
      "category": "Food",
      "type": "expense",
      "total": 800,
      "count": 2
    },
    {
      "category": "Rent",
      "type": "expense",
      "total": 1200,
      "count": 1
    }
  ]
}
```

---

### Get Recent Activity

**GET** `/api/dashboard/recent?limit=10`

Returns recently added transactions

---

## Role-Based Access Control

### Viewer Role

- ✅ View own profile
- ✅ View own financial records
- ✅ View own dashboard summaries
- ❌ Create/update/delete records
- ❌ Manage users

### Analyst Role

- ✅ View own profile
- ✅ View own financial records
- ✅ Create financial records
- ✅ Update/delete own records
- ✅ View own dashboard summaries
- ❌ Manage users
- ❌ View other users' data

### Admin Role

- ✅ All Analyst permissions
- ✅ Create users
- ✅ View all users
- ✅ Manage user roles and status
- ✅ Delete users

---

## Usage Examples

### Example 1: Admin Creates User

**Request**:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user:1:admin_user:admin:active" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "securepass123",
    "role": "analyst",
    "status": "active"
  }'
```

**Response** (201):

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "username": "alice",
    "email": "alice@example.com",
    "role": "analyst",
    "status": "active"
  }
}
```

---

### Example 2: Analyst Creates Financial Record

**Request**:

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user:2:alice:analyst:active" \
  -d '{
    "amount": 2500,
    "type": "income",
    "category": "Salary",
    "description": "Monthly salary",
    "record_date": "2024-01-31"
  }'
```

**Response** (201):

```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "id": 1,
    "user_id": 2,
    "amount": 2500,
    "type": "income",
    "category": "Salary",
    "description": "Monthly salary",
    "record_date": "2024-01-31",
    "created_at": "2024-01-31 10:30:45"
  }
}
```

---

### Example 3: Get Dashboard Summary

**Request**:

```bash
curl -X GET "http://localhost:3000/api/dashboard/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer user:2:alice:analyst:active"
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "total_income": 2500,
    "total_expenses": 300,
    "net_balance": 2200,
    "total_records": 5
  },
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

---

### Example 4: Filter Records by Category

**Request**:

```bash
curl -X GET "http://localhost:3000/api/records?category=Food&type=expense" \
  -H "Authorization: Bearer user:2:alice:analyst:active"
```

**Response** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "user_id": 2,
      "amount": 50,
      "type": "expense",
      "category": "Food",
      "description": "Lunch",
      "record_date": "2024-01-20",
      "created_at": "2024-01-20 12:00:00"
    }
  ],
  "filters": {
    "applied": {
      "category": "Food",
      "type": "expense"
    }
  }
}
```

---

### Example 5: Access Control Violation

**Request** (Viewer trying to create record):

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user:3:viewer_user:viewer:active" \
  -d '{
    "amount": 100,
    "type": "expense",
    "category": "Test",
    "record_date": "2024-01-31"
  }'
```

**Response** (403):

```json
{
  "error": "AuthorizationError",
  "message": "This action requires one of these roles: analyst, admin"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message"
}
```

### Common Error Codes

| Status | Error               | Cause                          |
| ------ | ------------------- | ------------------------------ |
| 400    | ValidationError     | Invalid input data             |
| 401    | AuthenticationError | Missing or invalid auth header |
| 403    | AuthorizationError  | Insufficient permissions       |
| 404    | NotFoundError       | Resource not found             |
| 409    | ConflictError       | Resource already exists        |
| 500    | InternalServerError | Server error                   |

### Validation Examples

**Invalid email format**:

```json
{
  "error": "ValidationError",
  "message": "Valid email is required"
}
```

**Invalid date range**:

```json
{
  "error": "ValidationError",
  "message": "startDate cannot be after endDate"
}
```

**Missing required fields**:

```json
{
  "error": "ValidationError",
  "message": "Amount is required, Type must be either income or expense"
}
```

---

## Data Persistence

### Database Technology

- **SQLite3**: Lightweight, file-based relational database
- **File Location**: `learning1/data.db`
- **No external database server required**

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Financial Records Table

```sql
CREATE TABLE financial_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### Indexes

- `idx_records_user_id`: Optimized user record lookups
- `idx_records_date`: Optimized date-based filtering
- `idx_records_type`: Optimized type filtering
- `idx_records_category`: Optimized category filtering

---

## Configuration

### Environment Variables (.env)

```env
PORT=3000
NODE_ENV=development
```

### Modify PORT

Edit `.env` and change `PORT` value:

```env
PORT=5000
```

---

## Testing the API

### Using cURL

```bash
# Check server health
curl http://localhost:3000/api/health

# View API documentation
curl http://localhost:3000/api/docs
```

### Using Postman

1. Import collection
2. Set Authorization header to Bearer token format
3. Test endpoints with different roles

### Using Thunder Client / VS Code REST Client

Create `.rest` file and test endpoints

---

## Notes

- Data is stored in SQLite database (`data.db`)
- Authentication is simplified for learning purposes
- In production: Use JWT tokens, hash passwords, implement proper session management
- CORS is enabled for local development
- All endpoints require authentication except `/api/health` and `/api/docs`

---

## Summary

This backend implementation demonstrates:
✅ RESTful API design  
✅ Role-based access control (RBAC)  
✅ Data validation and error handling  
✅ Database schema with relationships  
✅ Comprehensive business logic  
✅ Query optimization with indexes  
✅ Proper HTTP status codes  
✅ Middleware-based authentication  
✅ Aggregation and analytics queries

Suitable for learning and further development!
