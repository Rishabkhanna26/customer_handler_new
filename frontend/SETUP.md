# AlgoAura - Frontend with Integrated Database Auth

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
DB_HOST=localhost
DB_USER=admin
DB_PASSWORD=root
DB_NAME=client_handle
DB_PORT=3306
JWT_SECRET=algoaura-dev-secret-key-2024
```

### 3. Run the Frontend

```bash
npm run dev
```

Server runs on: `http://localhost:3000` (or `3001` if port is in use)

## Database Integration

The login and signup flow now uses the `admin_accounts` table in the `client_handle` database.

### How It Works:
1. Login page sends credentials to `/api/auth/login`
2. API route queries `admin_accounts` by email or phone
3. Validates password using a salted `scrypt` hash
4. Generates a JWT session cookie on success
5. Redirects to the dashboard

### Default Seed Credentials

If you ran `npm run setup-db`, the seed creates:
- Super Admin: `superadmin@algoaura.com` / `9999999999`
- Client Admins: `admin1@client.com`, `admin2@client.com`

Default password for seeded admins:
```
Admin@123
```

If no super admin exists, the first signup will be created as `super_admin`.

### API Endpoint

**POST** `/api/auth/login`

Request:
```json
{
  "email": "admin@erosteps.com",
  "password": "your-password-or-root"
}
```

Response on success:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "admin",
    "email": "admin@erosteps.com",
    "role": "Administrator"
  }
}
```

## Test Database Connection

Run the test script:
```bash
node test-db.js
```

This will:
- ✅ Verify database connection
- ✅ Confirm admin_accounts table exists

## Project Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── login/
│   │           └── route.js          (Login API endpoint)
│   ├── layout.js
│   ├── page.js                       (Homepage redirect)
│   ├── login/
│   │   └── page.js                   (Login form)
│   ├── dashboard/
│   │   └── page.js
│   └── ... (other pages)
├── components/
├── utils/
│   └── api.js                        (API client)
├── .env                              (Backend env vars)
├── .env.local                        (Frontend env vars)
├── package.json
└── test-db.js                        (Database test script)
```

## Troubleshooting

### Port Already in Use
If port 3000 is in use, Next.js will automatically try 3001, 3002, etc.

### Database Connection Error
Check that:
1. MySQL/MariaDB is running
2. Credentials in `.env` are correct
3. Database `aegisav` exists
4. `wp_users` table exists

### Password Not Working
- Try using the master password: `root`
- Or use the actual WordPress user password if you know it
- Passwords are hashed with WordPress phpass algorithm

## No Backend Server Needed!

Everything runs in the Next.js frontend:
- No separate backend folder
- API routes handle database queries
- Secure - credentials are in `.env` (server-side only)
- Simple and efficient
