#!/usr/bin/env tsx
/**
 * Phase 7 Audit Script
 * 
 * Comprehensive audit of Phase 7: Modern UI/UX Implementation
 * 
 * Components:
 * 1. shadcn/ui Component Library (24+ components)
 * 2. Enhanced Landing Page
 * 3. Enhanced Dashboard
 * 4. Responsive Design
 * 5. Modern Styling (Apple-inspired)
 * 6. Build System Integration
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
console.log('PHASE 7 AUDIT: Modern UI/UX Implementation');
console.log('='.repeat(70) + '\n');

// ============================================
// 1. shadcn/ui Components (30 points)
// ============================================
audit('shadcn/ui Components', 30, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  const components = [
    'alert-dialog', 'avatar', 'badge', 'button', 'card',
    'checkbox', 'dialog', 'dropdown-menu', 'form', 'input',
    'label', 'progress', 'scroll-area', 'select', 'separator',
    'sheet', 'sidebar', 'skeleton', 'table', 'tabs',
    'textarea', 'toggle', 'toggle-group', 'tooltip'
  ];

  let foundComponents = 0;
  components.forEach(component => {
    if (fileExists(`src/components/ui/${component}.tsx`)) {
      foundComponents++;
    }
  });

  const componentPercentage = (foundComponents / components.length) * 100;
  score = Math.round((componentPercentage / 100) * 20);
  details.push(`✓ ${foundComponents}/${components.length} UI components present (${Math.round(componentPercentage)}%)`);

  // Check utils
  if (fileExists('src/lib/utils.ts') && fileContains('src/lib/utils.ts', 'cn')) {
    score += 3;
    details.push('✓ cn() utility function present');
  } else {
    issues.push('✗ cn() utility missing');
  }

  // Check hooks
  if (fileExists('src/hooks/use-mobile.ts')) {
    score += 2;
    details.push('✓ useIsMobile hook present');
  }

  // Check dependencies
  if (fileExists('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    
    if (packageJson.dependencies?.['lucide-react']) {
      score += 2;
      details.push('✓ lucide-react icons installed');
    }
    
    if (packageJson.dependencies?.['class-variance-authority'] &&
        packageJson.dependencies?.['clsx'] &&
        packageJson.dependencies?.['tailwind-merge']) {
      score += 3;
      details.push('✓ Styling utilities installed (cva, clsx, tailwind-merge)');
    }
  }

  return { score, details, issues };
});

// ============================================
// 2. Enhanced Landing Page (20 points)
// ============================================
audit('Enhanced Landing Page', 20, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  if (fileExists('src/components/pages/EnhancedLandingPage.tsx')) {
    score += 5;
    details.push('✓ EnhancedLandingPage component exists');

    const content = fs.readFileSync(
      path.join(process.cwd(), 'src/components/pages/EnhancedLandingPage.tsx'),
      'utf-8'
    );

    if (content.includes('Hero') || content.includes('hero')) {
      score += 3;
      details.push('✓ Hero section present');
    }

    if (content.includes('Features') || content.includes('features')) {
      score += 3;
      details.push('✓ Features section present');
    }

    if (content.includes('How It Works') || content.includes('how-it-works')) {
      score += 2;
      details.push('✓ How It Works section present');
    }

    if (content.includes('Footer') || content.includes('footer')) {
      score += 2;
      details.push('✓ Footer present');
    }

    if (content.includes('header') || content.includes('Navigation')) {
      score += 2;
      details.push('✓ Navigation header present');
    }

    if (content.includes('Card') && content.includes('Button')) {
      score += 3;
      details.push('✓ Uses shadcn components');
    }
  } else {
    issues.push('✗ EnhancedLandingPage missing');
  }

  return { score, details, issues };
});

// ============================================
// 3. Enhanced Dashboard (20 points)
// ============================================
audit('Enhanced Dashboard', 20, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  if (fileExists('src/components/pages/EnhancedDashboardPage.tsx')) {
    score += 5;
    details.push('✓ EnhancedDashboardPage component exists');

    const content = fs.readFileSync(
      path.join(process.cwd(), 'src/components/pages/EnhancedDashboardPage.tsx'),
      'utf-8'
    );

    if (content.includes('stats') || content.includes('Quick Stats')) {
      score += 3;
      details.push('✓ Stats dashboard present');
    }

    if (content.includes('Tabs')) {
      score += 3;
      details.push('✓ Tab-based interface');
    }

    if (content.includes('FileUploadDropzone') || content.includes('upload')) {
      score += 3;
      details.push('✓ File upload integration');
    }

    if (content.includes('files.map') || content.includes('File management')) {
      score += 3;
      details.push('✓ File management UI');
    }

    if (content.includes('Generate') || content.includes('generate')) {
      score += 3;
      details.push('✓ Content generation UI');
    }
  } else {
    issues.push('✗ EnhancedDashboardPage missing');
  }

  return { score, details, issues };
});

// ============================================
// 4. Global Styles (10 points)
// ============================================
audit('Global Styles', 10, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  if (fileExists('src/app/globals.css')) {
    score += 3;
    details.push('✓ Global CSS file exists');

    const content = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf-8');

    if (content.includes('--primary') || content.includes('--background')) {
      score += 3;
      details.push('✓ CSS custom properties defined');
    }

    if (content.includes('@theme') || content.includes('tailwindcss')) {
      score += 2;
      details.push('✓ Tailwind integration');
    }

    if (content.includes('Apple') || content.includes('apple')) {
      score += 2;
      details.push('✓ Apple-inspired design system');
    }
  } else {
    issues.push('✗ Global CSS missing');
  }

  return { score, details, issues };
});

// ============================================
// 5. Page Integration (10 points)
// ============================================
audit('Page Integration', 10, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  // Homepage
  if (fileExists('src/app/page.tsx')) {
    const content = fs.readFileSync(path.join(process.cwd(), 'src/app/page.tsx'), 'utf-8');
    
    if (content.includes('EnhancedLandingPage')) {
      score += 5;
      details.push('✓ Homepage uses EnhancedLandingPage');
    } else {
      issues.push('⚠ Homepage not using enhanced component');
    }
  }

  // Dashboard
  if (fileExists('src/app/dashboard/page.tsx')) {
    const content = fs.readFileSync(path.join(process.cwd(), 'src/app/dashboard/page.tsx'), 'utf-8');
    
    if (content.includes('EnhancedDashboardPage')) {
      score += 5;
      details.push('✓ Dashboard uses EnhancedDashboardPage');
    } else {
      issues.push('⚠ Dashboard not using enhanced component');
    }
  }

  return { score, details, issues };
});

// ============================================
// 6. Build System (10 points)
// ============================================
audit('Build System', 10, () => {
  const details: string[] = [];
  const issues: string[] = [];
  let score = 0;

  if (fileExists('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

    // Check Radix UI packages
    const radixPackages = Object.keys(packageJson.dependencies || {}).filter(
      pkg => pkg.startsWith('@radix-ui/')
    );

    if (radixPackages.length >= 8) {
      score += 3;
      details.push(`✓ ${radixPackages.length} Radix UI packages installed`);
    } else if (radixPackages.length >= 5) {
      score += 2;
      details.push(`✓ ${radixPackages.length} Radix UI packages installed`);
    }

    // Check form libraries
    if (packageJson.dependencies?.['react-hook-form']) {
      score += 2;
      details.push('✓ react-hook-form installed');
    }

    // Check additional UI libraries
    if (packageJson.dependencies?.['sonner']) {
      score += 2;
      details.push('✓ Toast notifications (sonner)');
    }

    // Check icons
    if (packageJson.dependencies?.['@tabler/icons-react']) {
      score += 1;
      details.push('✓ Tabler icons available');
    }

    // Try to verify build success
    if (fileExists('.next')) {
      score += 2;
      details.push('✓ Build directory exists');
    }
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
console.log('OVERALL PHASE 7 SCORE');
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
  console.log('\n🎉 EXCELLENT! Phase 7 is fully implemented with modern UI/UX!');
} else if (overallPercentage >= 80) {
  console.log('\n✅ GOOD! Phase 7 is mostly complete with minor gaps.');
} else if (overallPercentage >= 70) {
  console.log('\n⚠️  PARTIAL: Phase 7 has significant gaps that need attention.');
} else {
  console.log('\n❌ INCOMPLETE: Phase 7 requires substantial work.');
}

console.log('');

process.exit(overallPercentage >= 80 ? 0 : 1);
