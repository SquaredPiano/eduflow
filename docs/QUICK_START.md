# 🚀 EduFlow AI - Quick Start Guide

## 📋 Prerequisites

- Node.js 20+ installed
- PostgreSQL database (via Supabase)
- All API keys from `.env.local`
- Digital Ocean droplet (for Whisper)

---

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Set Up Database
```powershell
# Initialize Prisma
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 3. Generate Auth0 Secret
```powershell
# Run this and add output to .env.local as AUTH0_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start Development Server
```powershell
npm run dev
```

Visit: http://localhost:3000

---

## 🔧 Digital Ocean Whisper Setup

### SSH into Droplet
```powershell
ssh root@your-droplet-ip
# Password: your_droplet_password_here
```

### Install Dependencies
```bash
apt update
apt install -y python3-pip ffmpeg
pip3 install openai-whisper fastapi uvicorn python-multipart
```

### Create Whisper Server
```bash
cat > /root/whisper_server.py << 'EOF'
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
model = whisper.load_model("small")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Transcribe
        result = model.transcribe(tmp_path)
        
        # Cleanup
        os.unlink(tmp_path)
        
        return {
            "text": result["text"],
            "language": result["language"],
            "duration": result.get("duration", 0)
        }
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/health")
async def health():
    return {"status": "ok", "model": "whisper-small"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF
```

### Create Systemd Service
```bash
cat > /etc/systemd/system/whisper-api.service << 'EOF'
[Unit]
Description=Whisper Transcription API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/python3 /root/whisper_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### Start Service
```bash
systemctl daemon-reload
systemctl enable whisper-api
systemctl start whisper-api

# Check status
systemctl status whisper-api
```

### Test It
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","model":"whisper-small"}
```

Update `.env.local`:
```
WHISPER_API_URL="http://your-droplet-ip:8000"
```

---

## 🧪 Verify Everything Works

### Test Auth0
1. Go to http://localhost:3000
2. Click login
3. Should redirect to Auth0
4. After login, should return to app

### Test Database
```powershell
npx prisma studio
```
Should open Prisma Studio at http://localhost:5555

### Test Whisper (from local machine)
```powershell
# Create test request
Invoke-RestMethod -Uri "http://your-droplet-ip:8000/health" -Method Get
```

---

## 📁 Project Structure Quick Reference

```
src/
├── adapters/          # External API integrations
│   ├── auth0.adapter.ts
│   ├── gemini.adapter.ts
│   ├── whisper.adapter.ts
│   ├── supabase.adapter.ts
│   └── uploadthing.adapter.ts
│
├── services/          # Business logic
│   ├── ingest.service.ts
│   ├── transcribe.service.ts
│   ├── generate.service.ts
│   ├── export.service.ts
│   └── agents/        # AI Agents
│       ├── NotesAgent.ts
│       ├── FlashcardAgent.ts
│       ├── QuizAgent.ts
│       └── SlidesAgent.ts
│
├── domain/            # Core business entities
│   ├── entities/
│   ├── interfaces/
│   └── types/
│
├── app/               # Next.js pages
│   ├── api/          # API routes
│   ├── dashboard/
│   └── auth/
│
├── components/        # React components
│   ├── ui/           # shadcn components
│   ├── canvas/       # React Flow canvas
│   └── agents/       # Agent UI
│
└── hooks/            # Custom React hooks
```

---

## 🎯 Development Workflow

### Phase 1: Foundation (You are here!)
- [x] Environment configured
- [x] Prisma schema created
- [ ] Auth0 working
- [ ] Basic UI setup

### Phase 2: File Upload
- [ ] UploadThing configured
- [ ] Upload UI built
- [ ] Text extraction working

### Phase 3: Transcription
- [ ] Whisper server running
- [ ] Transcribe service working
- [ ] Progress indicators

### Phase 4: AI Agents
- [ ] Gemini adapter
- [ ] All 4 agents implemented
- [ ] Agent chat interface

### Phase 5: Canvas Integration
- [ ] Canvas API working
- [ ] Course sync

### Phase 6: Exports
- [ ] PDF, Anki, CSV, PPTX exports

### Phase 7: UI Polish
- [ ] React Flow canvas
- [ ] Animations
- [ ] Responsive design

### Phase 8: Testing & Deploy
- [ ] Tests written
- [ ] Deployed to Vercel

---

## 🐛 Common Issues & Solutions

### Prisma Error: Can't reach database
**Solution**: Check DATABASE_URL in `.env.local`. Make sure password is correct.
```powershell
npx prisma db push --force-reset  # Reset if needed
```

### Auth0 Login Loop
**Solution**: Make sure AUTH0_SECRET is set and BASE_URL matches your dev server.

### Whisper Server Not Responding
**Solution**:
```bash
# SSH into droplet
systemctl status whisper-api
journalctl -u whisper-api -f  # View logs
```

### UploadThing Upload Fails
**Solution**: Check UPLOADTHING_TOKEN is correct and not wrapped in extra quotes.

### Type Errors in TypeScript
**Solution**:
```powershell
# Regenerate Prisma types
npx prisma generate

# Check types
npm run lint
```

---

## 📚 Essential Commands

```powershell
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma studio        # Visual database browser
npx prisma db push       # Sync schema to DB
npx prisma db seed       # Run seed data
npx prisma migrate dev   # Create migration
npx prisma generate      # Regenerate client

# Testing (when set up)
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## 🎓 Next Steps

1. **Get Auth0 Working**
   - Test login flow
   - Verify user creation in database

2. **Build Upload UI**
   - Create drag-and-drop component
   - Test file upload

3. **Implement First Agent (Notes)**
   - Set up Gemini adapter
   - Create NotesAgent
   - Test generation

4. **Follow Implementation Plan**
   - See `IMPLEMENTATION_PLAN.md` for detailed phase breakdown

---

## 💡 Pro Tips

- **Use Prisma Studio** to inspect database during development
- **Check browser console** for frontend errors
- **Check terminal** for backend errors
- **Test Whisper endpoint** with simple curl before integrating
- **Commit often** to track progress
- **Use PROMPT_INSTRUCTIONS.md** when working with AI assistants

---

## 🆘 Need Help?

1. Check `IMPLEMENTATION_PLAN.md` for detailed guidance
2. Check `PROMPT_INSTRUCTIONS.md` for AI prompting tips
3. Review existing code in similar features
4. Check documentation:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Prisma Docs](https://www.prisma.io/docs)
   - [Auth0 Docs](https://auth0.com/docs)
   - [Supabase Docs](https://supabase.com/docs)

---

**You're all set! Start building! 🚀**
