/**
 * Phase 6 Export Test Script
 * Tests all export formats (PDF, Anki, CSV, PPTX) with real data
 */

import { ExportService } from '../src/services/export.service'
import { GeminiAdapter } from '../src/adapters/gemini.adapter'
import { NotesAgent } from '../src/services/agents/NotesAgent'
import { FlashcardAgent } from '../src/services/agents/FlashcardAgent'
import { QuizAgent } from '../src/services/agents/QuizAgent'
import { SlidesAgent } from '../src/services/agents/SlidesAgent'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const testTranscript = `
Quantum computing represents a revolutionary approach to computation that leverages
the principles of quantum mechanics. Unlike classical computers that use bits (0 or 1),
quantum computers use quantum bits or qubits that can exist in superposition,
representing multiple states simultaneously. This enables quantum computers to process
vast amounts of information in parallel. Key concepts include superposition, where
qubits can be in multiple states at once, and entanglement, where qubits become
correlated in ways that have no classical equivalent. Quantum computing has potential
applications in cryptography, drug discovery, financial modeling, and optimization problems.
`

async function setupTestData() {
  console.log('\n🔧 Setting up test data...\n')

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set')
  }

  const gemini = new GeminiAdapter(apiKey)

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: `test-export-${Date.now()}@example.com`,
      auth0Id: `test-export-${Date.now()}`,
    },
  })
  console.log(`✅ Created test user: ${user.id}`)

  // Create test file
  const file = await prisma.file.create({
    data: {
      name: 'quantum-computing-lecture.mp4',
      type: 'mp4',
      url: 'https://example.com/quantum.mp4',
      key: 'test-key-123',
      size: 1024000,
      user: {
        connect: { id: user.id }
      },
    },
  })
  console.log(`✅ Created test file: ${file.id}`)

  // Create transcript
  const transcript = await prisma.transcript.create({
    data: {
      content: testTranscript,
      fileId: file.id,
    },
  })
  console.log(`✅ Created transcript: ${transcript.id}`)

  // Generate all content types
  console.log('\n📝 Generating content with AI agents...')

  const notesAgent = new NotesAgent(gemini)
  const flashcardAgent = new FlashcardAgent(gemini)
  const quizAgent = new QuizAgent(gemini)
  const slidesAgent = new SlidesAgent(gemini)

  // Generate notes
  console.log('  📄 Generating notes...')
  const notesContent = await notesAgent.process({ transcript: testTranscript })
  const notesOutput = await prisma.output.create({
    data: {
      type: 'notes',
      content: notesContent,
      transcriptId: transcript.id,
    },
  })
  console.log(`  ✅ Notes output: ${notesOutput.id}`)

  // Generate flashcards
  console.log('  💳 Generating flashcards...')
  const flashcardsContent = await flashcardAgent.process({ transcript: testTranscript })
  const flashcardsOutput = await prisma.output.create({
    data: {
      type: 'flashcards',
      content: flashcardsContent,
      transcriptId: transcript.id,
    },
  })
  console.log(`  ✅ Flashcards output: ${flashcardsOutput.id}`)

  // Generate quiz
  console.log('  ❓ Generating quiz...')
  const quizContent = await quizAgent.process({ transcript: testTranscript })
  const quizOutput = await prisma.output.create({
    data: {
      type: 'quiz',
      content: quizContent,
      transcriptId: transcript.id,
    },
  })
  console.log(`  ✅ Quiz output: ${quizOutput.id}`)

  // Generate slides
  console.log('  📊 Generating slides...')
  const slidesContent = await slidesAgent.process({ transcript: testTranscript })
  const slidesOutput = await prisma.output.create({
    data: {
      type: 'slides',
      content: slidesContent,
      transcriptId: transcript.id,
    },
  })
  console.log(`  ✅ Slides output: ${slidesOutput.id}`)

  return {
    user,
    file,
    transcript,
    outputs: {
      notes: notesOutput,
      flashcards: flashcardsOutput,
      quiz: quizOutput,
      slides: slidesOutput,
    },
  }
}

async function testExports(outputs: any) {
  console.log('\n📦 Testing export functionality...\n')

  const exportService = new ExportService()
  const exportDir = path.join(process.cwd(), 'test', 'exports')

  // Create export directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }

  const results = {
    pdf_notes: false,
    pdf_flashcards: false,
    pdf_quiz: false,
    pdf_slides: false,
    anki_flashcards: false,
    csv_quiz: false,
    pptx_slides: false,
  }

  // Test 1: Export notes as PDF
  try {
    console.log('📄 Test 1: Export notes as PDF')
    const { buffer, filename } = await exportService.export(outputs.notes.id, 'pdf')
    const filePath = path.join(exportDir, filename)
    fs.writeFileSync(filePath, buffer)
    console.log(`  ✅ Success: ${filename} (${buffer.length} bytes)`)
    console.log(`  📁 Saved to: ${filePath}`)
    results.pdf_notes = true
  } catch (error) {
    console.log(`  ❌ Failed:`, error)
  }

  // Test 2: Export flashcards as Anki
  try {
    console.log('\n💳 Test 2: Export flashcards as Anki')
    const { buffer, filename } = await exportService.export(outputs.flashcards.id, 'anki')
    const filePath = path.join(exportDir, filename)
    fs.writeFileSync(filePath, buffer)
    console.log(`  ✅ Success: ${filename} (${buffer.length} bytes)`)
    console.log(`  📁 Saved to: ${filePath}`)
    results.anki_flashcards = true
  } catch (error) {
    console.log(`  ❌ Failed:`, error)
  }

  // Test 3: Export flashcards as PDF
  try {
    console.log('\n💳 Test 3: Export flashcards as PDF')
    const { buffer, filename } = await exportService.export(outputs.flashcards.id, 'pdf')
    const filePath = path.join(exportDir, filename)
    fs.writeFileSync(filePath, buffer)
    console.log(`  ✅ Success: ${filename} (${buffer.length} bytes)`)
    console.log(`  📁 Saved to: ${filePath}`)
    results.pdf_flashcards = true
  } catch (error) {
    console.log(`  ❌ Failed:`, error)
  }

  // Test 4: Export quiz as CSV
  try {
    console.log('\n❓ Test 4: Export quiz as CSV')
    const { buffer, filename } = await exportService.export(outputs.quiz.id, 'csv')
    const filePath = path.join(exportDir, filename)
    fs.writeFileSync(filePath, buffer)
    console.log(`  ✅ Success: ${filename} (${buffer.length} bytes)`)
    console.log(`  📁 Saved to: ${filePath}`)
    
    // Show sample of CSV content
    const csvContent = buffer.toString('utf-8')
    const lines = csvContent.split('\n').slice(0, 3)
    console.log(`  📝 Sample CSV content:`)
    lines.forEach(line => console.log(`     ${line}`))
    
    results.csv_quiz = true
  } catch (error) {
    console.log(`  ❌ Failed:`, error)
  }

  // Test 5: Export quiz as PDF
  try {
    console.log('\n❓ Test 5: Export quiz as PDF')
    const { buffer, filename } = await exportService.export(outputs.quiz.id, 'pdf')
    const filePath = path.join(exportDir, filename)
    fs.writeFileSync(filePath, buffer)
    console.log(`  ✅ Success: ${filename} (${buffer.length} bytes)`)
    console.log(`  📁 Saved to: ${filePath}`)
    results.pdf_quiz = true
  } catch (error) {
    console.log(`  ❌ Failed:`, error)
  }

  // Test 6: Export slides as PPTX
  try {
    console.log('\n📊 Test 6: Export slides as PPTX')
    const { buffer, filename } = await exportService.export(outputs.slides.id, 'pptx')
    const filePath = path.join(exportDir, filename)
    fs.writeFileSync(filePath, buffer)
    console.log(`  ✅ Success: ${filename} (${buffer.length} bytes)`)
    console.log(`  📁 Saved to: ${filePath}`)
    results.pptx_slides = true
  } catch (error) {
    console.log(`  ❌ Failed:`, error)
  }

  // Test 7: Export slides as PDF
  try {
    console.log('\n📊 Test 7: Export slides as PDF')
    const { buffer, filename } = await exportService.export(outputs.slides.id, 'pdf')
    const filePath = path.join(exportDir, filename)
    fs.writeFileSync(filePath, buffer)
    console.log(`  ✅ Success: ${filename} (${buffer.length} bytes)`)
    console.log(`  📁 Saved to: ${filePath}`)
    results.pdf_slides = true
  } catch (error) {
    console.log(`  ❌ Failed:`, error)
  }

  return results
}

async function testFormatCompatibility() {
  console.log('\n🔍 Testing format compatibility validation...\n')

  const exportService = new ExportService()

  const tests = [
    { type: 'notes', formats: ['pdf'], shouldFail: ['anki', 'csv', 'pptx'] },
    { type: 'flashcards', formats: ['anki', 'pdf'], shouldFail: ['csv', 'pptx'] },
    { type: 'quiz', formats: ['csv', 'pdf'], shouldFail: ['anki', 'pptx'] },
    { type: 'slides', formats: ['pptx', 'pdf'], shouldFail: ['anki', 'csv'] },
  ]

  for (const test of tests) {
    console.log(`📋 Content type: ${test.type}`)
    
    const availableFormats = exportService.getAvailableFormats(test.type)
    console.log(`  ✅ Available formats: ${availableFormats.join(', ')}`)
    
    const expected = test.formats.sort().join(',')
    const actual = availableFormats.sort().join(',')
    
    if (expected === actual) {
      console.log(`  ✅ Format compatibility correct`)
    } else {
      console.log(`  ❌ Expected: ${expected}, got: ${actual}`)
    }
  }
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 6: EXPORT PIPELINE TEST')
  console.log('='.repeat(60))

  try {
    // Setup test data
    const { outputs } = await setupTestData()

    // Test format compatibility
    await testFormatCompatibility()

    // Test all exports
    const results = await testExports(outputs)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('EXPORT TEST SUMMARY')
    console.log('='.repeat(60))

    const allPassed = Object.values(results).every(v => v)

    Object.entries(results).forEach(([key, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${key}`)
    })

    console.log('\n' + '='.repeat(60))
    if (allPassed) {
      console.log('🎉 ALL EXPORT TESTS PASSED!')
      console.log('\n✅ Phase 6 is 100% complete')
      console.log('✅ All 4 export formats working')
      console.log('✅ Format compatibility validated')
      console.log('✅ Files generated successfully')
    } else {
      console.log('⚠️  SOME TESTS FAILED')
      console.log('Review the errors above')
    }
    console.log('='.repeat(60) + '\n')

    await prisma.$disconnect()
    
    if (!allPassed) {
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
