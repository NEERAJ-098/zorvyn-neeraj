# 🔍 Swagger UI Guide

The Financial Management Backend now includes **Swagger UI** for interactive API exploration and testing!

## 🚀 Quick Start

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Open Swagger UI in browser**:

   ```
   http://localhost:3000/api-docs
   ```

3. **Start exploring and testing!**

---

## 📖 What is Swagger UI?

Swagger UI is an interactive web-based interface that:

- ✅ Displays all API endpoints
- ✅ Shows request/response schemas
- ✅ Allows you to test endpoints directly from the browser
- ✅ Manages authentication headers
- ✅ Provides endpoint documentation

---

## 🔐 Authentication in Swagger UI

### Step 1: Set Authorization

1. Click the **"Authorize"** button (top right, with lock icon)
2. Enter your bearer token in the format:
   ```
   user:<id>:<username>:<role>:<status>
   ```

### Example Tokens

**Admin User**:

```
user:1:admin_user:admin:active
```

**Analyst User (John)**:

```
user:2:john_analyst:analyst:active
```

**Analyst User (Jane)**:

```
user:3:jane_analyst:analyst:active
```

**Viewer User**:

```
user:4:viewer_user:viewer:active
```

### Step 2: Apply Authorization

1. Enter the token in the authorization field
2. Click **Authorize**
3. Click **Close**

The authorization will be applied to all subsequent requests.

---

## 🧪 Testing Endpoints in Swagger UI

### Example: Create Financial Record

1. **Find endpoint**: Scroll to "records" section
2. **Locate**: POST /api/records
3. **Click**: "Try it out" button
4. **Fill request body**:
   ```json
   {
     "amount": 100.5,
     "type": "expense",
     "category": "Food",
     "description": "Grocery shopping",
     "record_date": "2024-01-31"
   }
   ```
5. **Click**: "Execute"
6. **View response**: See status code and response data

### Example: Get Records with Filters

1. **Locate**: GET /api/records
2. **Click**: "Try it out"
3. **Add query parameters**:
   - `type`: expense
   - `category`: Food
   - `startDate`: 2024-01-01
   - `endDate`: 2024-01-31
4. **Click**: "Execute"
5. **View filtered results**

### Example: Get Dashboard Summary

1. **Locate**: GET /api/dashboard/summary
2. **Click**: "Try it out"
3. **Add optional parameters**:
   - `startDate`: 2024-01-01
   - `endDate`: 2024-01-31
4. **Click**: "Execute"
5. **View summary data**

---

## 📊 API Sections

### Users (6 endpoints)

- POST /users - Create user
- GET /users - List all users
- GET /users/me - Current user
- GET /users/{id} - User by ID
- PUT /users/{id} - Update user
- DELETE /users/{id} - Delete user

### Records (5 endpoints)

- POST /records - Create record
- GET /records - List records
- GET /records/{id} - Get record
- PUT /records/{id} - Update record
- DELETE /records/{id} - Delete record

### Dashboard (4 endpoints)

- GET / - Comprehensive dashboard
- GET /summary - Financial summary
- GET /categories - Category breakdown
- GET /recent - Recent transactions

---

## 🎯 Common Testing Scenarios

### Scenario 1: Admin Creates a New Analyst User

1. **Authorize as Admin** (user:1:admin_user:admin:active)
2. **POST /users**:
   ```json
   {
     "username": "new_analyst",
     "email": "new@example.com",
     "password": "securepass123",
     "role": "analyst",
     "status": "active"
   }
   ```
3. **Execute** → See new user with ID

### Scenario 2: Analyst Creates Financial Record

1. **Authorize as Analyst** (user:2:john_analyst:analyst:active)
2. **POST /records**:
   ```json
   {
     "amount": 2500,
     "type": "income",
     "category": "Salary",
     "description": "Monthly salary",
     "record_date": "2024-01-31"
   }
   ```
3. **Execute** → Record created successfully

### Scenario 3: Viewer Tries to Create Record (Should Fail)

1. **Authorize as Viewer** (user:4:viewer_user:viewer:active)
2. **POST /records** with any data
3. **Execute** → 403 Forbidden error (as expected)

### Scenario 4: Get Dashboard Summary

1. **Authorize as any user**
2. **GET /api/dashboard/summary**
3. **Add query parameters** (optional):
   - startDate: 2024-01-01
   - endDate: 2024-01-31
4. **Execute** → See financial summary

---

## 💡 Tips & Tricks

### Change Between Different Users

To test different roles:

1. Click **"Authorize"** again
2. Clear the current token
3. Enter a different user's token
4. Click **Authorize**

### View Full Request/Response

After executing:

- Scroll down to see **Request URL**
- View **Response headers**
- View **Response body**
- Check **curl command** (useful for scripting)

### Review Schema Information

- Hover over field names to see descriptions
- Check "Schema" section for data types
- See which fields are "required"

### Test Error Scenarios

**Try these to see error responses:**

1. Invalid date range (startDate > endDate)
2. Missing required fields
3. Invalid role value
4. Accessing another user's data (non-admin)
5. Insufficient permissions (viewer trying to create)

---

## 🔗 Additional Resources

### View JSON Spec

Access the OpenAPI specification:

```
http://localhost:3000/api/docs
```

### View Text Documentation

Access JSON documentation:

```
http://localhost:3000/api/docs
```

---

## 🚨 Troubleshooting

### Authorization Not Working?

**Issue**: Token not persisting across requests

**Solution**:

1. Click "Authorize" button again
2. Make sure to include the entire token:
   ```
   user:2:john_analyst:analyst:active
   ```
3. Not inside quotes - just paste directly

### Endpoint Returning 401 Unauthorized?

**Issue**: Authorization header missing or invalid

**Solution**:

1. Click the lock icon on an endpoint
2. Make sure it shows your token is set
3. Re-authorize if needed

### Getting 403 Forbidden?

**Issue**: Your role doesn't have permission for this action

**Solution**:

1. Switch to appropriate role
2. Check the endpoint description for required role
3. Use admin token (user:1:admin_user:admin:active) for most operations

### Changes Not Reflecting in Database?

**Issue**: Database still has old data

**Solution**:

1. Stop the server (Ctrl+C)
2. Delete `data.db` file
3. Run `node scripts/seed.js`
4. Restart server with `npm start`

---

## 📚 Using Swagger UI with Postman Alternative

If you prefer Postman:

1. Export the OpenAPI spec from Swagger
2. Import into Postman
3. Or manually import using the spec URL

---

## 🎓 Learning Path with Swagger UI

### Day 1: Explore Basic Endpoints

1. Get current user profile (GET /users/me)
2. View your dashboard (GET /dashboard)
3. Check your records (GET /records)

### Day 2: Test Different Roles

1. Try as Viewer (read-only)
2. Try as Analyst (read + write)
3. Try as Admin (full access)

### Day 3: Create and Modify Data

1. Create financial records
2. Update records
3. Try error scenarios

### Day 4: Advanced Filtering

1. Filter records by date range
2. Filter by category
3. Get analytics by category

---

## 🔑 Quick Reference Card

```
🔓 AUTHORIZATION FORMATS

Admin:
user:1:admin_user:admin:active

Analyst (John):
user:2:john_analyst:analyst:active

Analyst (Jane):
user:3:jane_analyst:analyst:active

Viewer:
user:4:viewer_user:viewer:active
```

---

## ✅ Verification Checklist

After adding authorization, you should be able to:

- ✅ View all endpoints in Swagger UI
- ✅ See request/response schemas
- ✅ Make successful API calls
- ✅ Receive proper error messages
- ✅ Test different user roles
- ✅ Create and modify data
- ✅ Filter and search data
- ✅ View analytics/dashboard

---

## 📞 Need Help?

1. **Check endpoint description** - Hover over endpoint names
2. **Review schema** - See "Schema" section
3. **Check error message** - Scroll down for detailed error
4. **Verify authorization** - Make sure token is set
5. **Test with curl** - Copy curl command from response
6. **Check README.md** - For detailed documentation

---

**Now open your browser and go to: http://localhost:3000/api-docs** 🚀
