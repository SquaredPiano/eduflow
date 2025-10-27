// Test script for chat API
const testChatAPI = async () => {
  console.log('🧪 Testing Chat API...\n');
  
  const testMessage = {
    messages: [
      { role: 'user', content: 'Hello! Test message. Please respond with "API Working"' }
    ]
  };

  try {
    console.log('📤 Sending request to http://localhost:3001/api/chat');
    console.log('📦 Payload:', JSON.stringify(testMessage, null, 2));
    
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    console.log('\n📊 Response Status:', response.status, response.statusText);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\n✅ Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ CHAT API TEST PASSED!');
      console.log('💬 AI Response:', data.message?.substring(0, 100) + '...');
    } else {
      console.log('\n❌ CHAT API TEST FAILED!');
      console.log('Error:', data.error || data);
    }
  } catch (error) {
    console.error('\n❌ CHAT API TEST FAILED WITH EXCEPTION!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testChatAPI();
