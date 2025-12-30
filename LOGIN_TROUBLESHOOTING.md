# Login 500 Error Troubleshooting Guide

## Quick Checks

### 1. **Check Backend Server Console**
The 500 error means the backend is running but encountering an error. Check your terminal where you ran `npm run server` or `npm run dev` to see the actual error message.

### 2. **Verify Database Connection**
```bash
# Check if PostgreSQL is running
# Windows: Check Services or Task Manager
# Or try connecting:
psql -U postgres -d zimpharmhub
```

### 3. **Check .env File**
Make sure your `.env` file has correct database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zimpharmhub
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_secret_key
```

### 4. **Verify Users Table Exists**
The users table must exist in your PostgreSQL database. If you haven't run the migration yet:

```sql
-- Connect to PostgreSQL
psql -U postgres -d zimpharmhub

-- Check if users table exists
\dt users

-- If it doesn't exist, run the create_tables.sql script
```

### 5. **Check if User Exists**
Try to verify a user exists in the database:
```sql
SELECT id, email, first_name, last_name FROM users LIMIT 5;
```

## Common Issues and Solutions

### Issue 1: "SequelizeConnectionError"
**Cause:** Database connection failed
**Solution:**
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database name exists: `CREATE DATABASE zimpharmhub;`

### Issue 2: "relation 'users' does not exist"
**Cause:** Database tables not created
**Solution:**
```bash
# Run the SQL script to create tables
psql -U postgres -d zimpharmhub -f database/create_tables.sql
```

### Issue 3: "Password comparison failed"
**Cause:** Password not hashed correctly during registration
**Solution:**
- Re-register the user (password will be hashed on create)
- Or manually hash password if needed

### Issue 4: "Cannot read property 'comparePassword'"
**Cause:** User model not properly loaded
**Solution:**
- Restart the backend server
- Check that `models-sequelize/User.js` exists and exports correctly

## Debug Steps

1. **Check Backend Logs**
   - Look at the terminal where server is running
   - Look for error stack traces
   - Note the exact error message

2. **Test Database Connection**
   ```javascript
   // Add to server.js temporarily
   sequelize.authenticate()
     .then(() => console.log('✅ Database connected'))
     .catch(err => console.error('❌ Database error:', err));
   ```

3. **Test User Model**
   ```javascript
   // Add to routes/auth.js temporarily (before login route)
   console.log('User model:', User);
   console.log('comparePassword method exists:', typeof User.prototype.comparePassword);
   ```

4. **Check Request Data**
   ```javascript
   // In login route, add:
   console.log('Login request:', { email, passwordLength: password?.length });
   ```

## Quick Fix: Test with Simple Query

Add this test endpoint to verify database connection:

```javascript
// In routes/auth.js
router.get('/test-db', async (req, res) => {
  try {
    const userCount = await User.count();
    res.json({ 
      success: true, 
      message: 'Database connected',
      userCount 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});
```

Then visit: `http://localhost:5000/api/auth/test-db`

## Expected Backend Logs (Success)

When login works, you should see:
```
POST /api/auth/login 200
```

When it fails, you'll see:
```
POST /api/auth/login 500
Error: [actual error message]
```

## Still Having Issues?

1. **Share the backend console error** - This will show the exact problem
2. **Check PostgreSQL logs** - May show connection issues
3. **Verify environment variables** - Make sure all are set correctly
4. **Restart everything** - Sometimes a clean restart helps:
   ```bash
   # Stop server (Ctrl+C)
   # Restart PostgreSQL service
   # Run: npm run dev
   ```

