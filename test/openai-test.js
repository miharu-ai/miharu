const miharu = require('../dist/index.js').default;

// Initialize miharu
miharu.init();

// Test OpenAI API call with real API key
async function testOpenAIInterception() {
  console.log('Testing OpenAI API interception...');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('OPENAI_API_KEY environment variable not set. Please set it to test real API calls.');
    console.log('Usage: OPENAI_API_KEY=your-key-here node test/openai-test.js');
    return;
  }
  
  try {
    // This should be intercepted by miharu
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello!' }],
        max_tokens: 10
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test non-OpenAI call (should not be intercepted)
  try {
    const response = await fetch('https://httpbin.org/get');
    console.log('Non-OpenAI call successful, status:', response.status);
  } catch (error) {
    console.log('Non-OpenAI call error:', error.message);
  }
}

testOpenAIInterception();
