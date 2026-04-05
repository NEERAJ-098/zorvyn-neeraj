# Architecture and Design Documentation

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT / API CONSUMER                      │
└────────────────┬─────────────────────────────────────────────┘
                 │ HTTP Requests with Bearer Token
                 ▼
┌──────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SERVER                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ MIDDLEWARE LAYER                                          │ │
│  │  ├─ CORS Middleware                                       │ │
│  │  ├─ Body Parser                                           │ │
│  │  ├─ Request Logger                                        │ │
│  │  ├─ Authentication Middleware                             │ │
│  │  └─ Authorization Middleware (Role-based)                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ROUTING LAYER                                             │ │
│  │  ├─ /api/users      → User Routes                         │ │
│  │  ├─ /api/records    → Record Routes                       │ │
│  │  └─ /api/dashboard  → Dashboard Routes                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ CONTROLLER LAYER (Business Logic)                         │ │
│  │  ├─ userController.js                                     │ │
│  │  ├─ recordController.js                                   │ │
│  │  └─ dashboardController.js                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ VALIDATION LAYER                                          │ │
│  │  └─ Comprehensive Input Validation                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ MODEL LAYER (Data Access)                                 │ │
│  │  ├─ User Model                                            │ │
│  │  └─ Financial Record Model                                │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         ▼
          ┌──────────────────────────────┐
          │   SQLite3 Database           │
          │  ├─ Users Table              │
          │  ├─ Financial Records Table  │
          │  └─ Indexes                  │
          └──────────────────────────────┘
```

---

## Architecture Layers

### 1. **Middleware Layer**

**Location**: `src/middleware/auth.js`

**Responsibilities**:

- CORS handling (cross-origin requests)
- Body parsing (JSON requests)
- Authentication verification
- Authorization (role-based access control)
- Error response formatting

**Flow**:

1. Request arrives with Authorization header
2. `authenticate` middleware validates token
3. `authorize` middleware checks role permissions
4. Request proceeds to controller or returns error

### 2. **Routing Layer**

**Location**: `src/routes/`

**Files**:

- `users.js` - User management routes
- `records.js` - Financial records routes
- `dashboard.js` - Dashboard analytics routes

**Design Pattern**: RESTful

- POST for creation
- GET for retrieval
- PUT for updates
- DELETE for deletion

### 3. **Controller Layer**

**Location**: `src/controllers/`

**Files**:

- `userController.js` - User business logic
- `recordController.js` - Record business logic
- `dashboardController.js` - Analytics logic

**Responsibilities**:

- Call model methods
- Handle errors with proper messages
- Return formatted responses
- Manage business logic

**Pattern**: Async/await for database operations

### 4. **Validation Layer**

**Location**: `src/utils/validation.js`

**Validates**:

- User Input (username, email, password)
- Financial Records (amount, type, date)
- Date Ranges (startDate <= endDate)
- Data Types and Constraints

**Benefits**:

- Prevents invalid data from reaching database
- Consistent error messages
- Reusable validators
- Early error detection

### 5. **Model Layer**

**Location**: `src/models/`

**Files**:

- `user.js` - User database operations
- `financialRecord.js` - Record database operations

**Responsibilities**:

- Direct database queries
- CRUD operations
- Data aggregation
- Complex queries

**Pattern**: Promise-based for async operations

### 6. **Database Layer**

**Location**: `src/db/`

**Files**:

- `database.js` - SQLite3 connection
- `init.js` - Schema initialization
- `seed.js` - Sample data

**Database Design**:

- Normalized schema
- Foreign key relationships
- Cascade deletes for data integrity
- Proper indexes for performance

---

## Authentication & Authorization Design

### Authentication Flow

```
1. Client sends request with Authorization header
   ↓
2. authenticate() middleware intercepts
   ↓
3. Token parsed (format: "user:<id>:<username>:<role>:<status>")
   ↓
4. Validation checks:
   - Token not empty ✓
   - Format valid ✓
   - Role is valid ✓
   - Status is valid ✓
   - Account not inactive ✓
   ↓
5. User object attached to req.user
   ↓
6. Next middleware/route handler processes request
```

### Authorization Flow

```
1. Request reaches protected route
   ↓
2. authorize(roles...) middleware checks
   ↓
3. Compare req.user.role against allowed roles
   ↓
4a. If authorized:    Continue to controller
4b. If not authorized: Return 403 Forbidden
```

**Implementation Note**:
Mock authentication system for learning purposes. In production, use:

- JWT tokens with expiration
- Password hashing (bcrypt)
- Session management
- OAuth2 / OpenID Connect

---

## Data Model Design

### Users Entity

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,           -- Unique identifier
  username TEXT UNIQUE,             -- Login name (indexed)
  email TEXT UNIQUE,                -- Contact email
  password TEXT,                    -- Hashed password (in prod)
  role TEXT CHECK(...),             -- viewer|analyst|admin
  status TEXT DEFAULT 'active',     -- active|inactive
  created_at DATETIME,              -- Creation timestamp
  updated_at DATETIME               -- Last update timestamp
)
```

**Design Decisions**:

- Username & Email: UNIQUE for integrity
- Role: CHECK constraint ensures valid values
- Status: Soft deletion alternative
- Timestamps: Audit trail

### Financial Records Entity

```sql
CREATE TABLE financial_records (
  id INTEGER PRIMARY KEY,           -- Unique identifier
  user_id INTEGER NOT NULL,         -- Foreign key to users
  amount DECIMAL(10,2),             -- Transaction amount
  type TEXT CHECK(...),             -- income|expense
  category TEXT,                    -- Transaction category
  description TEXT,                 -- Optional notes
  record_date DATE,                 -- Transaction date
  created_at DATETIME,              -- Record creation time
  updated_at DATETIME,              -- Last update time
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

**Design Decisions**:

- user_id: Foreign key ensures referential integrity
- ON DELETE CASCADE: Auto-cleanup when user deleted
- DECIMAL(10,2): Precise currency storage
- record_date: Separate from created_at (data date vs DB date)
- Timestamps: Track record history

### Indexes for Performance

```sql
-- Record lookup by user (most frequent query)
CREATE INDEX idx_records_user_id ON financial_records(user_id)

-- Date filtering (common in dashboards)
CREATE INDEX idx_records_date ON financial_records(record_date)

-- Type filtering (income vs expense)
CREATE INDEX idx_records_type ON financial_records(type)

-- Category filtering (breakdown analysis)
CREATE INDEX idx_records_category ON financial_records(category)
```

**Impact**:

- User record queries: Fast (indexed by user_id)
- Date range queries: Fast (indexed by date)
- Category breakdown: Fast
- Dashboard aggregations: Optimized

---

## Request-Response Cycle

### Successful Request (Happy Path)

```
1. Client sends:
   GET /api/records?category=Food
   Authorization: Bearer user:2:john_analyst:analyst:active

2. Middleware processing:
   ✓ CORS headers added
   ✓ Request logged
   ✓ Authentication successful (user attached)
   ✓ Authorization successful (analyst can view records)

3. Route handler (Router):
   ✓ Matches GET /api/records
   ✓ Calls recordController.getUserRecords()

4. Controller:
   ✓ Extracts filters from query params
   ✓ Calls FinancialRecord.getByUserId(userId, filters)

5. Validation:
   ✓ Category field validated
   ✓ All filters validated (if present)

6. Model:
   ✓ Builds SQL query with WHERE clauses
   ✓ Executes query with parameters
   ✓ Returns results

7. Controller formats response:
   {
     "success": true,
     "data": [records],
     "filters": { "applied": { "category": "Food" } }
   }

8. Client receives (200 OK):
   200 response with JSON body
```

### Failed Request (Error Path)

```
1. Client sends:
   POST /api/records
   with invalid amount: -100

2. Middleware processing:
   ✓ Authentication successful
   ✓ Authorization successful (analyst can create)

3. Route handler:
   ✓ Calls recordController.createRecord()

4. Controller:
   ✓ Calls validation.validateFinancialRecord()

5. Validation FAILS:
   ✗ Amount must be positive
   ✗ Throws ValidationError(400)

6. Error Handler (Express):
   ✓ Catches error
   ✓ Checks error type
   ✓ Formats response

7. Client receives (400 Bad Request):
   {
     "error": "ValidationError",
     "message": "Amount must be a positive number"
   }
```

---

## Error Handling Strategy

### Error Classification

```
Client Errors (4xx):
├─ 400 Bad Request
│  └─ ValidationError (invalid input)
├─ 401 Unauthorized
│  └─ AuthenticationError (missing/invalid auth)
├─ 403 Forbidden
│  └─ AuthorizationError (insufficient permissions)
├─ 404 Not Found
│  └─ NotFoundError (resource doesn't exist)
└─ 409 Conflict
   └─ ConflictError (duplicate username/email)

Server Errors (5xx):
└─ 500 Internal Server Error
   └─ Unexpected exceptions
```

### Error Classes

```javascript
AppError (Base)
├─ ValidationError      (Input validation failed)
├─ AuthenticationError  (Auth verification failed)
├─ AuthorizationError   (Role permission denied)
├─ NotFoundError        (Resource not found)
└─ ConflictError        (Resource already exists)
```

### Global Error Handler

```
Express Error Handling Workflow:
1. Route handler throws/calls next(error)
2. Error travels through middleware chain
3. Reaches global error handler
4. Error type checked
5. Appropriate response formatted
6. Response sent to client
```

---

## Role-Based Access Control (RBAC) Design

### Role Definition

```javascript
const ROLES = {
  VIEWER: "viewer", // Read-only access
  ANALYST: "analyst", // Read + Write (own records)
  ADMIN: "admin", // Full access
};
```

### Permission Matrix

```
Resource          Viewer  Analyst  Admin
────────────────────────────────────────
User Profile      Own     Own      Any
Financial Records Own-R   Own-CRUD Any-CRUD
Dashboard         Own     Own      Own
User Management   ✗       ✗        ✓
───────────────────────────────────────
Legend: R=Read, CRUD=Create/Read/Update/Delete
```

### Implementation Pattern

```javascript
// Route-level authorization
router.post('/records',
  authenticate,
  authorize('analyst', 'admin'),  // Check role
  recordController.createRecord
)

// Controller-level checks
if (user.role !== 'admin' && user.id !== targetUserId) {
  throw new AuthorizationError('Cannot access other user data')
}

// Query-level isolation
SELECT * FROM financial_records
WHERE user_id = ? AND ...  // Only user's records
```

---

## Data Flow Examples

### Example 1: Create Financial Record

```
User (Analyst) Request:
POST /api/records
Authorization: Bearer user:2:john_analyst:analyst:active
{
  "amount": 100,
  "type": "expense",
  "category": "Food",
  "record_date": "2024-01-31"
}
        ↓
Authentication Middleware:
  ✓ Token valid
  ✓ req.user = { id: 2, username: "john_analyst", role: "analyst" }
        ↓
Authorization Middleware:
  ✓ Route requires ['analyst', 'admin']
  ✓ User role is 'analyst'
        ↓
Controller (createRecord):
  ✓ Calls validation.validateFinancialRecord()
  ✓ Calls FinancialRecord.create(userId, data)
        ↓
Model (FinancialRecord.create):
  ✓ Prepares SQL INSERT
  ✓ Executes with parameters
  ✓ Returns created record
        ↓
Database (SQLite):
  ✓ User constraints checked
  ✓ Amount decimal(10,2) stored
  ✓ Timestamps set
  ✓ Foreign key validated
        ↓
Response to Client:
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "id": 11,
    "user_id": 2,
    "amount": 100,
    "type": "expense",
    "category": "Food",
    "record_date": "2024-01-31",
    "created_at": "2024-01-31T15:45:00"
  }
}
```

### Example 2: Dashboard Summary Query

```
User Request:
GET /api/dashboard/summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer user:2:john_analyst:analyst:active
        ↓
Dashboard Controller:
  ✓ Extracts filters from query
  ✓ Calls FinancialRecord.getSummary(userId, filters)
        ↓
Model (FinancialRecord.getSummary):
  ✓ Builds aggregation query:
    SELECT
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(*) as total_records
    FROM financial_records
    WHERE user_id = ? AND record_date BETWEEN ? AND ?
        ↓
Database:
  ✓ Uses idx_records_user_id for fast user lookup
  ✓ Uses idx_records_date and for range scan
  ✓ Aggregates matching records
  ✓ Returns single row with aggregates
        ↓
Controller formats response:
{
  "success": true,
  "data": {
    "total_income": 7500,
    "total_expenses": 2275,
    "net_balance": 5225,
    "total_records": 10
  },
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

---

## Performance Considerations

### Query Optimization

1. **Indexed Columns**
   - user_id: Most queries filter by user
   - record_date: Date range queries common
   - type: Category filtering frequent
   - category: Breakdown analysis

2. **Aggregation Strategy**
   - Use SQL SUM/COUNT instead of application code
   - Leverage database engine optimization
   - Minimize data transfer

3. **Pagination**
   - LIMIT/OFFSET for large result sets
   - Prevent memory overload
   - Reduces network bandwidth

### Database Connection

- Single persistent connection
- Connection pooling ready (for scaling)
- PRAGMA foreign_keys enabled

### Middleware Efficiency

- Auth check before database calls
- Early validation prevents wasted DB queries
- Error thrown immediately on validation failure

---

## Security Measures

### Input Validation

- All inputs validated before database operations
- Type checking (email, number, date)
- Length constraints
- Enum validation

### Access Control

- Authentication required for all protected endpoints
- Role-based authorization at route level
- User data isolation (cannot access others' data)
- Admin-only sensitive operations

### Database Security

- Foreign key constraints
- Cascade delete prevents orphans
- Constraint checks on INSERT/UPDATE
- SQL injection prevention through parameterized queries

### Future Enhancements

- JWT token expiration
- Password hashing (bcrypt)
- Rate limiting
- HTTPS enforcement
- CSRF protection

---

## Scalability Considerations

### Current Design Limits

- SQLite (suitable for small-medium scale)
- Single server
- No caching layer

### Scaling Options

1. **Database**
   - Migrate to PostgreSQL/MySQL
   - Add read replicas
   - Partitioning strategy

2. **Application**
   - Add Redis caching
   - Load balancing
   - Microservices (user service, record service)

3. **Infrastructure**
   - Container orchestration (Docker/Kubernetes)
   - CDN for static content
   - Database migrations framework

---

## Testing Strategy

### Unit Testing (Not implemented, ready for)

- Model method tests
- Validation function tests
- Controller logic tests

### Integration Testing (Not implemented, ready for)

- Full request-response cycle
- Database operations
- Authorization checks

### E2E Testing (Provided in TESTING.md)

- 30+ test cases with curl
- Real endpoints
- Actual database operations

---

## Deployment Considerations

### Development

- nodemon for auto-reload
- Console logging
- Development database

### Production

- Optimize error messages (no stack traces)
- Add structured logging
- Use environment variables
- Enable HTTPS
- Database backups
- Rate limiting
- Monitoring/alerting

---

## Design Patterns Used

### Model-View-Controller (MVC)

- Models: Database operations
- Controllers: Business logic
- Routes: HTTP mapping

### Middleware Pattern

- Authentication as middleware
- Authorization as middleware
- Error handling as middleware

### Factory Pattern

- Error class factories
- Validator function factories

### Singleton Pattern

- Database connection
- Express app instance

### Promise Pattern

- Async/await
- Error propagation
- Composition

---

## Code Organization Principles

1. **Separation of Concerns**
   - Database logic in models
   - Business logic in controllers
   - HTTP layer in routes
   - Validation in utils

2. **DRY (Don't Repeat Yourself)**
   - Reusable validators
   - Shared error handling
   - Common middleware

3. **SOLID**
   - Single Responsibility: Each file has one purpose
   - Open/Closed: Extensible with new roles
   - Liskov: Error classes inherit properly
   - Interface: Clear API contracts
   - Dependency: Loose coupling

---

This architecture provides a solid foundation for learning backend development and is extensible for production use with enhancements to authentication, database, and monitoring systems.
