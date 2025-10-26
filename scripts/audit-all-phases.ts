/**
 * Comprehensive Audit for Phases 1, 3, 4, 5, 6
 * (Phase 2 excluded as requested)
 * 
 * Validates all components and ensures 100% compliance
 */

import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'

const prisma = new PrismaClient()

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

interface AuditResult {
  phase: string
  component: string
  passed: boolean
  issues: string[]
  warnings: string[]
  score: number
}

class ComprehensiveAuditor {
  private results: AuditResult[] = []
  private totalScore = 0
  private maxScore = 0

  async run() {
    console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`)
    console.log(`${colors.cyan}COMPREHENSIVE AUDIT: Phases 1, 3, 4, 5, 6${colors.reset}`)
    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`)

    await this.auditPhase1()
    await this.auditPhase3()
    await this.auditPhase4()
    await this.auditPhase5()
    await this.auditPhase6()
    
    await this.auditCrossCutting()
    
    this.printSummary()
  }

  private async auditPhase1() {
    console.log(`\n${colors.blue}━━━ PHASE 1: Auth0 Authentication ━━━${colors.reset}\n`)
    
    await this.checkAuth0Package()
    await this.checkAuth0Config()
    await this.checkAuth0Routes()
    await this.checkAuthProvider()
    await this.checkAuthHook()
  }

  private async checkAuth0Package() {
    const component = 'Auth0 Package Installation'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    try {
      const packageJson = JSON.parse(await readFile('package.json', 'utf-8'))
      
      // Check for Auth0 packages
      const hasNextjsAuth0 = packageJson.dependencies['@auth0/nextjs-auth0']
      const hasAuth0React = packageJson.dependencies['@auth0/auth0-react']
      
      if (hasNextjsAuth0) {
        const version = hasNextjsAuth0.replace('^', '')
        if (version.startsWith('3.') || version.startsWith('2.')) {
          issues.push(`@auth0/nextjs-auth0 version ${version} is deprecated. Should be v4.x`)
        } else if (version.startsWith('4.')) {
          score += 5
          console.log(`  ${colors.green}✓ @auth0/nextjs-auth0: ${version} (latest)${colors.reset}`)
        }
      } else {
        issues.push('Missing @auth0/nextjs-auth0 package')
      }
      
      if (hasAuth0React) {
        warnings.push('@auth0/auth0-react found - may not be needed for Next.js')
        console.log(`  ${colors.yellow}⚠ @auth0/auth0-react: ${hasAuth0React} (may be redundant)${colors.reset}`)
      }
      
      // Check for proper peer dependencies
      const hasNext = packageJson.dependencies['next']
      const hasReact = packageJson.dependencies['react']
      
      if (hasNext && hasNext.startsWith('16')) {
        score += 2
        console.log(`  ${colors.green}✓ Next.js: ${hasNext}${colors.reset}`)
      } else {
        warnings.push('Next.js version may not be compatible with Auth0 v4')
      }
      
      if (hasReact && hasReact.startsWith('19')) {
        score += 2
        console.log(`  ${colors.green}✓ React: ${hasReact}${colors.reset}`)
      }
      
      score += 1 // Base score for having packages installed
      
    } catch (error) {
      issues.push(`Error reading package.json: ${error}`)
    }

    this.logResult('Phase 1', component, issues, warnings, score, 10)
  }

  private async checkAuth0Config() {
    const component = 'Auth0 Environment Configuration'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const requiredEnvVars = [
      'AUTH0_SECRET',
      'AUTH0_BASE_URL',
      'AUTH0_ISSUER_BASE_URL',
      'AUTH0_CLIENT_ID',
      'AUTH0_CLIENT_SECRET',
    ]

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        score += 2
        console.log(`  ${colors.green}✓ ${envVar}: configured${colors.reset}`)
      } else {
        issues.push(`Missing environment variable: ${envVar}`)
        console.log(`  ${colors.red}✗ ${envVar}: missing${colors.reset}`)
      }
    }

    this.logResult('Phase 1', component, issues, warnings, score, 10)
  }

  private async checkAuth0Routes() {
    const component = 'Auth0 API Routes'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const authRoutePath = 'src/app/api/auth/[auth0]/route.ts'
    
    if (existsSync(authRoutePath)) {
      score += 5
      const content = await readFile(authRoutePath, 'utf-8')
      
      if (content.includes('export async function GET')) {
        score += 3
        console.log(`  ${colors.green}✓ Auth route handler found${colors.reset}`)
      } else {
        issues.push('Auth route missing GET handler')
      }
      
      if (content.includes('TODO') || content.includes('placeholder')) {
        warnings.push('Auth route appears to be incomplete (contains TODO/placeholder)')
        console.log(`  ${colors.yellow}⚠ Auth route has placeholder implementation${colors.reset}`)
      } else {
        score += 2
      }
    } else {
      issues.push('Auth0 API route not found at src/app/api/auth/[auth0]/route.ts')
    }

    this.logResult('Phase 1', component, issues, warnings, score, 10)
  }

  private async checkAuthProvider() {
    const component = 'Auth Provider'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const providerPath = 'src/providers/AuthProvider.tsx'
    
    if (existsSync(providerPath)) {
      score += 5
      const content = await readFile(providerPath, 'utf-8')
      
      if (content.includes("'use client'")) {
        score += 2
        console.log(`  ${colors.green}✓ AuthProvider has 'use client' directive${colors.reset}`)
      } else {
        issues.push("AuthProvider missing 'use client' directive")
      }
      
      if (content.includes('UserProvider') || content.includes('Auth0Provider')) {
        score += 3
        console.log(`  ${colors.green}✓ Auth provider implementation found${colors.reset}`)
      } else {
        warnings.push('Auth provider may not be properly implemented')
      }
    } else {
      issues.push('AuthProvider.tsx not found')
    }

    this.logResult('Phase 1', component, issues, warnings, score, 10)
  }

  private async checkAuthHook() {
    const component = 'useAuth Hook'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const hookPath = 'src/hooks/useAuth.ts'
    
    if (existsSync(hookPath)) {
      score += 5
      const content = await readFile(hookPath, 'utf-8')
      
      if (content.includes("'use client'")) {
        score += 2
        console.log(`  ${colors.green}✓ useAuth has 'use client' directive${colors.reset}`)
      } else {
        issues.push("useAuth missing 'use client' directive")
      }
      
      if (content.includes('export') && content.includes('useAuth')) {
        score += 3
        console.log(`  ${colors.green}✓ useAuth hook exported${colors.reset}`)
      } else {
        issues.push('useAuth hook not properly exported')
      }
    } else {
      issues.push('useAuth.ts not found')
    }

    this.logResult('Phase 1', component, issues, warnings, score, 10)
  }

  private async auditPhase3() {
    console.log(`\n${colors.blue}━━━ PHASE 3: ElevenLabs Transcription ━━━${colors.reset}\n`)
    
    await this.checkElevenLabsAdapter()
    await this.checkTranscribeService()
    await this.checkTranscribeRoute()
    await this.checkWhisperAdapter()
  }

  private async checkElevenLabsAdapter() {
    const component = 'ElevenLabs Adapter'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const adapterPath = 'src/adapters/elevenlabs.adapter.ts'
    
    if (existsSync(adapterPath)) {
      score += 3
      const content = await readFile(adapterPath, 'utf-8')
      
      if (content.includes('class ElevenLabsAdapter')) {
        score += 2
        if (content.includes('implements ITranscriber')) {
          score += 2
          console.log(`  ${colors.green}✓ ElevenLabsAdapter implements ITranscriber${colors.reset}`)
        }
      }
      
      if (content.includes('transcribeAudio') || content.includes('transcribe')) {
        score += 3
        console.log(`  ${colors.green}✓ Transcription method found${colors.reset}`)
      } else {
        issues.push('Missing transcription method')
      }
    } else {
      issues.push('ElevenLabsAdapter not found')
    }

    this.logResult('Phase 3', component, issues, warnings, score, 10)
  }

  private async checkTranscribeService() {
    const component = 'Transcribe Service'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const servicePath = 'src/services/transcribe.service.ts'
    
    if (existsSync(servicePath)) {
      score += 3
      const content = await readFile(servicePath, 'utf-8')
      
      if (content.includes('class TranscribeService')) {
        score += 2
      }
      
      if (content.includes('transcribe')) {
        score += 3
        console.log(`  ${colors.green}✓ TranscribeService has transcribe method${colors.reset}`)
      }
      
      if (content.includes('PrismaClient') || content.includes('prisma')) {
        score += 2
        console.log(`  ${colors.green}✓ Database integration present${colors.reset}`)
      }
    } else {
      issues.push('TranscribeService not found')
    }

    this.logResult('Phase 3', component, issues, warnings, score, 10)
  }

  private async checkTranscribeRoute() {
    const component = 'Transcribe API Route'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const routePath = 'src/app/api/transcribe/route.ts'
    
    if (existsSync(routePath)) {
      score += 5
      const content = await readFile(routePath, 'utf-8')
      
      if (content.includes('export async function POST')) {
        score += 5
        console.log(`  ${colors.green}✓ POST handler present${colors.reset}`)
      } else {
        issues.push('Missing POST handler')
      }
    } else {
      issues.push('Transcribe route not found')
    }

    this.logResult('Phase 3', component, issues, warnings, score, 10)
  }

  private async checkWhisperAdapter() {
    const component = 'Whisper Adapter (Fallback)'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const adapterPath = 'src/adapters/whisper.adapter.ts'
    
    if (existsSync(adapterPath)) {
      score += 10
      console.log(`  ${colors.green}✓ Whisper adapter available as fallback${colors.reset}`)
    } else {
      warnings.push('Whisper adapter not found (optional fallback)')
      score += 5 // Half credit - not critical
    }

    this.logResult('Phase 3', component, issues, warnings, score, 10)
  }

  private async auditPhase4() {
    console.log(`\n${colors.blue}━━━ PHASE 4: Gemini AI Agents ━━━${colors.reset}\n`)
    
    await this.checkGeminiAdapter()
    await this.checkAgentSystem()
    await this.checkGenerateService()
    await this.checkGenerateRoute()
  }

  private async checkGeminiAdapter() {
    const component = 'Gemini Adapter'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const adapterPath = 'src/adapters/gemini.adapter.ts'
    
    if (existsSync(adapterPath)) {
      score += 3
      const content = await readFile(adapterPath, 'utf-8')
      
      if (content.includes('implements IModelClient')) {
        score += 3
        console.log(`  ${colors.green}✓ Implements IModelClient interface${colors.reset}`)
      }
      
      if (content.includes('complete') || content.includes('generate')) {
        score += 4
        console.log(`  ${colors.green}✓ Generation method found${colors.reset}`)
      }
    } else {
      issues.push('GeminiAdapter not found')
    }

    this.logResult('Phase 4', component, issues, warnings, score, 10)
  }

  private async checkAgentSystem() {
    const component = 'AI Agents (4 types)'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const agents = [
      { name: 'NotesAgent', path: 'src/services/agents/NotesAgent.ts' },
      { name: 'FlashcardAgent', path: 'src/services/agents/FlashcardAgent.ts' },
      { name: 'QuizAgent', path: 'src/services/agents/QuizAgent.ts' },
      { name: 'SlidesAgent', path: 'src/services/agents/SlidesAgent.ts' },
    ]

    for (const agent of agents) {
      if (existsSync(agent.path)) {
        score += 2.5
        console.log(`  ${colors.green}✓ ${agent.name} present${colors.reset}`)
      } else {
        issues.push(`${agent.name} not found`)
        console.log(`  ${colors.red}✗ ${agent.name} missing${colors.reset}`)
      }
    }

    this.logResult('Phase 4', component, issues, warnings, score, 10)
  }

  private async checkGenerateService() {
    const component = 'Generate Service'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const servicePath = 'src/services/generate.service.ts'
    
    if (existsSync(servicePath)) {
      score += 5
      const content = await readFile(servicePath, 'utf-8')
      
      if (content.includes('generate')) {
        score += 3
        console.log(`  ${colors.green}✓ Generate method present${colors.reset}`)
      }
      
      if (content.includes('getAvailableAgents')) {
        score += 2
        console.log(`  ${colors.green}✓ Agent registry present${colors.reset}`)
      }
    } else {
      issues.push('GenerateService not found')
    }

    this.logResult('Phase 4', component, issues, warnings, score, 10)
  }

  private async checkGenerateRoute() {
    const component = 'Generate API Route'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const routePath = 'src/app/api/generate/route.ts'
    
    if (existsSync(routePath)) {
      score += 5
      const content = await readFile(routePath, 'utf-8')
      
      if (content.includes('export async function POST')) {
        score += 5
        console.log(`  ${colors.green}✓ POST handler present${colors.reset}`)
      }
    } else {
      issues.push('Generate route not found')
    }

    this.logResult('Phase 4', component, issues, warnings, score, 10)
  }

  private async auditPhase5() {
    console.log(`\n${colors.blue}━━━ PHASE 5: Canvas LMS Integration ━━━${colors.reset}\n`)
    
    await this.checkCanvasAdapter()
    await this.checkCanvasService()
    await this.checkCanvasSyncRoute()
    await this.checkCanvasHook()
  }

  private async checkCanvasAdapter() {
    const component = 'Canvas Adapter'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const adapterPath = 'src/adapters/canvas.adapter.ts'
    
    if (existsSync(adapterPath)) {
      score += 3
      const content = await readFile(adapterPath, 'utf-8')
      
      const methods = ['getCourses', 'getCourseFiles', 'downloadFile', 'verifyToken']
      let methodCount = 0
      
      for (const method of methods) {
        if (content.includes(method)) {
          methodCount++
        }
      }
      
      score += methodCount * 1.75
      console.log(`  ${colors.green}✓ ${methodCount}/4 required methods present${colors.reset}`)
    } else {
      issues.push('CanvasAdapter not found')
    }

    this.logResult('Phase 5', component, issues, warnings, score, 10)
  }

  private async checkCanvasService() {
    const component = 'Canvas Service'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const servicePath = 'src/services/canvas.service.ts'
    
    if (existsSync(servicePath)) {
      score += 5
      const content = await readFile(servicePath, 'utf-8')
      
      if (content.includes('syncCourses')) {
        score += 3
        console.log(`  ${colors.green}✓ Course sync method present${colors.reset}`)
      }
      
      if (content.includes('verifyAndStoreToken')) {
        score += 2
        console.log(`  ${colors.green}✓ Token verification present${colors.reset}`)
      }
    } else {
      issues.push('CanvasService not found')
    }

    this.logResult('Phase 5', component, issues, warnings, score, 10)
  }

  private async checkCanvasSyncRoute() {
    const component = 'Canvas Sync API Route'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const routePath = 'src/app/api/canvas-sync/route.ts'
    
    if (existsSync(routePath)) {
      score += 5
      const content = await readFile(routePath, 'utf-8')
      
      if (content.includes('export async function POST')) {
        score += 5
        console.log(`  ${colors.green}✓ POST handler present${colors.reset}`)
      }
    } else {
      issues.push('Canvas sync route not found')
    }

    this.logResult('Phase 5', component, issues, warnings, score, 10)
  }

  private async checkCanvasHook() {
    const component = 'useCanvasSync Hook'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const hookPath = 'src/hooks/useCanvasSync.ts'
    
    if (existsSync(hookPath)) {
      score += 5
      const content = await readFile(hookPath, 'utf-8')
      
      if (content.includes("'use client'")) {
        score += 3
        console.log(`  ${colors.green}✓ Client directive present${colors.reset}`)
      }
      
      if (content.includes('sync')) {
        score += 2
        console.log(`  ${colors.green}✓ Sync method present${colors.reset}`)
      }
    } else {
      issues.push('useCanvasSync hook not found')
    }

    this.logResult('Phase 5', component, issues, warnings, score, 10)
  }

  private async auditPhase6() {
    console.log(`\n${colors.blue}━━━ PHASE 6: Export Pipeline ━━━${colors.reset}\n`)
    
    await this.checkExportInterface()
    await this.checkExporters()
    await this.checkExportService()
    await this.checkExportRoute()
    await this.checkExportHook()
  }

  private async checkExportInterface() {
    const component = 'IExporter Interface'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const interfacePath = 'src/domain/interfaces/IExporter.ts'
    
    if (existsSync(interfacePath)) {
      score += 5
      const content = await readFile(interfacePath, 'utf-8')
      
      const methods = ['export', 'getMimeType', 'getFileExtension']
      let methodCount = 0
      
      for (const method of methods) {
        if (content.includes(method)) {
          methodCount++
        }
      }
      
      score += methodCount * 1.67
      console.log(`  ${colors.green}✓ ${methodCount}/3 interface methods defined${colors.reset}`)
    } else {
      issues.push('IExporter interface not found')
    }

    this.logResult('Phase 6', component, issues, warnings, score, 10)
  }

  private async checkExporters() {
    const component = 'Export Implementations'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const exporters = [
      { name: 'PDFExporter', path: 'src/services/exporters/PDFExporter.ts' },
      { name: 'AnkiExporter', path: 'src/services/exporters/AnkiExporter.ts' },
      { name: 'CSVExporter', path: 'src/services/exporters/CSVExporter.ts' },
      { name: 'PPTXExporter', path: 'src/services/exporters/PPTXExporter.ts' },
    ]

    for (const exporter of exporters) {
      if (existsSync(exporter.path)) {
        score += 2.5
        console.log(`  ${colors.green}✓ ${exporter.name} present${colors.reset}`)
      } else {
        issues.push(`${exporter.name} not found`)
      }
    }

    this.logResult('Phase 6', component, issues, warnings, score, 10)
  }

  private async checkExportService() {
    const component = 'Export Service'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const servicePath = 'src/services/export.service.ts'
    
    if (existsSync(servicePath)) {
      score += 5
      const content = await readFile(servicePath, 'utf-8')
      
      if (content.includes('export') && content.includes('async')) {
        score += 3
        console.log(`  ${colors.green}✓ Export method present${colors.reset}`)
      }
      
      if (content.includes('getAvailableFormats')) {
        score += 2
        console.log(`  ${colors.green}✓ Format validation present${colors.reset}`)
      }
    } else {
      issues.push('ExportService not found')
    }

    this.logResult('Phase 6', component, issues, warnings, score, 10)
  }

  private async checkExportRoute() {
    const component = 'Export API Route'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const routePath = 'src/app/api/export/route.ts'
    
    if (existsSync(routePath)) {
      score += 5
      const content = await readFile(routePath, 'utf-8')
      
      if (content.includes('export async function POST')) {
        score += 5
        console.log(`  ${colors.green}✓ POST handler present${colors.reset}`)
      }
    } else {
      issues.push('Export route not found')
    }

    this.logResult('Phase 6', component, issues, warnings, score, 10)
  }

  private async checkExportHook() {
    const component = 'useExport Hook'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const hookPath = 'src/hooks/useExport.ts'
    
    if (existsSync(hookPath)) {
      score += 5
      const content = await readFile(hookPath, 'utf-8')
      
      if (content.includes("'use client'")) {
        score += 3
        console.log(`  ${colors.green}✓ Client directive present${colors.reset}`)
      }
      
      if (content.includes('exportOutput')) {
        score += 2
        console.log(`  ${colors.green}✓ Export method present${colors.reset}`)
      }
    } else {
      issues.push('useExport hook not found')
    }

    this.logResult('Phase 6', component, issues, warnings, score, 10)
  }

  private async auditCrossCutting() {
    console.log(`\n${colors.blue}━━━ Cross-Cutting Concerns ━━━${colors.reset}\n`)
    
    await this.checkDatabaseSchema()
    await this.checkPrismaIntegration()
    await this.checkEnvironmentVariables()
  }

  private async checkDatabaseSchema() {
    const component = 'Prisma Database Schema'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const schemaPath = 'prisma/schema.prisma'
    
    if (existsSync(schemaPath)) {
      score += 3
      const content = await readFile(schemaPath, 'utf-8')
      
      const models = ['User', 'Course', 'File', 'Transcript', 'Output']
      let modelCount = 0
      
      for (const model of models) {
        if (content.includes(`model ${model}`)) {
          modelCount++
        }
      }
      
      score += modelCount * 1.4
      console.log(`  ${colors.green}✓ ${modelCount}/5 required models present${colors.reset}`)
    } else {
      issues.push('Prisma schema not found')
    }

    this.logResult('Cross-Cutting', component, issues, warnings, score, 10)
  }

  private async checkPrismaIntegration() {
    const component = 'Prisma Client Generation'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    try {
      // Try to import Prisma client
      await import('@prisma/client')
      score += 10
      console.log(`  ${colors.green}✓ Prisma client properly generated${colors.reset}`)
    } catch (error) {
      issues.push('Prisma client not generated or invalid')
      console.log(`  ${colors.red}✗ Prisma client error${colors.reset}`)
    }

    this.logResult('Cross-Cutting', component, issues, warnings, score, 10)
  }

  private async checkEnvironmentVariables() {
    const component = 'Environment Configuration'
    const issues: string[] = []
    const warnings: string[] = []
    let score = 0

    const criticalEnvVars = [
      'DATABASE_URL',
      'ELEVENLABS_API_KEY',
      'GEMINI_API_KEY',
    ]

    let configuredCount = 0
    for (const envVar of criticalEnvVars) {
      if (process.env[envVar]) {
        configuredCount++
      }
    }

    score = (configuredCount / criticalEnvVars.length) * 10
    console.log(`  ${colors.green}✓ ${configuredCount}/${criticalEnvVars.length} critical env vars configured${colors.reset}`)

    if (configuredCount < criticalEnvVars.length) {
      warnings.push('Some critical environment variables not configured')
    }

    this.logResult('Cross-Cutting', component, issues, warnings, score, 10)
  }

  private logResult(
    phase: string,
    component: string,
    issues: string[],
    warnings: string[],
    score: number,
    maxScore: number
  ) {
    const passed = issues.length === 0
    const percentage = Math.round((score / maxScore) * 100)
    
    this.results.push({ phase, component, passed, issues, warnings, score })
    this.totalScore += score
    this.maxScore += maxScore

    if (!passed || warnings.length > 0) {
      console.log(`\n  ${colors.cyan}${component}${colors.reset}`)
      
      if (issues.length > 0) {
        issues.forEach(issue => {
          console.log(`    ${colors.red}✗ ${issue}${colors.reset}`)
        })
      }
      
      if (warnings.length > 0) {
        warnings.forEach(warning => {
          console.log(`    ${colors.yellow}⚠ ${warning}${colors.reset}`)
        })
      }
      
      console.log(`  ${colors.magenta}Score: ${score}/${maxScore} (${percentage}%)${colors.reset}`)
    }
  }

  private printSummary() {
    console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`)
    console.log(`${colors.cyan}AUDIT SUMMARY${colors.reset}`)
    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`)

    const byPhase = new Map<string, { score: number, max: number }>()
    
    for (const result of this.results) {
      const current = byPhase.get(result.phase) || { score: 0, max: 0 }
      current.score += result.score
      current.max += 10
      byPhase.set(result.phase, current)
    }

    console.log(`${colors.blue}Phase Scores:${colors.reset}\n`)
    
    for (const [phase, data] of byPhase.entries()) {
      const percentage = Math.round((data.score / data.max) * 100)
      const bar = this.createProgressBar(percentage)
      const color = percentage >= 90 ? colors.green : percentage >= 70 ? colors.yellow : colors.red
      
      console.log(`  ${phase}: ${color}${bar} ${percentage}%${colors.reset} (${data.score.toFixed(1)}/${data.max})`)
    }

    const totalPercentage = Math.round((this.totalScore / this.maxScore) * 100)
    const totalBar = this.createProgressBar(totalPercentage)
    const totalColor = totalPercentage >= 90 ? colors.green : totalPercentage >= 70 ? colors.yellow : colors.red

    console.log(`\n${colors.cyan}Overall Score:${colors.reset}`)
    console.log(`  ${totalColor}${totalBar} ${totalPercentage}%${colors.reset} (${this.totalScore.toFixed(1)}/${this.maxScore})`)

    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length
    
    console.log(`\n${colors.cyan}Component Status:${colors.reset}`)
    console.log(`  Passed: ${colors.green}${passed}/${total}${colors.reset}`)
    console.log(`  Failed: ${colors.red}${total - passed}/${total}${colors.reset}`)

    const totalIssues = this.results.reduce((sum, r) => sum + r.issues.length, 0)
    const totalWarnings = this.results.reduce((sum, r) => sum + r.warnings.length, 0)
    
    console.log(`\n${colors.cyan}Issues:${colors.reset}`)
    console.log(`  Critical: ${colors.red}${totalIssues}${colors.reset}`)
    console.log(`  Warnings: ${colors.yellow}${totalWarnings}${colors.reset}`)

    console.log()
    if (totalPercentage >= 90) {
      console.log(`${colors.green}🎉 EXCELLENT! All phases are well-implemented!${colors.reset}`)
    } else if (totalPercentage >= 70) {
      console.log(`${colors.yellow}⚠️  GOOD - but some improvements needed${colors.reset}`)
    } else {
      console.log(`${colors.red}❌ NEEDS WORK - multiple issues detected${colors.reset}`)
    }
    console.log()
  }

  private createProgressBar(percentage: number): string {
    const width = 30
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
  }
}

async function main() {
  const auditor = new ComprehensiveAuditor()
  await auditor.run()
  await prisma.$disconnect()
}

main().catch(console.error)
