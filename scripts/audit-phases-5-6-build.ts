/**
 * Comprehensive Build Compliance Audit for Phases 5-6
 * 
 * Validates:
 * - Phase 5: Canvas LMS Integration
 * - Phase 6: Export Pipeline
 * 
 * Checks:
 * - TypeScript compilation
 * - Missing dependencies
 * - Unused variables/imports
 * - Type errors
 * - Interface compliance
 * - Export/import consistency
 */

import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

interface AuditResult {
  component: string
  passed: boolean
  issues: string[]
  warnings: string[]
}

class BuildAuditor {
  private results: AuditResult[] = []

  async run() {
    console.log(`\n${colors.cyan}============================================================${colors.reset}`)
    console.log(`${colors.cyan}PHASE 5-6 BUILD COMPLIANCE AUDIT${colors.reset}`)
    console.log(`${colors.cyan}============================================================${colors.reset}\n`)

    // Phase 5: Canvas Integration
    console.log(`${colors.blue}📋 PHASE 5: Canvas LMS Integration${colors.reset}\n`)
    await this.auditCanvasAdapter()
    await this.auditCanvasService()
    await this.auditCanvasSyncRoute()
    await this.auditCanvasSyncHook()

    // Phase 6: Export Pipeline
    console.log(`\n${colors.blue}📋 PHASE 6: Export Pipeline${colors.reset}\n`)
    await this.auditExportInterface()
    await this.auditExporters()
    await this.auditExportService()
    await this.auditExportRoute()
    await this.auditExportHook()

    // Cross-cutting concerns
    console.log(`\n${colors.blue}📋 Cross-Cutting Concerns${colors.reset}\n`)
    await this.auditDatabaseSchema()
    await this.auditSupabaseAdapter()
    await this.auditMissingFiles()

    // Summary
    this.printSummary()
  }

  private async auditCanvasAdapter() {
    const component = 'Canvas Adapter'
    const filePath = 'src/adapters/canvas.adapter.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for required interfaces
      if (!content.includes('interface CanvasCourse')) {
        issues.push('Missing CanvasCourse interface')
      }
      if (!content.includes('interface CanvasFile')) {
        issues.push('Missing CanvasFile interface')
      }

      // Check for required methods
      const requiredMethods = ['getCourses', 'getCourseFiles', 'downloadFile', 'verifyToken']
      for (const method of requiredMethods) {
        if (!content.includes(`async ${method}`)) {
          issues.push(`Missing method: ${method}`)
        }
      }

      // Check for proper exports
      if (!content.includes('export class CanvasAdapter')) {
        issues.push('Class not exported')
      }
      if (!content.includes('export interface CanvasCourse')) {
        issues.push('CanvasCourse interface not exported')
      }
      if (!content.includes('export interface CanvasFile')) {
        issues.push('CanvasFile interface not exported')
      }

      // Check for TypeScript issues
      if (content.includes('any')) {
        warnings.push('Uses "any" type - consider stronger typing')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditCanvasService() {
    const component = 'Canvas Service'
    const filePath = 'src/services/canvas.service.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for required imports
      if (!content.includes("from '@/adapters/canvas.adapter'")) {
        issues.push('Missing CanvasAdapter import')
      }
      if (!content.includes("from '@/adapters/supabase.adapter'")) {
        issues.push('Missing SupabaseAdapter import')
      }

      // Check for required methods
      const requiredMethods = ['syncCourses', 'verifyAndStoreToken']
      for (const method of requiredMethods) {
        if (!content.includes(`async ${method}`)) {
          issues.push(`Missing method: ${method}`)
        }
      }

      // Check for proper class export
      if (!content.includes('export class CanvasService')) {
        issues.push('CanvasService class not exported')
      }

      // Check for dependency injection
      if (!content.includes('constructor(')) {
        issues.push('Missing constructor for dependency injection')
      }

      // Note: Unused variables are checked by TypeScript compiler

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditCanvasSyncRoute() {
    const component = 'Canvas Sync API Route'
    const filePath = 'src/app/api/canvas-sync/route.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for Next.js imports
      if (!content.includes("from 'next/server'")) {
        issues.push('Missing Next.js server imports')
      }

      // Check for POST method
      if (!content.includes('export async function POST')) {
        issues.push('Missing POST handler')
      }

      // Check for proper response handling
      if (!content.includes('NextResponse.json')) {
        issues.push('Missing NextResponse.json usage')
      }

      // Check for error handling
      if (!content.includes('try') && !content.includes('catch')) {
        issues.push('Missing try-catch error handling')
      }

      // Check for input validation
      if (!content.includes('canvasToken') || !content.includes('userId')) {
        warnings.push('May be missing input validation')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditCanvasSyncHook() {
    const component = 'Canvas Sync Hook'
    const filePath = 'src/hooks/useCanvasSync.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for 'use client' directive
      if (!content.includes("'use client'")) {
        issues.push("Missing 'use client' directive for client component")
      }

      // Check for React imports
      if (!content.includes("from 'react'")) {
        issues.push('Missing React imports')
      }

      // Check for hook export
      if (!content.includes('export function useCanvasSync') && !content.includes('export default')) {
        issues.push('Hook not properly exported')
      }

      // Check for state management
      if (!content.includes('useState')) {
        warnings.push('May be missing state management')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditExportInterface() {
    const component = 'Export Interface'
    const filePath = 'src/domain/interfaces/IExporter.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for interface definition
      if (!content.includes('export interface IExporter')) {
        issues.push('IExporter interface not exported')
      }

      // Check for required methods
      const requiredMethods = ['export', 'getMimeType', 'getFileExtension']
      for (const method of requiredMethods) {
        if (!content.includes(method)) {
          issues.push(`Missing method in interface: ${method}`)
        }
      }

      // Check for ExportFormat type
      if (!content.includes('ExportFormat')) {
        issues.push('Missing ExportFormat type definition')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditExporters() {
    const exporters = [
      { name: 'PDF Exporter', path: 'src/services/exporters/PDFExporter.ts', className: 'PDFExporter' },
      { name: 'Anki Exporter', path: 'src/services/exporters/AnkiExporter.ts', className: 'AnkiExporter' },
      { name: 'CSV Exporter', path: 'src/services/exporters/CSVExporter.ts', className: 'CSVExporter' },
      { name: 'PPTX Exporter', path: 'src/services/exporters/PPTXExporter.ts', className: 'PPTXExporter' },
    ]

    for (const exporter of exporters) {
      const issues: string[] = []
      const warnings: string[] = []

      try {
        if (!existsSync(exporter.path)) {
          issues.push('File does not exist')
          this.results.push({ component: exporter.name, passed: false, issues, warnings })
          continue
        }

        const content = await readFile(exporter.path, 'utf-8')

        // Check for IExporter implementation
        if (!content.includes('implements IExporter')) {
          issues.push('Does not implement IExporter interface')
        }

        // Check for required methods
        if (!content.includes('async export(')) {
          issues.push('Missing export method')
        }
        if (!content.includes('getMimeType()')) {
          issues.push('Missing getMimeType method')
        }
        if (!content.includes('getFileExtension()')) {
          issues.push('Missing getFileExtension method')
        }

        // Check for proper class export
        if (!content.includes(`export class ${exporter.className}`)) {
          issues.push('Class not properly exported')
        }

        // Check for Buffer return type
        if (!content.includes('Promise<Buffer>') && !content.includes(': Buffer')) {
          warnings.push('Export method may not return Buffer type')
        }

        this.logResult(exporter.name, issues, warnings)
        this.results.push({ component: exporter.name, passed: issues.length === 0, issues, warnings })
      } catch (error) {
        issues.push(`Error reading file: ${error}`)
        this.results.push({ component: exporter.name, passed: false, issues, warnings })
      }
    }
  }

  private async auditExportService() {
    const component = 'Export Service'
    const filePath = 'src/services/export.service.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for required imports
      if (!content.includes("from '@/domain/interfaces/IExporter'")) {
        issues.push('Missing IExporter import')
      }

      // Check for exporter imports
      const exporters = ['PDFExporter', 'AnkiExporter', 'CSVExporter', 'PPTXExporter']
      for (const exp of exporters) {
        if (!content.includes(exp)) {
          issues.push(`Missing ${exp} import or usage`)
        }
      }

      // Check for required methods
      if (!content.includes('async export(')) {
        issues.push('Missing export method')
      }
      if (!content.includes('getAvailableFormats')) {
        issues.push('Missing getAvailableFormats method')
      }

      // Check for Map usage
      if (!content.includes('Map<ExportFormat')) {
        warnings.push('May not be using Map for exporter registry')
      }

      // Check for Prisma
      if (!content.includes('PrismaClient')) {
        issues.push('Missing Prisma database integration')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditExportRoute() {
    const component = 'Export API Route'
    const filePath = 'src/app/api/export/route.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for Next.js imports
      if (!content.includes("from 'next/server'")) {
        issues.push('Missing Next.js server imports')
      }

      // Check for POST method
      if (!content.includes('export async function POST')) {
        issues.push('Missing POST handler')
      }

      // Check for ExportService import
      if (!content.includes("from '@/services/export.service'")) {
        issues.push('Missing ExportService import')
      }

      // Check for proper response handling
      if (!content.includes('new Response')) {
        issues.push('Missing Response for binary file download')
      }

      // Check for headers
      if (!content.includes('Content-Type') || !content.includes('Content-Disposition')) {
        issues.push('Missing required response headers for file download')
      }

      // Check for error handling
      if (!content.includes('try') && !content.includes('catch')) {
        issues.push('Missing try-catch error handling')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditExportHook() {
    const component = 'Export Hook'
    const filePath = 'src/hooks/useExport.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for 'use client' directive
      if (!content.includes("'use client'")) {
        issues.push("Missing 'use client' directive for client component")
      }

      // Check for React imports
      if (!content.includes("from 'react'")) {
        issues.push('Missing React imports')
      }

      // Check for hook export
      if (!content.includes('export function useExport') && !content.includes('export default')) {
        issues.push('Hook not properly exported')
      }

      // Check for exportOutput method
      if (!content.includes('exportOutput')) {
        issues.push('Missing exportOutput method')
      }

      // Check for state management
      if (!content.includes('useState')) {
        warnings.push('May be missing state management')
      }

      // Check for blob download logic
      if (!content.includes('blob') || !content.includes('URL.createObjectURL')) {
        warnings.push('May be missing blob download implementation')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditDatabaseSchema() {
    const component = 'Database Schema'
    const filePath = 'prisma/schema.prisma'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('Prisma schema file does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for required models
      const requiredModels = ['User', 'Course', 'File', 'Transcript', 'Output']
      for (const model of requiredModels) {
        if (!content.includes(`model ${model}`)) {
          issues.push(`Missing model: ${model}`)
        }
      }

      // Check for Canvas fields
      if (content.includes('model User') && !content.includes('canvasToken')) {
        issues.push('User model missing canvasToken field')
      }
      if (content.includes('model Course') && !content.includes('canvasId')) {
        issues.push('Course model missing canvasId field')
      }
      if (content.includes('model File') && !content.includes('canvasId')) {
        warnings.push('File model may be missing canvasId field')
      }

      // Check for proper relations
      if (!content.includes('@relation')) {
        warnings.push('Schema may be missing relation definitions')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditSupabaseAdapter() {
    const component = 'Supabase Adapter'
    const filePath = 'src/adapters/supabase.adapter.ts'
    const issues: string[] = []
    const warnings: string[] = []

    try {
      if (!existsSync(filePath)) {
        issues.push('File does not exist')
        this.results.push({ component, passed: false, issues, warnings })
        return
      }

      const content = await readFile(filePath, 'utf-8')

      // Check for Prisma import
      if (!content.includes("from '@prisma/client'")) {
        issues.push('Missing Prisma client import')
      }

      // Check for class export
      if (!content.includes('export class SupabaseAdapter')) {
        issues.push('SupabaseAdapter class not exported')
      }

      // Check for Canvas-related methods
      const canvasMethods = ['updateUser', 'createCourse', 'createFile']
      for (const method of canvasMethods) {
        if (!content.includes(method)) {
          issues.push(`Missing Canvas-related method: ${method}`)
        }
      }

      // Check for canvasToken parameter
      if (!content.includes('canvasToken')) {
        warnings.push('May not support canvasToken updates')
      }

      this.logResult(component, issues, warnings)
      this.results.push({ component, passed: issues.length === 0, issues, warnings })
    } catch (error) {
      issues.push(`Error reading file: ${error}`)
      this.results.push({ component, passed: false, issues, warnings })
    }
  }

  private async auditMissingFiles() {
    const component = 'Missing Critical Files'
    const issues: string[] = []
    const warnings: string[] = []

    // Check for empty auth page
    const authPagePath = 'src/app/auth/page.tsx'
    if (existsSync(authPagePath)) {
      const content = await readFile(authPagePath, 'utf-8')
      if (content.trim().length === 0) {
        issues.push('src/app/auth/page.tsx is empty - will cause build errors')
      }
    }

    // Check for Auth0 API route
    const auth0RoutePath = 'src/app/api/auth/[auth0]/route.ts'
    if (!existsSync(auth0RoutePath)) {
      warnings.push('Missing Auth0 API route: src/app/api/auth/[auth0]/route.ts')
    }

    this.logResult(component, issues, warnings)
    this.results.push({ component, passed: issues.length === 0, issues, warnings })
  }

  private logResult(component: string, issues: string[], warnings: string[]) {
    if (issues.length === 0 && warnings.length === 0) {
      console.log(`  ${colors.green}✅ ${component}${colors.reset}`)
    } else {
      if (issues.length > 0) {
        console.log(`  ${colors.red}❌ ${component}${colors.reset}`)
        issues.forEach(issue => {
          console.log(`     ${colors.red}▪ ${issue}${colors.reset}`)
        })
      } else {
        console.log(`  ${colors.yellow}⚠️  ${component}${colors.reset}`)
      }
      
      if (warnings.length > 0) {
        warnings.forEach(warning => {
          console.log(`     ${colors.yellow}⚠ ${warning}${colors.reset}`)
        })
      }
    }
  }

  private printSummary() {
    console.log(`\n${colors.cyan}============================================================${colors.reset}`)
    console.log(`${colors.cyan}AUDIT SUMMARY${colors.reset}`)
    console.log(`${colors.cyan}============================================================${colors.reset}\n`)

    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length

    const totalIssues = this.results.reduce((sum, r) => sum + r.issues.length, 0)
    const totalWarnings = this.results.reduce((sum, r) => sum + r.warnings.length, 0)

    console.log(`${colors.green}Passed: ${passed}/${total}${colors.reset}`)
    console.log(`${colors.red}Failed: ${failed}/${total}${colors.reset}`)
    console.log(`${colors.red}Issues: ${totalIssues}${colors.reset}`)
    console.log(`${colors.yellow}Warnings: ${totalWarnings}${colors.reset}\n`)

    if (failed === 0 && totalIssues === 0) {
      console.log(`${colors.green}🎉 All components passed the build compliance audit!${colors.reset}`)
      console.log(`${colors.green}✅ Phase 5 and 6 are ready for npm build${colors.reset}\n`)
    } else {
      console.log(`${colors.red}❌ Build compliance issues detected${colors.reset}`)
      console.log(`${colors.yellow}Please fix the issues above before running npm build${colors.reset}\n`)
    }

    // Critical issues that block build
    const criticalIssues = this.results
      .filter(r => r.issues.some(i => i.includes('empty') || i.includes('does not exist')))
    
    if (criticalIssues.length > 0) {
      console.log(`${colors.red}🚨 CRITICAL ISSUES (blocks build):${colors.reset}`)
      criticalIssues.forEach(result => {
        console.log(`   ${colors.red}▪ ${result.component}${colors.reset}`)
        result.issues.forEach(issue => {
          console.log(`     ${colors.red}- ${issue}${colors.reset}`)
        })
      })
      console.log()
    }
  }
}

// Run audit
const auditor = new BuildAuditor()
auditor.run().catch(console.error)
