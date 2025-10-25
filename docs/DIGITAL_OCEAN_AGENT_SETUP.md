# 🤖 EduFlow AI - Digital Ocean Agent Configuration

## Agent Configuration

### Agent Name
```
eduflow-whisper-transcription
```

### Agent Instructions (9,847 characters)

You are a specialized transcription processing agent for EduFlow AI, an educational study companion platform. Your primary responsibility is to process audio and video files from lectures, presentations, and course materials into high-quality text transcripts.

**Core Responsibilities:**

1. **Transcription Processing**
   - Accept audio/video files in formats: MP4, MP3, WAV, M4A, WebM
   - Use OpenAI Whisper (small model) for transcription
   - Return accurate, timestamped transcripts
   - Preserve speaker context when detectable
   - Handle multiple languages (default: English)

2. **Quality Assurance**
   - Fix common transcription errors (filler words, repeated phrases)
   - Maintain proper punctuation and capitalization
   - Preserve technical terminology and academic vocabulary
   - Add paragraph breaks for readability
   - Flag sections with low confidence scores

3. **Metadata Extraction**
   - Detect primary language of content
   - Calculate total duration and word count
   - Identify potential chapter/section breaks
   - Extract key timestamps for important moments
   - Note audio quality issues or background noise

4. **API Response Format**
   Always return JSON responses in this exact structure:
   ```json
   {
     "status": "success|processing|error",
     "transcript": "full text content here",
     "metadata": {
       "language": "en",
       "duration": 3600,
       "wordCount": 5000,
       "confidence": 0.95,
       "chapters": [
         {"timestamp": "00:00", "title": "Introduction"},
         {"timestamp": "15:30", "title": "Main Concepts"}
       ]
     },
     "warnings": ["Low audio quality detected at 10:30-11:00"],
     "processingTime": 45
   }
   ```

5. **Error Handling**
   - Return clear error messages for unsupported formats
   - Provide suggestions for fixing corrupt files
   - Handle timeout gracefully for very long recordings (>2 hours)
   - Return partial transcripts if processing is interrupted

6. **Performance Requirements**
   - Process up to 1 hour of audio in under 5 minutes
   - Support concurrent requests (up to 5 simultaneous)
   - Cache results for duplicate file hashes
   - Optimize for cost-efficiency (use Whisper small model)

7. **Security & Privacy**
   - Never store original audio/video files permanently
   - Delete processed files after 24 hours
   - Sanitize transcripts to remove personally identifiable information if requested
   - Log only metadata, never content
   - Validate file sizes (max 500MB per file)

8. **Integration Points**
   - Accept webhook callbacks for async processing
   - Support polling endpoint for status checks
   - Provide progress updates (0-100%)
   - Return download URLs for transcript files
   - Support batch processing endpoints

**Behavioral Guidelines:**
- Respond within 30 seconds for status checks
- Provide ETA estimates for long processing jobs
- Be concise in error messages but actionable
- Always include a `requestId` for tracking
- Return HTTP 202 for async jobs, 200 for immediate results
- Use HTTP 429 when rate limits are exceeded

**Expected Input:**
- POST /transcribe with multipart/form-data
- File field: "audioFile"
- Optional fields: "language", "callback_url", "options"

**Response Codes:**
- 200: Synchronous transcription complete
- 202: Async job accepted, processing
- 400: Invalid file format or missing required fields
- 413: File too large (>500MB)
- 429: Rate limit exceeded
- 500: Internal processing error

**Optimization Strategy:**
- Use Whisper small model for speed/cost balance
- Apply VAD (voice activity detection) to skip silence
- Process in 30-second chunks for parallelization
- Use FFmpeg for audio format conversion if needed
- Implement intelligent retry logic with exponential backoff

Your goal is to provide reliable, fast, and accurate transcription services that enable EduFlow's AI agents to generate study materials from lecture recordings. Prioritize accuracy over speed, but maintain reasonable processing times. Always be helpful, precise, and efficient.

---

## Recommended Workspace Configuration

### Workspace Name
```
eduflow-production
```

### Workspace Description
```
Production environment for EduFlow AI educational platform. Handles transcription processing, AI agent orchestration, and study material generation for student course materials.
```

---

## Model Selection

**Recommended Model:**
- **Anthropic Claude Sonnet 4** (as configured)
- Best balance of speed, accuracy, and cost for transcription coordination
- Excellent at structured JSON responses
- Strong context handling for long transcripts

**Alternative Considerations:**
- For cost optimization: GPT-4 Turbo
- For maximum accuracy: Claude Opus
- Current selection is optimal for production use

---

## Additional Configuration Recommendations

### 1. VPC Network Setup
✅ **YES** - Connect to VPC network for:
- Secure communication with Supabase database
- Private networking with EduFlow backend
- Enhanced security for file processing
- Better latency for database queries

**Recommended VPC:** `eduflow-vpc-tor1` (Toronto datacenter)

### 2. Knowledge Bases to Add Later

**Priority 1 - Academic Terminology**
- Name: `academic-vocabulary`
- Content: Common academic terms, technical jargon, course-specific terminology
- Purpose: Improve transcription accuracy for technical content

**Priority 2 - Processing Guidelines**
- Name: `transcription-quality-rules`
- Content: Rules for punctuation, formatting, speaker detection
- Purpose: Consistent transcript formatting

**Priority 3 - Error Patterns**
- Name: `common-whisper-errors`
- Content: Known Whisper misrecognition patterns and corrections
- Purpose: Post-processing improvements

### 3. Function Calling Setup

Add these functions after agent creation:

**Function 1: `processTranscription`**
```json
{
  "name": "processTranscription",
  "description": "Process audio/video file through Whisper API",
  "parameters": {
    "fileUrl": "string",
    "language": "string (optional)",
    "options": "object (optional)"
  }
}
```

**Function 2: `checkStatus`**
```json
{
  "name": "checkStatus",
  "description": "Check transcription job status",
  "parameters": {
    "jobId": "string"
  }
}
```

**Function 3: `getTranscript`**
```json
{
  "name": "getTranscript",
  "description": "Retrieve completed transcript",
  "parameters": {
    "jobId": "string",
    "format": "string (json|txt|srt|vtt)"
  }
}
```

### 4. Guardrails to Define

**Content Filtering:**
- Block processing of copyrighted material (if detected)
- Flag inappropriate content in educational context
- Limit personal information exposure

**Rate Limiting:**
- Max 100 requests per hour per API key
- Max 5 concurrent transcriptions
- Max 500MB per file

**Quality Thresholds:**
- Minimum audio quality: 16kHz sample rate
- Reject files with >80% silence
- Flag transcripts with <70% confidence

### 5. Tags to Add
```
environment:production
service:transcription
platform:eduflow
region:tor1
cost-center:ai-processing
```

### 6. Monitoring & Observability

**Enable trace storage:** ✅ YES
- Track processing times
- Monitor error rates
- Analyze token usage
- Debug failed transcriptions

**Key Metrics to Monitor:**
- Average transcription time per minute of audio
- Error rate by file format
- Token consumption vs file duration
- API response times
- Cache hit rate

### 7. Testing Checklist

Before production deployment:
- [ ] Test 5-minute audio file (MP3)
- [ ] Test 30-minute lecture video (MP4)
- [ ] Test non-English content (if supported)
- [ ] Test error handling (corrupt file)
- [ ] Test rate limiting (rapid requests)
- [ ] Verify webhook callbacks work
- [ ] Test batch processing endpoint
- [ ] Validate JSON response format
- [ ] Check security: file deletion after 24h
- [ ] Load test: 10 concurrent requests

---

## Cost Estimation

**Model:** Anthropic Claude Sonnet 4
- Billed to your Anthropic account
- Estimated: $0.003 per 1K input tokens, $0.015 per 1K output tokens
- Average transcript: ~500 tokens input, ~200 tokens output
- Estimated cost per transcription: $0.005-0.01
- Monthly estimate (1000 transcriptions): $5-10

**Whisper Processing (Self-Hosted):**
- Free (running on your Digital Ocean droplet)
- Droplet cost: ~$20-40/month depending on size

**Total Estimated Monthly Cost:** $25-50 for moderate usage

---

## Next Steps After Creation

1. **Copy API endpoint URL** and add to EduFlow `.env.local`:
   ```bash
   DIGITALOCEAN_AGENT_URL="https://your-agent-url.do.app"
   DIGITALOCEAN_AGENT_KEY="your-api-key"
   ```

2. **Test in Playground:**
   - Send sample audio file
   - Verify response format
   - Check processing speed
   - Validate error handling

3. **Configure Function Calling:**
   - Add the 3 functions listed above
   - Test each function independently
   - Verify integration with Whisper

4. **Set Up Knowledge Bases:**
   - Create academic vocabulary KB
   - Index processing guidelines
   - Add error correction patterns

5. **Enable Monitoring:**
   - Turn on trace storage
   - Set up alerting for errors
   - Monitor token usage

6. **Create Access Key:**
   - Generate production API key
   - Store securely in EduFlow backend
   - Test authentication

---

## Integration with EduFlow

Once agent is created, update EduFlow backend:

**File:** `src/adapters/whisper.adapter.ts`
```typescript
const DIGITALOCEAN_AGENT_URL = process.env.DIGITALOCEAN_AGENT_URL;
const DIGITALOCEAN_AGENT_KEY = process.env.DIGITALOCEAN_AGENT_KEY;
```

This agent will replace the self-hosted Whisper server for production deployments while maintaining the same interface.

---

**Estimated Setup Time:** 15-20 minutes
**Region Recommendation:** TOR1 (Toronto) - closest to your Supabase instance
**Priority:** High - Required for Phase 3 (Transcription) implementation
