/**
 * Test ElevenLabs with MP4 Video File
 * 
 * This script tests transcribing audio from MP4 video files
 * You can provide your own MP4 file or we'll guide you to add one
 */

import { ElevenLabsAdapter } from "../src/adapters/elevenlabs.adapter";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function testElevenLabsWithMP4() {
  console.log("🎬 Testing ElevenLabs with MP4 Video File");
  console.log("=".repeat(60));

  try {
    // 1. Check for MP4 files in test/assets
    const assetsDir = path.join(process.cwd(), "test", "assets");
    const files = fs.readdirSync(assetsDir);
    const mp4Files = files.filter(f => f.toLowerCase().endsWith('.mp4'));

    if (mp4Files.length === 0) {
      console.log("\n⚠️  No MP4 files found in test/assets/");
      console.log("\nTo test with MP4:");
      console.log("1. Add an MP4 file to: test/assets/");
      console.log("2. Run this script again");
      console.log("\nExample: test/assets/sample-video.mp4");
      console.log("\n📝 Note: ElevenLabs extracts audio from video automatically");
      console.log("Supported formats: MP4, MOV, AVI, MKV, FLV, WEBM");
      process.exit(0);
    }

    const mp4File = mp4Files[0];
    const mp4Path = path.join(assetsDir, mp4File);
    
    console.log(`\n📁 Found MP4 file: ${mp4File}`);
    console.log(`   Path: ${mp4Path}`);

    // 2. Read the MP4 file
    const videoBuffer = fs.readFileSync(mp4Path);
    const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`✓ Video loaded: ${fileSizeMB} MB`);

    // 3. Initialize ElevenLabs adapter
    console.log("\n🔧 Initializing ElevenLabs adapter...");
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY not found in environment");
    }
    
    const elevenLabs = new ElevenLabsAdapter(apiKey);
    console.log("✓ ElevenLabs adapter initialized");

    // 4. Check if MP4 format is supported
    const mimeType = 'video/mp4';
    const isSupported = ElevenLabsAdapter.isSupportedFormat(mimeType);
    console.log(`\n📋 Format check: video/mp4 - ${isSupported ? '✅ Supported' : '❌ Not supported'}`);

    // 5. Transcribe the video using local method
    console.log("\n🎙️ Transcribing audio from MP4 video...");
    console.log("(This may take longer for video files - 10-60 seconds)");
    console.log("ElevenLabs will automatically extract audio from the video");
    
    const startTime = Date.now();
    const transcriptionText = await elevenLabs.transcribeLocal(videoBuffer, mp4File);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Transcription completed in ${duration} seconds`);
    console.log("\n📝 Transcription Result:");
    console.log("-".repeat(60));
    console.log(transcriptionText);
    console.log("-".repeat(60));
    console.log(`\nLength: ${transcriptionText.length} characters`);
    console.log(`Word count: ~${transcriptionText.split(/\s+/).length} words`);

    // 6. Create test database records
    console.log("\n📊 Creating test database records...");
    
    const testUser = await prisma.user.create({
      data: {
        email: `test-mp4-${Date.now()}@elevenlabs-test.com`,
        auth0Id: `auth0|mp4-test-${Date.now()}`,
      },
    });
    console.log(`✓ Created test user: ${testUser.id}`);

    const testCourse = await prisma.course.create({
      data: {
        name: "MP4 Video Transcription Test",
        userId: testUser.id,
      },
    });
    console.log(`✓ Created test course: ${testCourse.id}`);

    const testFile = await prisma.file.create({
      data: {
        name: mp4File,
        url: "file://" + mp4Path,
        type: "video/mp4",
        courseId: testCourse.id,
      },
    });
    console.log(`✓ Created test file: ${testFile.id}`);

    // 7. Save transcript to database
    console.log("\n💾 Saving transcript to database...");
    
    const transcript = await prisma.transcript.create({
      data: {
        content: transcriptionText,
        fileId: testFile.id,
      },
    });
    console.log(`✓ Transcript saved: ${transcript.id}`);

    // 8. Verify database persistence
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
    console.log(`  File type: ${savedTranscript.file.type}`);
    console.log(`  Content preview: ${savedTranscript.content.substring(0, 100)}...`);

    // 9. Cleanup
    console.log("\n🧹 Cleaning up test data...");
    await prisma.transcript.delete({ where: { id: transcript.id } });
    await prisma.file.delete({ where: { id: testFile.id } });
    await prisma.course.delete({ where: { id: testCourse.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log("✓ Cleanup complete");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ELEVENLABS MP4 VIDEO TEST: SUCCESS");
    console.log("=".repeat(60));
    console.log("\nTest Summary:");
    console.log(`  ✅ MP4 file loaded: ${fileSizeMB} MB`);
    console.log(`  ✅ Audio extraction: Automatic`);
    console.log(`  ✅ Transcription completed in ${duration}s`);
    console.log(`  ✅ Transcript length: ${transcriptionText.length} chars`);
    console.log(`  ✅ Database persistence verified`);
    console.log("\n✨ ElevenLabs can transcribe MP4 videos directly!");
    console.log("💡 No need to extract audio separately - ElevenLabs handles it!");

  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testElevenLabsWithMP4();
