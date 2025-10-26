import { CanvasAdapter } from '../src/adapters/canvas.adapter'
import { SupabaseAdapter } from '../src/adapters/supabase.adapter'
import { CanvasService } from '../src/services/canvas.service'

const CANVAS_BASE_URL = process.env.CANVAS_BASE_URL || 'https://q.utoronto.ca'

async function testCanvas() {
  console.log('\n🎨 Testing Canvas Integration...\n')

  // Get Canvas token from command line
  const canvasToken = process.argv[2]
  if (!canvasToken) {
    console.error('❌ Please provide Canvas token as argument')
    console.log('Usage: npx tsx scripts/test-canvas.ts YOUR_CANVAS_TOKEN')
    console.log('\nTo get your Canvas token:')
    console.log('1. Go to https://q.utoronto.ca/profile/settings')
    console.log('2. Scroll to "Approved Integrations"')
    console.log('3. Click "+ New Access Token"')
    console.log('4. Give it a name (e.g. "EduFlow")')
    console.log('5. Copy the token and use it here')
    process.exit(1)
  }

  try {
    // Initialize adapters
    const canvasAdapter = new CanvasAdapter(CANVAS_BASE_URL)
    const repository = new SupabaseAdapter()
    const canvasService = new CanvasService(canvasAdapter, repository)

    // Step 1: Verify token
    console.log('🔑 Verifying Canvas token...')
    const isValid = await canvasAdapter.verifyToken(canvasToken)
    if (!isValid) {
      console.error('❌ Invalid Canvas token')
      process.exit(1)
    }
    console.log('✅ Canvas token is valid')

    // Step 2: Get courses
    console.log('\n📚 Fetching courses from Canvas...')
    const courses = await canvasAdapter.getCourses(canvasToken)
    console.log(`✅ Found ${courses.length} courses`)

    // Display courses
    const eightMonthsAgo = new Date()
    eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8)

    console.log('\nRecent courses (last 8 months):')
    for (const course of courses) {
      if (course.workflow_state !== 'available') continue
      if (new Date(course.created_at) < eightMonthsAgo) continue

      console.log(`\n  📖 ${course.name}`)
      console.log(`     ID: ${course.id}`)
      console.log(`     Code: ${course.course_code}`)
      console.log(`     Created: ${new Date(course.created_at).toLocaleDateString()}`)

      // Get files for first course only
      if (courses.indexOf(course) === 0) {
        console.log('\n     Files:')
        const files = await canvasAdapter.getCourseFiles(course.id, canvasToken)
        console.log(`     Found ${files.length} files`)

        const supportedFiles = files.filter(f =>
          ['application/pdf', 'video/mp4', 'audio/mpeg', 'audio/wav'].includes(
            f['content-type']
          )
        )

        console.log(`     Supported files (PDF, MP4, MP3, WAV): ${supportedFiles.length}`)

        for (const file of supportedFiles.slice(0, 5)) {
          console.log(`       - ${file.display_name} (${file['content-type']})`)
        }

        if (supportedFiles.length > 5) {
          console.log(`       ... and ${supportedFiles.length - 5} more`)
        }
      }
    }

    // Step 3: Create test user and sync
    console.log('\n\n👤 Creating test user...')
    const testUser = await repository.createUser({
      email: 'test@example.com',
      auth0Id: `test-${Date.now()}`
    })
    console.log(`✅ Created user: ${testUser.id}`)

    console.log('\n🔄 Syncing courses to database...')
    const result = await canvasService.syncCourses(testUser.id, canvasToken)
    console.log(`✅ Sync complete!`)
    console.log(`   Courses added: ${result.coursesAdded}`)
    console.log(`   Files added: ${result.filesAdded}`)

    // Verify in database
    console.log('\n📊 Verifying database...')
    const dbCourses = await repository.getCoursesByUserId(testUser.id)
    console.log(`✅ Database has ${dbCourses.length} courses`)

    for (const course of dbCourses) {
      const dbFiles = await repository.getFilesByCourseId(course.id)
      console.log(`   - ${course.name}: ${dbFiles.length} files`)
    }

    console.log('\n✅ ALL CANVAS INTEGRATION TESTS PASSED!')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    throw error
  }
}

testCanvas()
