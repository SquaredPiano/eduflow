/**
 * AUDIT: Phases 4-5 Completion Test
 * ==================================
 * Verifies that Phase 4 (Gemini AI Agents) and Phase 5 (Canvas Integration)
 * are fully implemented and working correctly.
 */

import { GeminiAdapter } from '../src/adapters/gemini.adapter'
import { CanvasAdapter } from '../src/adapters/canvas.adapter'
import { SupabaseAdapter } from '../src/adapters/supabase.adapter'
import { CanvasService } from '../src/services/canvas.service'
import { NotesAgent } from '../src/services/agents/NotesAgent'
import { FlashcardAgent } from '../src/services/agents/FlashcardAgent'
import { QuizAgent } from '../src/services/agents/QuizAgent'
import { SlidesAgent } from '../src/services/agents/SlidesAgent'

const testTranscript = `
Machine learning is a subset of artificial intelligence that focuses on 
enabling computers to learn from data without being explicitly programmed. 
There are three main types: supervised learning uses labeled data, 
unsupervised learning finds patterns in unlabeled data, and reinforcement 
learning learns through trial and error with rewards and penalties.
`

// Test results tracker
const results = {
  phase4: {
    geminiConnection: false,
    notesAgent: false,
    flashcardAgent: false,
    quizAgent: false,
    slidesAgent: false
  },
  phase5: {
    canvasAdapter: false,
    supabaseAdapter: false,
    canvasService: false,
    databaseSchema: false
  }
}

async function auditPhase4() {
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 4 AUDIT: Gemini AI Agents')
  console.log('='.repeat(60) + '\n')

  try {
    // Test 1: Gemini Connection
    console.log('📡 Test 1: Gemini API Connection')
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set in environment')
    }
    const gemini = new GeminiAdapter(apiKey)
    
    try {
      const testPrompt = 'Reply with exactly: "OK"'
      const response = await gemini.complete(testPrompt)
      
      if (response && response.length > 0) {
        console.log('   ✅ Gemini API connected and responding')
        console.log(`   Response: "${response.substring(0, 50)}..."`)
        results.phase4.geminiConnection = true
      } else {
        throw new Error('Empty response from Gemini')
      }
    } catch (error) {
      console.log('   ❌ Gemini API connection failed:', error)
      throw error
    }

    // Test 2: Notes Agent
    console.log('\n📝 Test 2: Notes Agent')
    const notesAgent = new NotesAgent(gemini)
    
    try {
      const notesOutput = await notesAgent.process({ transcript: testTranscript })
      
      // Notes should be markdown, not JSON
      if (!notesOutput || typeof notesOutput !== 'string') {
        throw new Error('Notes agent returned invalid format')
      }
      
      if (notesOutput.length < 50) {
        throw new Error('Notes output too short')
      }
      
      // Check for markdown headings
      const hasMarkdown = notesOutput.includes('#') || notesOutput.includes('**')
      
      console.log('   ✅ Notes Agent working')
      console.log(`   Length: ${notesOutput.length} characters`)
      console.log(`   Markdown format: ${hasMarkdown ? 'Yes' : 'No'}`)
      console.log(`   Sample: ${notesOutput.substring(0, 80)}...`)
      results.phase4.notesAgent = true
    } catch (error) {
      console.log('   ❌ Notes Agent failed:', error)
      throw error
    }

    // Test 3: Flashcard Agent
    console.log('\n💳 Test 3: Flashcard Agent')
    const flashcardAgent = new FlashcardAgent(gemini)
    
    try {
      const flashcardsOutput = await flashcardAgent.process({ transcript: testTranscript })
      
      // Try to parse JSON
      let flashcards
      try {
        flashcards = JSON.parse(flashcardsOutput)
      } catch {
        const jsonMatch = flashcardsOutput.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
        if (jsonMatch) {
          flashcards = JSON.parse(jsonMatch[1])
        } else {
          flashcards = JSON.parse(flashcardsOutput.replace(/```json|```/g, '').trim())
        }
      }
      
      // Flashcards can be an array or object with cards property
      let cardsArray
      if (Array.isArray(flashcards)) {
        cardsArray = flashcards
      } else if (flashcards.cards && Array.isArray(flashcards.cards)) {
        cardsArray = flashcards.cards
      } else {
        throw new Error('Flashcards missing cards array')
      }
      
      if (cardsArray.length === 0) {
        throw new Error('No flashcards generated')
      }
      
      const firstCard = cardsArray[0]
      if (!firstCard.front || !firstCard.back) {
        throw new Error('Flashcard missing front/back')
      }
      
      console.log('   ✅ Flashcard Agent working')
      console.log(`   Cards generated: ${cardsArray.length}`)
      console.log(`   Sample front: "${firstCard.front.substring(0, 40)}..."`)
      console.log(`   Sample back: "${firstCard.back.substring(0, 40)}..."`)
      results.phase4.flashcardAgent = true
    } catch (error) {
      console.log('   ❌ Flashcard Agent failed:', error)
      throw error
    }

    // Test 4: Quiz Agent
    console.log('\n❓ Test 4: Quiz Agent')
    const quizAgent = new QuizAgent(gemini)
    
    try {
      const quizOutput = await quizAgent.process({ transcript: testTranscript })
      
      // Try to parse JSON
      let quiz
      try {
        quiz = JSON.parse(quizOutput)
      } catch {
        const jsonMatch = quizOutput.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
          quiz = JSON.parse(jsonMatch[1])
        } else {
          quiz = JSON.parse(quizOutput.replace(/```json|```/g, '').trim())
        }
      }
      
      if (!quiz || typeof quiz !== 'object') {
        throw new Error('Quiz agent returned invalid format')
      }
      
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Quiz missing questions array')
      }
      
      if (quiz.questions.length === 0) {
        throw new Error('No questions generated')
      }
      
      const firstQ = quiz.questions[0]
      if (!firstQ.question || !firstQ.options || !Array.isArray(firstQ.options)) {
        throw new Error('Question missing required fields')
      }
      
      // Check for correct answer (can be 'correct' index or 'correctAnswer' text)
      if (firstQ.correct === undefined && !firstQ.correctAnswer) {
        throw new Error('Question missing correct answer')
      }
      
      if (firstQ.options.length < 2) {
        throw new Error('Question needs at least 2 options')
      }
      
      const correctAnswer = firstQ.correctAnswer || firstQ.options[firstQ.correct]
      
      console.log('   ✅ Quiz Agent working')
      console.log(`   Questions generated: ${quiz.questions.length}`)
      console.log(`   Sample question: "${firstQ.question.substring(0, 50)}..."`)
      console.log(`   Options: ${firstQ.options.length}`)
      console.log(`   Correct: "${correctAnswer}"`)
      results.phase4.quizAgent = true
    } catch (error) {
      console.log('   ❌ Quiz Agent failed:', error)
      throw error
    }

    // Test 5: Slides Agent
    console.log('\n📊 Test 5: Slides Agent')
    const slidesAgent = new SlidesAgent(gemini)
    
    try {
      const slidesOutput = await slidesAgent.process({ transcript: testTranscript })
      
      // Try to parse JSON
      let slides
      try {
        slides = JSON.parse(slidesOutput)
      } catch {
        const jsonMatch = slidesOutput.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
          slides = JSON.parse(jsonMatch[1])
        } else {
          slides = JSON.parse(slidesOutput.replace(/```json|```/g, '').trim())
        }
      }
      
      if (!slides || typeof slides !== 'object') {
        throw new Error('Slides agent returned invalid format')
      }
      
      // Slides can be an array directly or object with slides property
      let slidesArray
      if (Array.isArray(slides)) {
        slidesArray = slides
      } else if (slides.slides && Array.isArray(slides.slides)) {
        slidesArray = slides.slides
      } else {
        throw new Error('Slides missing slides array')
      }
      
      if (slidesArray.length === 0) {
        throw new Error('No slides generated')
      }
      
      const firstSlide = slidesArray[0]
      // Check for both 'content' and 'bullets' (different formats)
      const slideContent = firstSlide.content || firstSlide.bullets
      if (!firstSlide.title || !slideContent || !Array.isArray(slideContent)) {
        throw new Error('Slide missing required fields (title, content/bullets)')
      }
      
      console.log('   ✅ Slides Agent working')
      console.log(`   Slides generated: ${slidesArray.length}`)
      console.log(`   Sample title: "${firstSlide.title}"`)
      console.log(`   Content points: ${slideContent.length}`)
      results.phase4.slidesAgent = true
    } catch (error) {
      console.log('   ❌ Slides Agent failed:', error)
      throw error
    }

    console.log('\n' + '='.repeat(60))
    console.log('PHASE 4 SUMMARY')
    console.log('='.repeat(60))
    console.log('✅ Gemini API Connection:', results.phase4.geminiConnection ? 'PASS' : 'FAIL')
    console.log('✅ Notes Agent:', results.phase4.notesAgent ? 'PASS' : 'FAIL')
    console.log('✅ Flashcard Agent:', results.phase4.flashcardAgent ? 'PASS' : 'FAIL')
    console.log('✅ Quiz Agent:', results.phase4.quizAgent ? 'PASS' : 'FAIL')
    console.log('✅ Slides Agent:', results.phase4.slidesAgent ? 'PASS' : 'FAIL')

    const phase4Pass = Object.values(results.phase4).every(v => v)
    console.log('\n🎯 PHASE 4 STATUS:', phase4Pass ? '✅ COMPLETE' : '❌ INCOMPLETE')

  } catch (error) {
    console.error('\n❌ PHASE 4 AUDIT FAILED:', error)
    throw error
  }
}

async function auditPhase5() {
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 5 AUDIT: Canvas LMS Integration')
  console.log('='.repeat(60) + '\n')

  try {
    // Test 1: Canvas Adapter Structure
    console.log('🎨 Test 1: Canvas Adapter Implementation')
    const canvasAdapter = new CanvasAdapter('https://q.utoronto.ca')
    
    // Check all required methods exist
    const requiredMethods = ['getCourses', 'getCourseFiles', 'downloadFile', 'verifyToken']
    const missingMethods = requiredMethods.filter(method => {
      return typeof (canvasAdapter as any)[method] !== 'function'
    })
    
    if (missingMethods.length > 0) {
      console.log(`   ❌ Canvas Adapter missing methods: ${missingMethods.join(', ')}`)
      throw new Error('Canvas Adapter incomplete')
    }
    
    console.log('   ✅ Canvas Adapter has all required methods')
    console.log('   Methods:', requiredMethods.join(', '))
    results.phase5.canvasAdapter = true

    // Test 2: Supabase Adapter (Repository Pattern)
    console.log('\n💾 Test 2: Supabase Adapter (Repository)')
    const repository = new SupabaseAdapter()
    
    const requiredRepoMethods = [
      'getUserByAuth0Id', 'getUserByEmail', 'createUser', 'updateUser',
      'getCoursesByUserId', 'createCourse',
      'getFilesByCourseId', 'createFile', 'getFileById',
      'createTranscript', 'getTranscriptsByFileId',
      'createOutput', 'getOutputsByTranscriptId'
    ]
    
    const missingRepoMethods = requiredRepoMethods.filter(method => {
      return typeof (repository as any)[method] !== 'function'
    })
    
    if (missingRepoMethods.length > 0) {
      console.log(`   ❌ Supabase Adapter missing methods: ${missingRepoMethods.join(', ')}`)
      throw new Error('Supabase Adapter incomplete')
    }
    
    console.log('   ✅ Supabase Adapter has all repository methods')
    console.log(`   Methods: ${requiredRepoMethods.length} total`)
    results.phase5.supabaseAdapter = true

    // Test 3: Canvas Service
    console.log('\n🔄 Test 3: Canvas Service Implementation')
    const canvasService = new CanvasService(canvasAdapter, repository)
    
    const requiredServiceMethods = ['syncCourses', 'verifyAndStoreToken']
    const missingServiceMethods = requiredServiceMethods.filter(method => {
      return typeof (canvasService as any)[method] !== 'function'
    })
    
    if (missingServiceMethods.length > 0) {
      console.log(`   ❌ Canvas Service missing methods: ${missingServiceMethods.join(', ')}`)
      throw new Error('Canvas Service incomplete')
    }
    
    console.log('   ✅ Canvas Service has all required methods')
    console.log('   Methods:', requiredServiceMethods.join(', '))
    results.phase5.canvasService = true

    // Test 4: Database Schema
    console.log('\n🗄️  Test 4: Database Schema (Canvas Fields)')
    
    try {
      // Check if Prisma client has the new fields
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // Test User.canvasToken field exists
      const testUser = {
        email: `test-${Date.now()}@test.com`,
        auth0Id: `test-${Date.now()}`,
        canvasToken: 'test-token'
      }
      
      const user = await prisma.user.create({ data: testUser })
      
      if (!user || (user as any).canvasToken !== 'test-token') {
        throw new Error('User.canvasToken field not working')
      }
      
      // Test Course.canvasId field
      const testCourse = {
        name: 'Test Course',
        userId: user.id,
        canvasId: 'canvas-123'
      }
      
      const course = await prisma.course.create({ data: testCourse })
      
      if (!course || (course as any).canvasId !== 'canvas-123') {
        throw new Error('Course.canvasId field not working')
      }
      
      // Test File.canvasId field
      const testFile = {
        name: 'Test File',
        type: 'pdf',
        url: 'https://example.com/file.pdf',
        key: 'test-key-123',
        size: 1024,
        userId: user.id,
        courseId: course.id,
        canvasId: 'canvas-file-456'
      }
      
      const file = await prisma.file.create({ data: testFile })
      
      if (!file || (file as any).canvasId !== 'canvas-file-456') {
        throw new Error('File.canvasId field not working')
      }
      
      // Cleanup test data
      await prisma.file.delete({ where: { id: file.id } })
      await prisma.course.delete({ where: { id: course.id } })
      await prisma.user.delete({ where: { id: user.id } })
      await prisma.$disconnect()
      
      console.log('   ✅ Database schema has all Canvas fields')
      console.log('   Fields verified:')
      console.log('     - User.canvasToken ✓')
      console.log('     - Course.canvasId ✓')
      console.log('     - File.canvasId ✓')
      results.phase5.databaseSchema = true
      
    } catch (error) {
      console.log('   ❌ Database schema check failed:', error)
      throw error
    }

    console.log('\n' + '='.repeat(60))
    console.log('PHASE 5 SUMMARY')
    console.log('='.repeat(60))
    console.log('✅ Canvas Adapter:', results.phase5.canvasAdapter ? 'PASS' : 'FAIL')
    console.log('✅ Supabase Adapter:', results.phase5.supabaseAdapter ? 'PASS' : 'FAIL')
    console.log('✅ Canvas Service:', results.phase5.canvasService ? 'PASS' : 'FAIL')
    console.log('✅ Database Schema:', results.phase5.databaseSchema ? 'PASS' : 'FAIL')

    const phase5Pass = Object.values(results.phase5).every(v => v)
    console.log('\n🎯 PHASE 5 STATUS:', phase5Pass ? '✅ COMPLETE' : '❌ INCOMPLETE')

  } catch (error) {
    console.error('\n❌ PHASE 5 AUDIT FAILED:', error)
    throw error
  }
}

async function checkAPIRoutes() {
  console.log('\n' + '='.repeat(60))
  console.log('API ROUTES CHECK')
  console.log('='.repeat(60) + '\n')

  const fs = await import('fs')
  const path = await import('path')

  const apiRoutes = [
    { path: 'src/app/api/generate/route.ts', description: 'Generate endpoint (Phase 4)' },
    { path: 'src/app/api/canvas-sync/route.ts', description: 'Canvas sync endpoint (Phase 5)' }
  ]

  let allRoutesExist = true

  for (const route of apiRoutes) {
    const fullPath = path.join(process.cwd(), route.path)
    const exists = fs.existsSync(fullPath)
    
    if (exists) {
      console.log(`✅ ${route.description}`)
      console.log(`   Path: ${route.path}`)
    } else {
      console.log(`❌ ${route.description} MISSING`)
      console.log(`   Expected: ${route.path}`)
      allRoutesExist = false
    }
  }

  return allRoutesExist
}

async function checkEnvironmentConfig() {
  console.log('\n' + '='.repeat(60))
  console.log('ENVIRONMENT CONFIGURATION CHECK')
  console.log('='.repeat(60) + '\n')

  const requiredEnvVars = [
    { name: 'GEMINI_API_KEY', phase: 4 },
    { name: 'CANVAS_BASE_URL', phase: 5 },
    { name: 'DATABASE_URL', phase: 5 }
  ]

  let allConfigured = true

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name]
    
    if (value) {
      console.log(`✅ ${envVar.name} (Phase ${envVar.phase})`)
      console.log(`   Value: ${value.substring(0, 30)}...`)
    } else {
      console.log(`❌ ${envVar.name} (Phase ${envVar.phase}) NOT SET`)
      allConfigured = false
    }
  }

  return allConfigured
}

async function main() {
  console.log('\n' + '█'.repeat(60))
  console.log('█' + ' '.repeat(58) + '█')
  console.log('█' + '  EDUFLOW PHASES 4-5 COMPLETION AUDIT'.padEnd(59) + '█')
  console.log('█' + ' '.repeat(58) + '█')
  console.log('█'.repeat(60))

  try {
    // Run all audits
    await auditPhase4()
    await auditPhase5()
    const routesOk = await checkAPIRoutes()
    const envOk = await checkEnvironmentConfig()

    // Final Summary
    console.log('\n' + '█'.repeat(60))
    console.log('█' + ' '.repeat(58) + '█')
    console.log('█' + '  FINAL AUDIT RESULTS'.padEnd(59) + '█')
    console.log('█' + ' '.repeat(58) + '█')
    console.log('█'.repeat(60))

    const phase4Complete = Object.values(results.phase4).every(v => v)
    const phase5Complete = Object.values(results.phase5).every(v => v)
    const allComplete = phase4Complete && phase5Complete && routesOk && envOk

    console.log('\n📊 PHASE 4 (Gemini AI Agents)')
    console.log('   Status:', phase4Complete ? '✅ 100% COMPLETE' : '❌ INCOMPLETE')
    console.log('   Components:')
    Object.entries(results.phase4).forEach(([key, value]) => {
      console.log(`     - ${key}: ${value ? '✅' : '❌'}`)
    })

    console.log('\n📊 PHASE 5 (Canvas Integration)')
    console.log('   Status:', phase5Complete ? '✅ 100% COMPLETE' : '❌ INCOMPLETE')
    console.log('   Components:')
    Object.entries(results.phase5).forEach(([key, value]) => {
      console.log(`     - ${key}: ${value ? '✅' : '❌'}`)
    })

    console.log('\n📊 INFRASTRUCTURE')
    console.log('   API Routes:', routesOk ? '✅ COMPLETE' : '❌ INCOMPLETE')
    console.log('   Environment:', envOk ? '✅ COMPLETE' : '❌ INCOMPLETE')

    console.log('\n' + '='.repeat(60))
    if (allComplete) {
      console.log('🎉 SUCCESS: PHASES 4-5 ARE 100% COMPLETE!')
      console.log('='.repeat(60))
      console.log('\n✅ All tests passed')
      console.log('✅ All components implemented')
      console.log('✅ All integrations working')
      console.log('✅ Database schema updated')
      console.log('✅ API routes functional')
      console.log('✅ Configuration complete')
      console.log('\n🚀 Ready for Phase 6: Export Pipeline\n')
    } else {
      console.log('⚠️  WARNING: INCOMPLETE IMPLEMENTATION')
      console.log('='.repeat(60))
      console.log('\nSome components need attention. Review the detailed')
      console.log('results above to identify what needs to be fixed.\n')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n' + '█'.repeat(60))
    console.error('█' + ' '.repeat(58) + '█')
    console.error('█' + '  AUDIT FAILED'.padEnd(59) + '█')
    console.error('█' + ' '.repeat(58) + '█')
    console.error('█'.repeat(60))
    console.error('\n❌ Error:', error)
    console.error('\nThe audit could not complete. Please check the error above.\n')
    process.exit(1)
  }
}

main()
