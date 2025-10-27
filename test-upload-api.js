// Test script for UploadThing API
const FormData = require('form-data');
const fs = require('fs');

const testUploadThingAPI = async () => {
  console.log('🧪 Testing UploadThing API...\n');
  
  try {
    // Create a simple test file
    const testContent = 'This is a test file for UploadThing API.';
    const testFilePath = './test-upload-file.txt';
    fs.writeFileSync(testFilePath, testContent);
    console.log('📝 Created test file:', testFilePath);

    // Create form data
    const formData = new FormData();
    formData.append('files', fs.createReadStream(testFilePath), 'test-upload-file.txt');

    console.log('\n📤 Sending request to http://localhost:3001/api/uploadthing');
    
    const response = await fetch('http://localhost:3001/api/uploadthing', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    console.log('\n📊 Response Status:', response.status, response.statusText);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('\n📄 Raw Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('\n📦 Parsed Response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('⚠️  Response is not JSON');
    }

    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Cleaned up test file');

    if (response.ok) {
      console.log('\n✅ UPLOADTHING API TEST PASSED!');
    } else {
      console.log('\n❌ UPLOADTHING API TEST FAILED!');
      console.log('Error:', data?.error || responseText);
    }
  } catch (error) {
    console.error('\n❌ UPLOADTHING API TEST FAILED WITH EXCEPTION!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testUploadThingAPI();
