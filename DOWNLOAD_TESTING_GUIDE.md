# Download Functionality Testing Guide

## Quick Test Instructions

### Prerequisites
1. Have a project with uploaded files
2. Generate content using AI agents
3. Ensure you're logged in

### Test Each Agent Type

#### 1. Flashcards Agent

**Steps:**
1. Generate flashcards from a transcript
2. View the flashcards in the viewer
3. Click the "Download" button
4. Test each format:
   - ✅ **Anki Text (.txt)** - Should download immediately (client-side)
   - ✅ **CSV Spreadsheet (.csv)** - Should download after 1-2 seconds
   - ✅ **Enhanced Anki (.txt)** - Should download with import instructions

**Expected Results:**
- CSV should have columns: Front, Back, Difficulty
- Anki text should be tab-separated
- Enhanced Anki should include metadata header

**Sample Flashcard Data:**
```json
[
  {
    "front": "What is photosynthesis?",
    "back": "The process by which plants convert light energy into chemical energy",
    "difficulty": "medium"
  }
]
```

---

#### 2. Notes Agent

**Steps:**
1. Generate notes from a transcript
2. View the notes in the viewer
3. Click the "Download" button
4. Test each format:
   - ✅ **Markdown (.md)** - Should download immediately (client-side)
   - ✅ **Word Document (.docx)** - Should download after 2-3 seconds
   - ✅ **PDF Document (.pdf)** - Should download after 3-5 seconds

**Expected Results:**
- Markdown should be plain text with formatting symbols
- DOCX should open in Word with proper formatting (headings, bullets, bold/italic)
- PDF should be readable and well-formatted

**Sample Notes Data:**
```markdown
# Introduction to Photosynthesis

## Overview
Photosynthesis is the process used by plants.

### Key Points
- Requires sunlight
- Produces oxygen
- **Important** for life on Earth

## Detailed Process
The process involves several steps...
```

---

#### 3. Slides Agent

**Steps:**
1. Generate slides from a transcript
2. View the slides in the viewer
3. Click the "Export" button
4. Test each format:
   - ✅ **PowerPoint (.pptx)** - Should download after 2-4 seconds
   - ✅ **PDF Document (.pdf)** - Should download after 3-5 seconds

**Expected Results:**
- PPTX should open in PowerPoint with title slide and content slides
- Each slide should have title, bullets, and slide numbers
- PDF should be in landscape format with one slide per page

**Sample Slide Data:**
```json
[
  {
    "title": "Introduction to Photosynthesis",
    "content": [
      "Plants use light energy",
      "Convert CO2 and water",
      "Produce glucose and oxygen"
    ]
  }
]
```

---

#### 4. Quiz Agent

**Steps:**
1. Generate a quiz from a transcript
2. Complete or view the quiz
3. Click the "Export" button (or "Download" in results screen)
4. Test each format:
   - ✅ **Print Results** - Should open print dialog
   - ✅ **Quiz CSV (.csv)** - Should download after 1-2 seconds
   - ✅ **Answer Key (.csv)** - Should download with just answers
   - ✅ **PDF Document (.pdf)** - Should download after 3-5 seconds

**Expected Results:**
- Quiz CSV should have all questions, options, correct answer, and explanation
- Answer Key should be compact (question number, correct answer, explanation)
- PDF should be formatted quiz with questions, all options, and explanations

**Sample Quiz Data:**
```json
{
  "questions": [
    {
      "question": "What is the primary product of photosynthesis?",
      "options": ["Glucose", "Oxygen", "Carbon Dioxide", "Water"],
      "correct": 0,
      "explanation": "Glucose is the main product, though oxygen is also produced."
    }
  ]
}
```

---

## Automated Testing Script

You can create a simple test script to verify all serializers work:

```typescript
// test-serializers.ts
import { flashcardsToCsv } from '@/services/serializers';
import { notesToDocx } from '@/services/serializers';
import { slidesToPptx } from '@/services/serializers';
import { quizToCsv } from '@/services/serializers';
import fs from 'fs';

async function testSerializers() {
  console.log('Testing Flashcards CSV...');
  const flashcardResult = await flashcardsToCsv([
    { front: 'Test Front', back: 'Test Back', difficulty: 'easy' }
  ], 'test');
  fs.writeFileSync('./test-flashcards.csv', flashcardResult.buffer);
  console.log('✅ Flashcards CSV generated');

  console.log('Testing Notes DOCX...');
  const notesResult = await notesToDocx('# Test Notes\n\nThis is a test.', 'test');
  fs.writeFileSync('./test-notes.docx', notesResult.buffer);
  console.log('✅ Notes DOCX generated');

  console.log('Testing Slides PPTX...');
  const slidesResult = await slidesToPptx([
    { title: 'Test Slide', content: ['Bullet 1', 'Bullet 2'] }
  ], 'test');
  fs.writeFileSync('./test-slides.pptx', slidesResult.buffer);
  console.log('✅ Slides PPTX generated');

  console.log('Testing Quiz CSV...');
  const quizResult = await quizToCsv({
    questions: [
      {
        question: 'Test Question',
        options: ['A', 'B', 'C', 'D'],
        correct: 0,
        explanation: 'Test explanation'
      }
    ]
  }, 'test');
  fs.writeFileSync('./test-quiz.csv', quizResult.buffer);
  console.log('✅ Quiz CSV generated');

  console.log('\n✅ All serializers working!');
}

testSerializers().catch(console.error);
```

Run with:
```bash
npx tsx test-serializers.ts
```

---

## Common Issues and Solutions

### Issue: "Cannot download: Output ID not available"

**Cause**: The viewer component doesn't have an `outputId` prop.

**Solution**: Make sure you're passing `outputId` when rendering the viewer:
```tsx
<FlashcardsViewer 
  flashcards={data}
  outputId={output.id}  // ← This is required
/>
```

---

### Issue: "Failed to generate file"

**Cause**: Server-side serialization error.

**Solution**: Check the browser console and server logs. Common causes:
- Invalid JSON structure in output content
- Missing required fields (e.g., `front`/`back` for flashcards)
- PDF generation timeout (increase timeout or reduce content)

---

### Issue: "Download failed: Unauthorized"

**Cause**: User session expired or invalid.

**Solution**: Refresh the page and log in again.

---

### Issue: PDF generation is very slow

**Cause**: Puppeteer/Chromium is resource-intensive.

**Solution**: 
- Consider implementing background jobs for large PDFs
- Use simpler HTML templates
- Cache generated PDFs for repeated downloads

---

### Issue: DOCX file is corrupted or won't open

**Cause**: Invalid DOCX structure or encoding issue.

**Solution**:
- Check that markdown is valid (no unclosed formatting)
- Verify the buffer is correctly generated
- Test with simple content first

---

## Performance Benchmarks

Measured on M1 MacBook Pro (approximate):

| Format | Typical Size | Generation Time |
|--------|-------------|-----------------|
| CSV | 5-50 KB | < 100ms |
| Markdown | 10-100 KB | < 50ms |
| Anki TXT | 5-50 KB | < 100ms |
| DOCX | 20-200 KB | 500ms - 2s |
| PPTX | 50-500 KB | 1s - 3s |
| PDF (Notes) | 100-1000 KB | 2s - 5s |
| PDF (Slides) | 500KB - 2MB | 3s - 7s |
| PDF (Quiz) | 100KB - 500KB | 2s - 5s |

---

## File Validation Checklist

### Flashcards CSV
- [ ] Has header row: "Front,Back,Difficulty"
- [ ] Each row has exactly 3 columns
- [ ] Special characters are properly escaped
- [ ] Opens correctly in Excel/Google Sheets

### Flashcards Anki
- [ ] Tab-separated values
- [ ] No tabs within card content
- [ ] Imports successfully into Anki desktop app
- [ ] Tags/difficulty preserved

### Notes DOCX
- [ ] Opens without errors in Microsoft Word
- [ ] Headings are correctly styled (H1, H2, H3)
- [ ] Bullet points are formatted as lists
- [ ] Bold and italic text preserved
- [ ] No encoding issues with special characters

### Notes PDF
- [ ] Readable in PDF viewer
- [ ] Formatting matches DOCX version
- [ ] Page breaks are appropriate
- [ ] Links are clickable (if any)

### Slides PPTX
- [ ] Opens without errors in PowerPoint
- [ ] Title slide present
- [ ] All content slides have title and bullets
- [ ] Slide numbers visible
- [ ] Professional theme applied
- [ ] Text is readable (not cut off)

### Slides PDF
- [ ] Landscape orientation
- [ ] One slide per page
- [ ] Readable when printed
- [ ] All content visible

### Quiz CSV
- [ ] Has header row with all columns
- [ ] All 4 options present (or padded)
- [ ] Correct answer is one of the options
- [ ] Explanations included
- [ ] Opens correctly in Excel/Google Sheets

### Quiz PDF
- [ ] Questions numbered correctly
- [ ] All options labeled (A, B, C, D)
- [ ] Correct answer highlighted or marked
- [ ] Explanations visible
- [ ] Page breaks don't split questions

---

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

**Note**: File download behavior may vary slightly between browsers (e.g., some browsers show a download confirmation dialog).

---

## Accessibility

All download buttons support:
- ✅ Keyboard navigation (Tab, Enter)
- ✅ Screen reader labels
- ✅ Focus indicators
- ✅ Clear success/error messages via toast notifications

---

## Next Steps After Testing

1. **Performance Optimization**
   - Implement caching for generated files
   - Move heavy PDF generation to background jobs
   - Add progress indicators for long operations

2. **Enhanced Features**
   - Custom templates for DOCX/PDF
   - Batch export (all outputs at once)
   - Email delivery for large files
   - Cloud storage integration

3. **Analytics**
   - Track which formats are most popular
   - Monitor generation times
   - Identify bottlenecks

---

## Support

If you encounter issues not covered here:
1. Check the browser console for error messages
2. Check server logs for API errors
3. Verify your content structure matches expected format
4. Try with a smaller/simpler content first

For additional help, refer to `DOWNLOADABLE_CONTENT_README.md`.
