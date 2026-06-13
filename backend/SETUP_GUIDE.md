# PrayogShala Backend - Complete Setup Guide

## ✅ Pre-Requisites

Before you start, ensure you have:

- **Node.js**: v16 or higher (check: `node --version`)
- **npm**: v7 or higher (check: `npm --version`)
- **Git**: For version control
- **MongoDB Atlas Account**: Free tier available at https://www.mongodb.com/cloud/atlas

## 🔑 API Keys Required

You'll need credentials from these services:

1. **Google Gemini API**
   - Visit: https://aistudio.google.com/apikey
   - Create API key
   - Use in: GEMINI_API_KEY

2. **Sarvam AI**
   - Visit: https://www.sarvam.ai/
   - Sign up and get API key
   - Use in: SARVAM_API_KEY

3. **Judge0 CE (via RapidAPI)**
   - Visit: https://rapidapi.com/judge0-official/api/judge0-ce
   - Subscribe (free tier available)
   - Get API key
   - Use in: JUDGE0_API_KEY

## 📦 Step 1: Installation

### Clone/Navigate to Backend Directory

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

This installs all packages from `package.json`:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- helmet
- express-validator
- morgan
- express-rate-limit
- dotenv
- node-fetch

### Verify Installation

```bash
npm list
```

Should show all dependencies without errors.

---

## 🔐 Step 2: Environment Configuration

### Create .env File

Copy the example file:
```bash
cp .env.example .env
```

### Edit .env with Your Credentials

Open `.env` in your editor and fill in ALL values:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
# Format: mongodb+srv://username:password@cluster.mongodb.net/databasename
# Get connection string from MongoDB Atlas dashboard
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/prayogshala?retryWrites=true&w=majority

# JWT Authentication
# Make it long and random (min 32 chars)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Sarvam AI (Translation & Text-to-Speech)
SARVAM_API_KEY=your_sarvam_api_key_here
SARVAM_BASE_URL=https://api.sarvam.ai

# Google Gemini API (AI Viva Questions)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta

# Judge0 (Code Execution Sandbox)
# Get from RapidAPI Judge0 CE page
JUDGE0_API_KEY=your_judge0_api_key_here
JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com

# Frontend URL for CORS
CLIENT_URL=http://localhost:3000
```

### How to Get Each Value

#### MongoDB Atlas Connection String

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier)
3. Click "Connect"
4. Select "Drivers"
5. Copy connection string
6. Replace `<username>` and `<password>` with your database credentials
7. Replace `myFirstDatabase` with `prayogshala`

**Example**:
```
mongodb+srv://rajesh_user:MySecure123@cluster0.abc123.mongodb.net/prayogshala?retryWrites=true&w=majority
```

#### JWT_SECRET

Generate a random string (use any of these):

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Online generator
# https://generate-random.org/encryption-key-generator
```

Example output: `a7f3c8e1b2d9f4g6h1j2k3l4m5n6o7p8`

#### API Keys

Each service has a different process:

**Gemini**:
1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key

**Sarvam**:
1. Go to https://www.sarvam.ai/
2. Sign up (free tier)
3. Go to dashboard
4. Copy API key

**Judge0** (via RapidAPI):
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Click "Subscribe"
3. Choose free plan
4. Go to API key section
5. Copy X-RapidAPI-Key

---

## 🗄️ Step 3: Verify MongoDB Connection

Before running server, test MongoDB:

### Test from Node.js

```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.log('❌ Error:', err.message));
"
```

### If Connection Fails

**Common issues**:

1. **"authentication failed"**
   - Check username and password in connection string
   - Verify credentials in MongoDB Atlas

2. **"IP not whitelisted"**
   - Go to MongoDB Atlas → Network Access
   - Add your IP address (or 0.0.0.0 for all)

3. **"database not found"**
   - MongoDB creates database automatically on first write
   - Connection string should have correct database name

---

## 🚀 Step 4: Run the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Expected output:
```
✅ Server running on port 5000
🌍 Environment: development
📊 API Health: http://localhost:5000/api/health
✅ MongoDB Connected: cluster0.xxx.mongodb.net
```

### Production Mode

```bash
npm start
```

### Test Server is Running

In another terminal:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "env": "development"
}
```

---

## 🧪 Step 5: Test API Endpoints

### 1. User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "preferredLang": "English"
  }'
```

Save the token from response (you'll use it for protected endpoints).

### 2. User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 3. Get User Profile (Protected)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get All Modules

```bash
curl http://localhost:5000/api/modules
```

### 5. Create a Module (Admin)

First, update your user's role to admin in MongoDB:
```javascript
// In MongoDB console or Compass
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "admin" } }
)
```

Then:
```bash
curl -X POST http://localhost:5000/api/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Arrays & Hashing",
    "description": "Master array operations and hash tables",
    "order": 1,
    "totalLessons": 5,
    "estimatedHours": 8,
    "isPublished": true
  }'
```

---

## 📊 Step 6: Populate Sample Data

### Create Module

```bash
curl -X POST http://localhost:5000/api/modules \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to DSA",
    "description": "Learn fundamental data structures",
    "order": 1,
    "totalLessons": 3,
    "estimatedHours": 10,
    "isPublished": true
  }'
```

**Save the module ID** from response.

### Create Topic

```bash
curl -X POST http://localhost:5000/api/topics \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "MODULE_ID_HERE",
    "title": "Two Pointers",
    "slug": "two-pointers",
    "conceptText": "The two pointers technique uses two references to solve problems efficiently. Start with pointers at opposite ends or same point, then move based on conditions.",
    "difficulty": "EASY",
    "xpReward": 250,
    "estimatedMinutes": 15,
    "validationQuiz": {
      "question": "What is the time complexity of two pointers?",
      "options": ["O(n)", "O(n²)", "O(log n)", "O(n log n)"],
      "correctAnswer": "O(n)",
      "type": "mcq"
    },
    "projectTemplate": {
      "title": "Two Sum Problem",
      "language": "python",
      "starterCode": "def twoSum(arr, target):\n    # TODO: Implement two pointer approach\n    pass",
      "testCases": [
        {
          "input": "[1,2,3,4,5] 6",
          "expectedOutput": "[0,4]"
        },
        {
          "input": "[1,1,1,1] 2",
          "expectedOutput": "[0,1]"
        }
      ]
    },
    "isPublished": true
  }'
```

---

## 🛠️ Step 7: Troubleshooting

### Server Won't Start

**Error**: `Cannot find module 'express'`
- **Solution**: Run `npm install`

**Error**: `MONGO_URI is not defined`
- **Solution**: Create `.env` file and add MONGO_URI

**Error**: `connect ECONNREFUSED 127.0.0.1:5000`
- **Solution**: Port 5000 is in use. Change PORT in .env or kill process on port 5000

### Database Connection Issues

**Error**: `authentication failed`
- **Solution**: Check username/password in MongoDB connection string

**Error**: `IP address not whitelisted`
- **Solution**: Add your IP to MongoDB Atlas Network Access (or use 0.0.0.0)

**Error**: `connection timed out`
- **Solution**: Ensure MongoDB Atlas cluster is running (not paused)

### API Requests Failing

**Error**: `401 Unauthorized`
- **Solution**: Include Authorization header with valid JWT token

**Error**: `404 Not Found`
- **Solution**: Check endpoint URL and HTTP method

**Error**: `422 Validation Error`
- **Solution**: Check request body matches expected format

### Check Server Logs

Development logs show:
- HTTP requests (Morgan)
- Mongoose queries
- Error stack traces
- Custom console.log statements

---

## 📱 Using Postman

### Import API Collection

1. Open Postman
2. Create new collection "PrayogShala API"
3. Add requests:

**Register Request**:
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPass123",
  "preferredLang": "English"
}
```

**Login Request**:
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "TestPass123"
}
```

**Protected Request (Get Me)**:
```
GET http://localhost:5000/api/auth/me
Headers:
Authorization: Bearer {{token}}
```

### Set Up Environment Variables in Postman

1. Click "Environments" (left sidebar)
2. Create new environment "PrayogShala"
3. Add variables:
   - `base_url`: http://localhost:5000
   - `token`: (leave blank initially)
4. After login, set `{{token}}` from response

---

## 🚀 Deployment Preparation

### Before Going to Production

- [ ] Set `NODE_ENV=production` in .env
- [ ] Use strong JWT_SECRET (min 32 chars, random)
- [ ] Add frontend domain to CLIENT_URL
- [ ] Test all endpoints
- [ ] Set up MongoDB backups
- [ ] Enable HTTPS
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure production database
- [ ] Test rate limiting
- [ ] Verify all API keys are valid
- [ ] Set up CI/CD pipeline

### Deploy to Heroku (Example)

```bash
# Create Heroku app
heroku create prayogshala-api

# Set environment variables
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...
heroku config:set GEMINI_API_KEY=...
# ... etc

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## 📚 Additional Resources

- **Express.js**: https://expressjs.com/
- **Mongoose**: https://mongoosejs.com/
- **JWT**: https://jwt.io/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Postman**: https://www.postman.com/
- **Git**: https://git-scm.com/

---

## 📞 Support & Debugging

### Enable Debug Mode

```bash
# Show all requests
DEBUG=* npm run dev

# Show only mongoose queries
DEBUG=mongoose:* npm run dev

# Show only express requests
DEBUG=express:* npm run dev
```

### Check Database

Install MongoDB Compass (GUI for MongoDB):
https://www.mongodb.com/products/compass

Connect to your MongoDB and browse collections.

### API Testing Tools

- **Postman**: Desktop app for API testing
- **curl**: Command line tool (already in examples)
- **VS Code Extension**: Thunder Client or REST Client
- **Online**: Swagger UI, API testing websites

---

## 🎉 Next Steps

Once backend is running:

1. **Test all endpoints** using the examples above
2. **Create sample data** (modules, topics, etc.)
3. **Connect frontend** to backend (update API_URL)
4. **Set up authentication** in frontend to use JWT tokens
5. **Test complete user flow** (register → learn → submit → viva → certificate)

---

## 📋 Checklist

### Initial Setup
- [ ] Node.js and npm installed
- [ ] Backend folder downloaded/cloned
- [ ] npm install completed
- [ ] .env file created with all values
- [ ] MongoDB Atlas cluster created
- [ ] API keys obtained (Gemini, Sarvam, Judge0)

### Before First Run
- [ ] .env variables verified
- [ ] MongoDB connection string tested
- [ ] All API keys added to .env

### First Run
- [ ] Server starts without errors
- [ ] Health check endpoint works
- [ ] MongoDB connection successful
- [ ] Can register a user
- [ ] Can login
- [ ] Can access protected endpoints

### Sample Data Creation
- [ ] Create at least 1 module
- [ ] Create at least 1 topic per module
- [ ] Add validation quiz
- [ ] Add project template with test cases

### Ready for Production
- [ ] All endpoints tested
- [ ] Error handling verified
- [ ] Rate limiting works
- [ ] CORS configured for frontend domain
- [ ] Logs reviewed and clean
- [ ] Database backed up
- [ ] Deployment plan created

---

Good luck! Your PrayogShala backend is ready to go! 🚀
