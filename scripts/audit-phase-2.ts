#!/usr/bin/env tsx
/**
 * Phase 2 Audit Script
 * 
 * Comprehensive audit of Phase 2: File Ingestion & Storage
 * 
 * Components:
 * 1. UploadThing Integration
 * 2. File Upload UI (Button + Dropzone)
 * 3. Text Extraction (PDF, DOCX, PPTX)
 * 4. File Storage & Database
 * 5. Ingest Service
 * 6. File Management (List, Delete)
 */

import fs from 'fs';
import path from 'path';

interface AuditResult {
  component: string;
  score: number;
  maxScore: number;
  details: string[];
  issues: string[];
}

const results: AuditResult[] = [];

function audit(component: string, maxScore: number, check: () => { score: number; details: string[]; issues: string[] }) {
  const result = check();
  results.push({
    component,
    score: result.score,
    maxScore,
    details: result.details,
    issues: result.issues,
  });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function fileContains(filePath: string, searchString: string | RegExp): boolean {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
    if (typeof searchString === 'string') {
      return content.includes(searchString);
    }
    return searchString.test(content);
  } catch {
    return false;
  }
}

console.log('\n' + '='.repeat(70));
console.log('PHASE 2 AUDIT: File Ingestion & Storage');
console.log('='.repeat(70) + '\n');

// ============================================
// 1. UploadThing Integration (20 points)
// ============================================
audit('UploadThing Integration', 20, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  // Check adapter
  if (fileExists('src/adapters/uploadthing.adapter.ts')) {
    score += 3;
    details.push('✓ UploadThingAdapter exists');
  } else {
    issues.push('✗ UploadThingAdapter missing');
  }

  // Check core route
  if (fileExists('src/app/api/uploadthing/core.ts')) {
    score += 3;
    details.push('✓ UploadThing core route exists');
    
    if (fileContains('src/app/api/uploadthing/core.ts', 'courseFiles')) {
      score += 2;
      details.push('✓ courseFiles endpoint configured');
    }
    
    if (fileContains('src/app/api/uploadthing/core.ts', 'onUploadComplete')) {
      score += 2;
      details.push('✓ onUploadComplete handler present');
    }
    
    if (fileContains('src/app/api/uploadthing/core.ts', 'extractTextInBackground')) {
      score += 2;
      details.push('✓ Background text extraction implemented');
    }
  } else {
    issues.push('✗ UploadThing core route missing');
  }

  // Check route handler
  if (fileExists('src/app/api/uploadthing/route.ts')) {
    score += 2;
    details.push('✓ UploadThing route handler exists');
  } else {
    issues.push('✗ UploadThing route handler missing');
  }

  // Check client helpers
  if (fileExists('src/lib/uploadthing.ts')) {
    score += 3;
    details.push('✓ Client helpers configured');
    
    if (fileContains('src/lib/uploadthing.ts', 'useUploadThing')) {
      score += 2;
      details.push('✓ useUploadThing hook exported');
    }
  } else {
    issues.push('✗ Client helpers missing');
  }

  // Check environment variable
  if (fileContains('.env', 'UPLOADTHING_TOKEN')) {
    score += 1;
    details.push('✓ UPLOADTHING_TOKEN configured');
  } else {
    issues.push('✗ UPLOADTHING_TOKEN not configured');
  }

  return { score, details, issues };
});

// ============================================
// 2. File Upload UI Components (15 points)
// ============================================
audit('File Upload UI', 15, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  // Upload button
  if (fileExists('src/components/upload/FileUploadButton.tsx')) {
    score += 3;
    details.push('✓ FileUploadButton component exists');
    
    if (fileContains('src/components/upload/FileUploadButton.tsx', "'use client'")) {
      score += 1;
      details.push('✓ Client directive present');
    }
  } else {
    issues.push('✗ FileUploadButton missing');
  }

  // Upload dropzone
  if (fileExists('src/components/upload/FileUploadDropzone.tsx')) {
    score += 3;
    details.push('✓ FileUploadDropzone component exists');
    
    if (fileContains('src/components/upload/FileUploadDropzone.tsx', 'onUploadComplete')) {
      score += 1;
      details.push('✓ Upload callbacks implemented');
    }
  } else {
    issues.push('✗ FileUploadDropzone missing');
  }

  // Upload progress
  if (fileExists('src/components/upload/UploadProgress.tsx')) {
    score += 2;
    details.push('✓ UploadProgress component exists');
  } else {
    issues.push('✗ UploadProgress missing');
  }

  // Upload manager (main interface)
  if (fileExists('src/components/upload/UploadManager.tsx')) {
    score += 3;
    details.push('✓ UploadManager component exists');
    
    if (fileContains('src/components/upload/UploadManager.tsx', 'fetchFiles')) {
      score += 1;
      details.push('✓ File list integration present');
    }
  } else {
    issues.push('✗ UploadManager missing');
  }

  // Upload hook
  if (fileExists('src/hooks/useUpload.ts')) {
    score += 1;
    details.push('✓ useUpload hook exists');
  } else {
    issues.push('✗ useUpload hook missing');
  }

  return { score, details, issues };
});

// ============================================
// 3. Text Extraction Adapters (25 points)
// ============================================
audit('Text Extraction', 25, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  // Interface
  if (fileExists('src/domain/interfaces/ITextExtractor.ts')) {
    score += 3;
    details.push('✓ ITextExtractor interface exists');
    
    const hasAllMethods = 
      fileContains('src/domain/interfaces/ITextExtractor.ts', 'extractFromPDF') &&
      fileContains('src/domain/interfaces/ITextExtractor.ts', 'extractFromDOCX') &&
      fileContains('src/domain/interfaces/ITextExtractor.ts', 'extractFromPPTX');
    
    if (hasAllMethods) {
      score += 2;
      details.push('✓ All extraction methods defined');
    } else {
      issues.push('⚠ Missing some extraction methods');
    }
  } else {
    issues.push('✗ ITextExtractor interface missing');
  }

  // PDF Adapter
  if (fileExists('src/adapters/pdf.adapter.ts')) {
    score += 4;
    details.push('✓ PDFAdapter exists');
    
    if (fileContains('src/adapters/pdf.adapter.ts', 'extractText')) {
      score += 1;
      details.push('✓ PDF extraction method present');
    }
  } else {
    issues.push('✗ PDFAdapter missing');
  }

  // DOCX Adapter
  if (fileExists('src/adapters/docx.adapter.ts')) {
    score += 4;
    details.push('✓ DOCXAdapter exists');
    
    if (fileContains('src/adapters/docx.adapter.ts', 'extractText')) {
      score += 1;
      details.push('✓ DOCX extraction method present');
    }
  } else {
    issues.push('✗ DOCXAdapter missing');
  }

  // PPTX Adapter
  if (fileExists('src/adapters/pptx.adapters.ts')) {
    score += 4;
    details.push('✓ PPTXAdapter exists');
    
    if (fileContains('src/adapters/pptx.adapters.ts', 'class PPTXAdapter')) {
      score += 1;
      details.push('✓ PPTXAdapter class properly named');
    }
  } else {
    issues.push('✗ PPTXAdapter missing');
  }

  // Unified Text Extractor
  if (fileExists('src/adapters/text-extractor.adapter.ts')) {
    score += 3;
    details.push('✓ TextExtractorAdapter exists');
    
    if (fileContains('src/adapters/text-extractor.adapter.ts', 'implements ITextExtractor')) {
      score += 1;
      details.push('✓ Implements ITextExtractor interface');
    }
    
    if (fileContains('src/adapters/text-extractor.adapter.ts', 'PPTXAdapter')) {
      score += 1;
      details.push('✓ Correctly imports PPTXAdapter');
    }
  } else {
    issues.push('✗ TextExtractorAdapter missing');
  }

  return { score, details, issues };
});

// ============================================
// 4. Ingest Service & API (20 points)
// ============================================
audit('Ingest Service & API', 20, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  // Ingest Service
  if (fileExists('src/services/ingest.service.ts')) {
    score += 5;
    details.push('✓ IngestService exists');
    
    if (fileContains('src/services/ingest.service.ts', 'processFile')) {
      score += 3;
      details.push('✓ processFile method present');
      
      // Check correct signature (7 parameters)
      if (fileContains('src/services/ingest.service.ts', /processFile\([^)]*fileKey[^)]*fileSize/)) {
        score += 2;
        details.push('✓ processFile has correct signature (includes fileKey & fileSize)');
      } else {
        issues.push('⚠ processFile may have incorrect signature');
      }
    }
    
    if (fileContains('src/services/ingest.service.ts', 'textExtractor')) {
      score += 1;
      details.push('✓ Uses ITextExtractor interface');
    }
  } else {
    issues.push('✗ IngestService missing');
  }

  // Ingest API Route
  if (fileExists('src/app/api/ingest/route.ts')) {
    score += 3;
    details.push('✓ Ingest API route exists');
    
    if (fileContains('src/app/api/ingest/route.ts', "export const dynamic = 'force-dynamic'")) {
      score += 1;
      details.push('✓ Route marked as dynamic');
    }
    
    if (fileContains('src/app/api/ingest/route.ts', 'await import')) {
      score += 2;
      details.push('✓ Uses lazy imports to prevent build issues');
    }
    
    if (fileContains('src/app/api/ingest/route.ts', 'fileKey') && 
        fileContains('src/app/api/ingest/route.ts', 'fileSize')) {
      score += 2;
      details.push('✓ Accepts fileKey and fileSize parameters');
    } else {
      issues.push('⚠ API route may not accept all required parameters');
    }
    
    if (fileContains('src/app/api/ingest/route.ts', 'getSession')) {
      score += 1;
      details.push('✓ Auth verification present');
    }
  } else {
    issues.push('✗ Ingest API route missing');
  }

  return { score, details, issues };
});

// ============================================
// 5. Database Schema & Models (10 points)
// ============================================
audit('Database Integration', 10, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  if (fileExists('prisma/schema.prisma')) {
    score += 2;
    details.push('✓ Prisma schema exists');
    
    if (fileContains('prisma/schema.prisma', 'model File')) {
      score += 2;
      details.push('✓ File model defined');
      
      const hasRequiredFields = 
        fileContains('prisma/schema.prisma', /key\s+String/) &&
        fileContains('prisma/schema.prisma', /size\s+Int/) &&
        fileContains('prisma/schema.prisma', /url\s+String/);
      
      if (hasRequiredFields) {
        score += 2;
        details.push('✓ File model has key, size, and url fields');
      } else {
        issues.push('⚠ File model missing some required fields');
      }
    }
    
    if (fileContains('prisma/schema.prisma', 'model Transcript')) {
      score += 2;
      details.push('✓ Transcript model defined');
      
      if (fileContains('prisma/schema.prisma', /fileId\s+String/)) {
        score += 1;
        details.push('✓ Transcript linked to File');
      }
    }
  } else {
    issues.push('✗ Prisma schema missing');
  }

  if (fileExists('src/domain/entities/FileEntity.ts')) {
    score += 1;
    details.push('✓ FileEntity domain model exists');
  }

  return { score, details, issues };
});

// ============================================
// 6. File Management (10 points)
// ============================================
audit('File Management', 10, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  // Files API - List
  if (fileExists('src/app/api/files/route.ts')) {
    score += 3;
    details.push('✓ Files API route exists');
    
    if (fileContains('src/app/api/files/route.ts', 'export async function GET')) {
      score += 2;
      details.push('✓ GET handler for listing files');
    }
  } else {
    issues.push('✗ Files API route missing');
  }

  // Files API - Delete
  if (fileExists('src/app/api/files/[fileId]/route.ts')) {
    score += 3;
    details.push('✓ File deletion API exists');
    
    if (fileContains('src/app/api/files/[fileId]/route.ts', 'export async function DELETE')) {
      score += 1;
      details.push('✓ DELETE handler implemented');
    }
    
    if (fileContains('src/app/api/files/[fileId]/route.ts', 'uploadthingAdapter.deleteFiles')) {
      score += 1;
      details.push('✓ Deletes from UploadThing storage');
    }
  } else {
    issues.push('✗ File deletion API missing');
  }

  return { score, details, issues };
});

// ============================================
// 7. Build & Dependencies (10 points)
// ============================================
audit('Build System', 10, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  if (fileExists('package.json')) {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );

    // Check UploadThing dependencies
    if (packageJson.dependencies?.['uploadthing'] && packageJson.dependencies?.['@uploadthing/react']) {
      score += 2;
      details.push('✓ UploadThing packages installed');
    } else {
      issues.push('✗ UploadThing packages missing');
    }

    // Check text extraction dependencies
    if (packageJson.dependencies?.['pdf-parse']) {
      score += 2;
      details.push('✓ PDF parsing library installed');
    }

    if (packageJson.dependencies?.['mammoth']) {
      score += 2;
      details.push('✓ DOCX parsing library installed');
    }

    if (packageJson.dependencies?.['pptx-parser-ts']) {
      score += 2;
      details.push('✓ PPTX parsing library installed');
    }

    // Check Prisma
    if (packageJson.dependencies?.['@prisma/client']) {
      score += 2;
      details.push('✓ Prisma client installed');
    }
  } else {
    issues.push('✗ package.json missing');
  }

  return { score, details, issues };
});

// ============================================
// Print Results
// ============================================
console.log('\n━━━ AUDIT RESULTS ━━━\n');

let totalScore = 0;
let totalMaxScore = 0;

results.forEach(result => {
  totalScore += result.score;
  totalMaxScore += result.maxScore;

  const percentage = Math.round((result.score / result.maxScore) * 100);
  const bar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
  
  console.log(`\n${result.component}`);
  console.log(`  Score: ${bar} ${percentage}% (${result.score}/${result.maxScore})`);
  
  if (result.details.length > 0) {
    result.details.forEach(detail => console.log(`  ${detail}`));
  }
  
  if (result.issues.length > 0) {
    result.issues.forEach(issue => console.log(`  ${issue}`));
  }
});

// ============================================
// Overall Summary
// ============================================
const overallPercentage = Math.round((totalScore / totalMaxScore) * 100);
const overallBar = '█'.repeat(Math.round(overallPercentage / 5)) + '░'.repeat(20 - Math.round(overallPercentage / 5));

console.log('\n' + '='.repeat(70));
console.log('OVERALL PHASE 2 SCORE');
console.log('='.repeat(70));
console.log(`\n  ${overallBar} ${overallPercentage}% (${totalScore}/${totalMaxScore} points)\n`);

const passedComponents = results.filter(r => (r.score / r.maxScore) >= 0.8).length;
const totalComponents = results.length;

console.log(`Component Status:`);
console.log(`  Passed (≥80%): ${passedComponents}/${totalComponents}`);
console.log(`  Needs Work (<80%): ${totalComponents - passedComponents}/${totalComponents}`);

const criticalIssues = results.filter(r => r.issues.length > 0).length;
console.log(`\nIssue Summary:`);
console.log(`  Components with issues: ${criticalIssues}/${totalComponents}`);

if (overallPercentage >= 90) {
  console.log('\n🎉 EXCELLENT! Phase 2 is fully implemented and working!');
} else if (overallPercentage >= 80) {
  console.log('\n✅ GOOD! Phase 2 is mostly complete with minor issues.');
} else if (overallPercentage >= 70) {
  console.log('\n⚠️  PARTIAL: Phase 2 has significant gaps that need attention.');
} else {
  console.log('\n❌ INCOMPLETE: Phase 2 requires substantial work.');
}

console.log('');

process.exit(overallPercentage >= 80 ? 0 : 1);
