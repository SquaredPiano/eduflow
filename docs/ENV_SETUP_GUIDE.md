# 🔧 Environment Configuration Guide

**Last Updated**: October 25, 2025  
**Status**: ✅ Standardized for Phases 1-4

---

## 📋 Overview

This guide explains the standardized environment configuration for EduFlow AI, combining work from all team members across Phases 1-4.

### Configuration Files

1. **`.env`** - Primary environment file (Prisma uses this)
2. **`.env.local`** - Next.js environment file (auto-loaded by Next.js)
3. **`.env.example`** - Template with placeholders (tracked in git)

**Note**: Both `.env` and `.env.local` contain identical configurations and are kept in sync.

---

## 🔐 Phase-by-Phase Configuration

### Phase 1: Authentication & Database (Auth0)

```bash
# Auth0 Configuration
AUTH0_SECRET="use [generate-secret.ts] to create your own secret"
APP_BASE_URL="http://localhost:3000/"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_CALLBACK_URL="http://localhost:3000/auth/callback"
AUTH0_LOGOUT_URL="http://localhost:3000/"
AUTH0_DOMAIN="eduflow.ca.auth0.com"
AUTH0_ISSUER_BASE_URL="https://eduflow.ca.auth0.com"
AUTH0_CLIENT_ID="aSrXCRFxeNUyqBCqIkYfFwYCgazRmqMX"
AUTH0_CLIENT_SECRET="your_auth0_client_secret_here"
AUTH0_AUDIENCE="https://eduflow.ca.auth0.com/api/v2/"
```

**Configured Features**:
- ✅ User authentication
- ✅ Session management
- ✅ Secure callback handling
- ✅ Auth0 dashboard: `eduflow.ca.auth0.com`

### Phase 2: File Uploads (UploadThing)

```bash
# UploadThing Configuration
UPLOADTHING_TOKEN="your_uploadthing_token_here"
```

**Configured Features**:
- ✅ File upload endpoint
- ✅ Support for PDFs, slides, videos, audio
- ✅ Region: sea1 (Southeast Asia)
- ✅ App ID: 8oyjwniney

### Phase 3: Speech-to-Text (ElevenLabs)

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY="your_elevenlabs_api_key_here"
```

**Configured Features**:
- ✅ Audio transcription (MP3, MP4, WAV, WEBM, etc.)
- ✅ Video transcription
- ✅ High-quality speech-to-text
- ✅ 8+ format support

### Phase 4: AI Content Generation (Gemini)

```bash
# Gemini API Configuration
GEMINI_API_KEY="your_gemini_api_key_here"

# OpenRouter (Fallback)
OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

**Configured Features**:
- ✅ Gemini 2.5 Flash model (primary)
- ✅ 4 AI agents: Notes, Flashcards, Quiz, Slides
- ✅ OpenRouter fallback (Claude, GPT-4)
- ✅ Production-ready with robust JSON parsing

---

## 🗄️ Database Configuration (Supabase)

```bash
# Connection Pooling (for app queries)
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_DATABASE_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres.PROJECT_REF:YOUR_DATABASE_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
```

**Why Two URLs?**
- `DATABASE_URL`: Uses connection pooling (port 6543) - used by app at runtime
- `DIRECT_URL`: Direct connection (port 5432) - used by Prisma migrations

---

## 🔮 Future Phases Configuration

### Phase 5: Digital Ocean (Whisper Self-Hosting)

```bash
# Not yet configured - placeholders only
DROPLET_HOST="your-droplet-ip-here"
DROPLET_USER="root"
DROPLET_PASSWORD="your_droplet_password_here"
WHISPER_API_URL="http://your-droplet-ip:8000"
```

**Status**: ⏳ Pending setup  
**Purpose**: Cost-effective self-hosted transcription

### Phase 8: Canvas LMS Integration

```bash
# Not yet configured - placeholders only
CANVAS_API_URL="https://canvas.instructure.com/api/v1"
```

**Status**: ⏳ Pending setup  
**Purpose**: Course sync and assignment integration  
**Note**: Users will provide their own Canvas tokens

---

## 📱 Application Configuration

```bash
# Public Variables (accessible in browser)
NEXT_PUBLIC_APP_NAME="eduflow"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

---

## 🚀 Quick Setup for New Team Members

### 1. Initial Setup

```bash
# Clone repository
git clone https://github.com/SquaredPiano/eduflow.git
cd eduflow

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
cp .env.example .env.local
```

### 2. Get Configuration from Team

Ask team lead for the complete `.env` file or use the standardized values documented above.

### 3. Verify Setup

```bash
# Check database connection
npx prisma db push

# Verify environment loaded
npm run dev

# Run integration tests
npx tsx scripts/test-phases-3-4.ts
```

---

## 🔒 Security Notes

### ✅ What's Protected

- `.env` - **NOT** in git (sensitive keys)
- `.env.local` - **NOT** in git (sensitive keys)
- `.env.example` - **IN** git (template only, no real keys)

### ⚠️ Never Commit

- Real API keys
- Database passwords
- Auth0 secrets
- Service tokens

### 📝 Safe to Share in Documentation

- Service names (Auth0, Supabase, etc.)
- Configuration structure
- Variable names
- Port numbers and URLs format

---

## 🐛 Troubleshooting

### Problem: Prisma can't read .env.local

**Solution**: Prisma only reads `.env` file. Keep both files in sync:

```bash
# Both files should have identical content
cp .env.local .env
```

### Problem: Auth0 callback fails

**Solution**: Check callback URLs match:

```bash
AUTH0_CALLBACK_URL="http://localhost:3000/auth/callback"
```

Verify in Auth0 dashboard: https://manage.auth0.com/dashboard → Applications → Settings → Allowed Callback URLs

### Problem: Database connection fails

**Solution**: Verify you're using the correct URL for the operation:

- **Runtime queries**: Use `DATABASE_URL` (port 6543, pooled)
- **Migrations**: Use `DIRECT_URL` (port 5432, direct)

### Problem: Gemini API returns 404

**Solution**: Verify model name in `GeminiAdapter`:

```typescript
model: "gemini-2.5-flash" // ✅ Working model
```

---

## 📊 Configuration Checklist

### Phases 1-4 (Current)

- ✅ Database connection (Supabase)
- ✅ Auth0 authentication
- ✅ File uploads (UploadThing)
- ✅ Speech-to-text (ElevenLabs)
- ✅ AI generation (Gemini 2.5)
- ✅ AI fallback (OpenRouter)

### Phases 5+ (Future)

- ⏳ Digital Ocean Whisper
- ⏳ Canvas LMS integration
- ⏳ Export services
- ⏳ Production deployment variables

---

## 🔗 Service Dashboards

Quick links to manage your services:

- **Auth0**: https://manage.auth0.com/dashboard
- **Supabase**: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
- **UploadThing**: https://uploadthing.com/dashboard
- **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys
- **Google AI Studio**: https://makersuite.google.com/app/apikey
- **OpenRouter**: https://openrouter.ai/keys

---

## 📞 Need Help?

1. **Check documentation**: `docs/` folder
2. **Run tests**: `npx tsx scripts/test-phases-3-4.ts`
3. **Check logs**: Browser console + terminal
4. **Ask team**: All team members have working configs

---

**Last Verified**: October 25, 2025  
**All Services**: ✅ Operational  
**Test Status**: All integration tests passing
