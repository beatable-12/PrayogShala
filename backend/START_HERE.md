# 🚀 START HERE - PrayogShala Backend

Welcome! This is your complete Node.js/Express backend for PrayogShala.

---

## ⚡ 5-Minute Quick Start

### 1️⃣ Install Dependencies
```bash
cd backend
npm install
```

### 2️⃣ Setup Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and API keys
```

### 3️⃣ Run Server
```bash
npm run dev
```

### 4️⃣ Test It
```bash
curl http://localhost:5000/api/health
```

**Done!** Server is running on http://localhost:5000

---

## 📖 Documentation Guide

Pick your path:

### 🎯 I want to...

**...get started quickly**  
→ Read: `SETUP_GUIDE.md`  
→ Time: 15 minutes

**...understand the architecture**  
→ Read: `ARCHITECTURE.md`  
→ Time: 20 minutes

**...see all endpoints**  
→ Read: `README.md` (API section)  
→ Time: 10 minutes

**...understand the code**  
→ Read: `IMPLEMENTATION_GUIDE.md`  
→ Time: 45 minutes

**...see the complete overview**  
→ Read: `SUMMARY.md`  
→ Time: 10 minutes

**...see all files**  
→ Read: `FILE_INDEX.md`  
→ Time: 5 minutes

---

## 📚 File Organization

```
Code (Implementation)
├── server.js (main app)
├── config/db.js (database)
├── models/ (6 schemas)
├── controllers/ (6 handlers)
├── middleware/ (auth, validation, errors)
├── services/ (AI integrations)
└── utils/ (helpers)

Documentation (Learning)
├── START_HERE.md (this file!)
├── SETUP_GUIDE.md (setup instructions)
├── README.md (API reference)
├── ARCHITECTURE.md (design patterns)
├── IMPLEMENTATION_GUIDE.md (code details)
├── SUMMARY.md (overview)
└── FILE_INDEX.md (file listing)
```

---

## 🎓 Learning Path

**For Backend Developers:**
1. Run `npm install` and `npm run dev`
2. Read `SETUP_GUIDE.md` (API setup)
3. Read `ARCHITECTURE.md` (understand design)
4. Read `IMPLEMENTATION_GUIDE.md` (understand code)
5. Modify controllers/models as needed

**For Frontend Developers:**
1. Ask backend team for API_URL
2. Read `README.md` (API reference)
3. See `ROUTES_REFERENCE.js` (endpoints)
4. Test endpoints with Postman
5. Implement API calls in frontend

**For DevOps/Deployment:**
1. Read `SETUP_GUIDE.md` (dependencies)
2. Note all required environment variables
3. Set up MongoDB Atlas cluster
4. Get API keys (Gemini, Sarvam, Judge0)
5. Configure for your hosting platform

**For QA/Testing:**
1. Run `npm install && npm run dev`
2. Use Postman or curl
3. Test endpoints from `README.md`
4. Verify error handling
5. Test complete user flows

---

## 🔍 What You Get

✅ **6 Database Models**
- User (auth + profile)
- Module (curriculum)
- Topic (lessons)
- Submission (code)
- Viva (interviews)
- SkillReport (certificates)

✅ **6 Controllers**
- Auth (register, login)
- Modules (CRUD)
- Topics (CRUD + translation)
- Submissions (code execution)
- Viva (AI interviews)
- SkillReports (certificates)

✅ **3 AI Services**
- Judge0 (code execution)
- Gemini (viva questions)
- Sarvam (translation + audio)

✅ **Middleware Stack**
- JWT authentication
- Input validation
- Error handling
- Rate limiting
- CORS

---

## ⚠️ Before You Start

**You need:**
- Node.js 16+ (`node --version`)
- npm 7+ (`npm --version`)
- MongoDB Atlas account (free tier)
- API keys:
  - Google Gemini
  - Sarvam AI
  - Judge0

**If you don't have them:**
1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Get Gemini key: https://aistudio.google.com/apikey
3. Get Sarvam key: https://www.sarvam.ai
4. Get Judge0 key: https://rapidapi.com/judge0-official/api/judge0-ce

---

## 🐛 Common Issues

### "Cannot find module 'express'"
```bash
npm install
```

### "MONGO_URI is not defined"
```bash
cp .env.example .env
# Edit .env and add MongoDB connection string
```

### "Port 5000 already in use"
```bash
# Change PORT in .env or kill process on port 5000
```

### "MongoDB connection failed"
- Check .env MONGO_URI
- Add your IP to MongoDB Atlas Network Access
- Ensure cluster is running (not paused)

**More help:** See `SETUP_GUIDE.md` → Troubleshooting

---

## 🧪 Quick Test

After running `npm run dev`:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "preferredLang": "English"
  }'

# Get all modules
curl http://localhost:5000/api/modules
```

---

## 📊 Architecture Overview

```
Client (React)
    ↓ HTTP
Express Server
    ├→ Routes (in server.js)
    ├→ Middleware (auth, validation, errors)
    ├→ Controllers (business logic)
    ├→ Services (AI APIs)
    ├→ Models (Mongoose)
    └→ Database (MongoDB)
```

---

## 💡 Key Features

🔐 **Security**
- JWT authentication
- Password hashing (bcrypt)
- Input validation
- Rate limiting
- CORS

🧠 **AI Integration**
- Gemini for code-aware viva questions
- Sarvam for translation + text-to-speech
- Judge0 for code execution

✨ **Multi-Language**
- English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi
- Automatic concept translation
- Audio generation

📈 **Learning Path**
- Modules (curriculum groups)
- Topics (individual lessons)
- Validation quizzes
- Code projects
- Viva interviews
- Digital certificates

---

## 🚀 Next Steps

1. **Setup** (15 min)
   ```bash
   npm install
   cp .env.example .env
   # Edit .env
   npm run dev
   ```

2. **Test** (5 min)
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Learn** (30 min)
   - Read `README.md` for API overview
   - Read `ARCHITECTURE.md` for design

4. **Explore** (ongoing)
   - Test endpoints with Postman
   - Create sample data
   - Connect to frontend

5. **Deploy** (when ready)
   - See `SETUP_GUIDE.md` → Deployment

---

## 📞 Where to Find Things

| Need | File | Section |
|------|------|---------|
| API endpoints | README.md | API Endpoints |
| How to setup | SETUP_GUIDE.md | Step 1-7 |
| Architecture | ARCHITECTURE.md | Overview |
| Code details | IMPLEMENTATION_GUIDE.md | All files |
| All files | FILE_INDEX.md | Complete listing |
| Quick overview | SUMMARY.md | Features |
| This guide | START_HERE.md | You are here! |

---

## 🎯 Success Checklist

- [ ] Cloned/downloaded backend
- [ ] Ran `npm install`
- [ ] Created `.env` file
- [ ] Filled in MongoDB URI
- [ ] Filled in API keys (Gemini, Sarvam, Judge0)
- [ ] Ran `npm run dev`
- [ ] Server started successfully
- [ ] Health check endpoint works
- [ ] Read `README.md`
- [ ] Tested a few API endpoints

**Once you check all boxes:** You're ready to build! 🚀

---

## 📚 Full Documentation

1. **START_HERE.md** ← You are here
2. `SETUP_GUIDE.md` - Complete setup instructions
3. `README.md` - API reference
4. `ARCHITECTURE.md` - Design patterns
5. `IMPLEMENTATION_GUIDE.md` - Code details
6. `SUMMARY.md` - Overview
7. `FILE_INDEX.md` - File listing

---

## 🎉 Welcome!

You have a **production-ready backend** with:

✅ 45+ API endpoints  
✅ 6 database models  
✅ 3 AI service integrations  
✅ Complete authentication  
✅ Error handling  
✅ Input validation  
✅ Comprehensive documentation  

**Now get started!**

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

---

## Questions?

1. **"How do I...?"** → Check `README.md`
2. **"What is...?"** → Check `ARCHITECTURE.md`
3. **"How does this work?"** → Check `IMPLEMENTATION_GUIDE.md`
4. **"I'm stuck"** → Check `SETUP_GUIDE.md` → Troubleshooting
5. **"What files are there?"** → Check `FILE_INDEX.md`

---

**Happy coding! 🚀**

Your PrayogShala backend is ready to power an amazing learning platform.
