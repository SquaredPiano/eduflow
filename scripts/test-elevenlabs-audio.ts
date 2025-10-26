/**
 * Test ElevenLabs Speech-to-Text with Real Audio File
 * 
 * This script tests the ElevenLabs transcription with the Harvard List 01 audio file
 * Now using the improved transcribeLocal() method (Phase 3.5)
 */

import { ElevenLabsAdapter } from "../src/adapters/elevenlabs.adapter";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function testElevenLabsWithRealAudio() {
  console.log("🎤 Testing ElevenLabs with Real Audio File");
  console.log("=".repeat(60));

  try {
    // 1. Read the audio file
    const audioPath = path.join(process.cwd(), "test", "assets", "harvard-list-01.wav");
    console.log(`\n📁 Reading audio file: ${audioPath}`);
    
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }
    
    const audioBuffer = fs.readFileSync(audioPath);
    console.log(`✓ Audio file loaded: ${(audioBuffer.length / 1024).toFixed(2)} KB`);

    // 2. Initialize ElevenLabs adapter
    console.log("\n🔧 Initializing ElevenLabs adapter...");
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY not found in environment");
    }
    
    const elevenLabs = new ElevenLabsAdapter(apiKey);
    console.log("✓ ElevenLabs adapter initialized");

    // 3. Transcribe using the local file method (new in Phase 3.5)
    console.log("\n🎙️ Transcribing audio with ElevenLabs...");
    console.log("(This may take 10-30 seconds depending on file length)");
    console.log("Using transcribeLocal() method for direct file handling");
    
    const startTime = Date.now();
    const transcriptionText = await elevenLabs.transcribeLocal(audioBuffer, "harvard-list-01.wav");
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Transcription completed in ${duration} seconds`);
    console.log("\n📝 Transcription Result:");
    console.log("-".repeat(60));
    console.log(transcriptionText);
    console.log("-".repeat(60));
    console.log(`\nLength: ${transcriptionText.length} characters`);
    console.log(`Word count: ~${transcriptionText.split(/\s+/).length} words`);

    // 4. Create test database records
    console.log("\n📊 Creating test database records...");
    
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@elevenlabs-test.com`,
        auth0Id: `auth0|elevenlabs-test-${Date.now()}`,
      },
    });
    console.log(`✓ Created test user: ${testUser.id}`);

    const testCourse = await prisma.course.create({
      data: {
        name: "ElevenLabs Transcription Test",
        userId: testUser.id,
      },
    });
    console.log(`✓ Created test course: ${testCourse.id}`);

    const testFile = await prisma.file.create({
      data: {
        name: "harvard-list-01.wav",
        url: "file://" + audioPath,
        type: "audio/wav",
        key: "test-key-elevenlabs",
        size: 1024,
        userId: testUser.id,
        courseId: testCourse.id,
      },
    });
    console.log(`✓ Created test file: ${testFile.id}`);

    // 5. Save transcript to database
    console.log("\n💾 Saving transcript to database...");
    
    const transcript = await prisma.transcript.create({
      data: {
        content: transcriptionText,
        fileId: testFile.id,
      },
    });
    console.log(`✓ Transcript saved: ${transcript.id}`);

    // 6. Verify database persistence
    console.log("\n🔍 Verifying database persistence...");
    const savedTranscript = await prisma.transcript.findUnique({
      where: { id: transcript.id },
      include: { file: true },
    });

    if (!savedTranscript) {
      throw new Error("Transcript not found in database");
    }

    console.log("✓ Transcript retrieved from database");
    console.log(`  File: ${savedTranscript.file.name}`);
    console.log(`  Content preview: ${savedTranscript.content.substring(0, 100)}...`);

    // 7. Cleanup
    console.log("\n🧹 Cleaning up test data...");
    await prisma.transcript.delete({ where: { id: transcript.id } });
    await prisma.file.delete({ where: { id: testFile.id } });
    await prisma.course.delete({ where: { id: testCourse.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log("✓ Cleanup complete");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ELEVENLABS REAL AUDIO TEST: SUCCESS");
    console.log("=".repeat(60));
    console.log("\nTest Summary:");
    console.log(`  ✅ Audio file loaded: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`  ✅ Transcription completed in ${duration}s`);
    console.log(`  ✅ Transcript length: ${transcriptionText.length} chars`);
    console.log(`  ✅ Database persistence verified`);
    console.log("\n✨ ElevenLabs Speech-to-Text is working perfectly!");

  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testElevenLabsWithRealAudio();
