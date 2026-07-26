# Troubleshooting Guide

## Database Issues

### "ER_ACCESS_DENIED_FOR_USER"

**Problem:** Cannot connect to MySQL database

**Solutions:**

1. Verify MySQL is running

   ```bash
   mysql -u root -p
   ```

2. Check credentials in `.env`:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   ```

3. Create database if not exists:

   ```sql
   CREATE DATABASE kaamsekaaam;
   ```

4. Reset MySQL password:
   ```bash
   mysql -u root -p
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
   FLUSH PRIVILEGES;
   ```

### "Table doesn't exist"

**Problem:** Database tables not created

**Solutions:**

1. Backend will auto-create tables on first run
2. Make sure backend is running when you start it
3. Check server logs for sync errors
4. Manually run schema:
   ```bash
   mysql -u root -p kaamsekaaam < database/schema.sql
   ```

---

## Backend Issues

### "Error: listen EADDRINUSE"

**Problem:** Port 5000 already in use

**Windows:**

```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Mac/Linux:**

```bash
lsof -i :5000
kill -9 <PID>
```

**Alternative:** Change PORT in `.env`

```env
PORT=5001
```

### "Cannot find module"

**Problem:** Dependencies not installed

**Solution:**

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "JWT_SECRET is not defined"

**Problem:** `.env` file not found or incomplete

**Solution:**

1. Copy `.env.example` to `.env`

   ```bash
   cp .env.example .env
   ```

2. Fill in required values:
   ```env
   JWT_SECRET=your_secret_key
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   ```

### "Email not sending"

**Problem:** Nodemailer SMTP error

**Solutions:**

1. Verify Gmail credentials:
   - Check SMTP_USER is correct
   - Check SMTP_PASSWORD is app password, not Gmail password
   - Enable 2FA: https://myaccount.google.com/security

2. Generate new app password:
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail > Windows Computer
   - Use generated 16-char password

3. Check firewall/antivirus blocking SMTP:587

4. Test with curl:
   ```bash
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@gmail.com"}'
   ```

### Seeding fails

**Problem:** `npm run seed` returns error

**Solutions:**

1. Make sure database exists:

   ```bash
   mysql -u root -p
   CREATE DATABASE kaamsekaaam;
   ```

2. Restart backend first:

   ```bash
   npm run dev
   # Wait 30 seconds for tables to sync
   # Ctrl+C
   npm run seed
   ```

3. Check database connection in `.env`

---

## Frontend Issues

### "Error: listen EADDRINUSE" (port 5173)

**Problem:** Port 5173 already in use

**Windows:**

```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Mac/Linux:**

```bash
lsof -i :5173
kill -9 <PID>
```

### "Cannot find module 'react'"

**Problem:** Dependencies not installed

**Solution:**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "API call fails / 404 errors"

**Problem:** Frontend can't reach backend

**Solutions:**

1. Verify backend is running on http://localhost:5000

2. Check frontend's API URL in `src/services/api.js`:

   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api'
   ```

3. Check CORS in backend `src/server.js`:

   ```javascript
   app.use(
     cors({
       origin: process.env.FRONTEND_URL || 'http://localhost:5173',
       credentials: true,
     }),
   )
   ```

4. Update `.env` if using different port:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### "Login returns 403 Forbidden"

**Problem:** JWT token invalid or expired

**Solutions:**

1. Clear browser localStorage:
   - F12 → Application → LocalStorage → Clear

2. Clear cookies:
   - F12 → Application → Cookies → Clear

3. Try logging in again

4. Check JWT_SECRET in backend `.env` hasn't changed

### Vite keeps crashing

**Problem:** Memory issues or corrupted build cache

**Solutions:**

1. Clear cache:

   ```bash
   rm -rf .vite
   npm run dev
   ```

2. Try different port in `vite.config.js`:
   ```javascript
   server: {
     port: 3000,
   }
   ```

---

## Authentication Issues

### "Invalid email format"

**Problem:** Email validation too strict

**Keep in mind:** Email regex in backend requires `@` and `.`

**Fixed emails:**

```
✓ user@example.com
✓ admin@kaamsekaaam.com
✗ userexample.com
✗ user@
```

### "Password must contain..."

**Problem:** Password doesn't meet requirements

**Requirements:**

- Min 8 characters
- Uppercase letter (A-Z)
- Lowercase letter (a-z)
- Number (0-9)
- Special character (@$!%\*?&)

**Example valid password:** `Kaam@123`

### "Email already exists"

**Problem:** Duplicate email in database

**Solutions:**

1. Use different email:

   ```
   user1@example.com
   user2@example.com
   ```

2. Delete test user from database:
   ```sql
   DELETE FROM Candidates WHERE userId IN (
     SELECT id FROM Users WHERE email = 'test@example.com'
   );
   DELETE FROM Users WHERE email = 'test@example.com';
   ```

### Token expired / "Unauthorized"

**Problem:** JWT token expired (default 7 days)

**Solutions:**

1. Clear localStorage and login again

2. Extend expiration in backend `.env`:
   ```env
   JWT_EXPIRATION=30d
   ```

---

## File Upload Issues

### "File too large" / "413 Payload Too Large"

**Problem:** Resume file exceeds 5MB limit

**Solutions:**

1. Ensure resume is < 5MB

2. Compress PDF if needed

3. Change limit in `src/middlewares/fileUpload.js`:
   ```javascript
   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
   ```

### "Only PDF files allowed"

**Problem:** Wrong file format

**Solution:** Upload PDF files only

**If you need other formats:** Update `src/middlewares/fileUpload.js`:

```javascript
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF and DOC files allowed'))
  }
}
```

---

## Docker Issues

### "Cannot connect to Docker daemon"

**Problem:** Docker not running

**Solutions:**

1. Start Docker Desktop / service
2. Check if installed: `docker --version`

### "Port already allocated"

**Problem:** Port already in use

**Solutions:**

1. Stop other containers:

   ```bash
   docker-compose down
   ```

2. Change port in `docker-compose.yml`:
   ```yaml
   ports:
     - '5001:5000' # Changed from 5000:5000
   ```

### "Database connection failed in Docker"

**Problem:** Container networking issue

**Solutions:**

1. Ensure MySQL service is healthy:

   ```bash
   docker ps
   ```

2. Check logs:

   ```bash
   docker-compose logs mysql
   ```

3. Rebuild containers:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

---

## Common Error Messages

### "ENOENT: no such file or directory"

- File or folder doesn't exist
- Check file paths in your code
- Verify upload folder exists: `backend/uploads/resumes/`

### "CORS error"

- API and Frontend have different origins
- Update CORS in backend if needed
- Check FRONTEND_URL in `.env`

### "Cannot read property of undefined"

- Reference null/undefined variable
- Check API response structure
- Add null checks in frontend

### "Unexpected token <"

- HTML returned instead of JSON
- Backend crashed or returned error page
- Check backend logs

### "net::ERR_FAILED"

- Network connection failed
- Backend is down
- Check firewall/antivirus

---

## Performance Issues

### Backend is slow

**Check:**

1. Database queries are indexed
2. No infinite loops in code
3. File upload size is reasonable
4. Check server resources

**Optimize:**

```bash
# Use production mode
NODE_ENV=production npm start
```

### Frontend is slow

**Check:**

1. Clear browser cache
2. Check network tab (F12)
3. Rebuild: `npm run build`
4. Check for console errors

---

## Reset Everything

### Complete Reset

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json uploads
npm install
npm run seed

# Frontend
cd frontend
rm -rf node_modules package-lock.json dist .vite
npm install
npm run dev

# Database
# Option 1: Drop and recreate
mysql -u root -p
DROP DATABASE kaamsekaaam;
CREATE DATABASE kaamsekaaam;

# Option 2: Keep data, recreate tables
# In backend, set force: true in sequelize.sync()
```

### Clear Cache

```bash
# Backend
rm -rf .vite node_modules/.vite

# Frontend
rm -rf .vite dist node_modules/.vite
rm -rf ~/.npm

# Browser (Chrome)
# F12 → Application → Clear
```

---

## Getting Help

1. **Check README.md** - Comprehensive documentation
2. **Check QUICK-START.md** - Setup guide
3. **Check logs** - Terminal output usually shows the issue
4. **Check .env** - Configuration is often the problem
5. **Test with Postman** - Isolate API vs Frontend issues

---

## Log Files

### Backend Logs

Terminal output shows:

- Database sync status
- API calls and errors
- Email sending status

### Frontend Logs

Browser console (F12 → Console):

- API errors
- JavaScript errors
- Network issues

### MySQL Logs

```bash
# View MySQL log
tail -f /var/log/mysql/error.log  # Mac/Linux
```

---

**Still stuck?** Review the code comments and check the comprehensive README.md
