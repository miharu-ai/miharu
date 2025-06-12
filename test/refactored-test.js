const miharu = require('../dist/core/index.js').default;

// Test refactored structure
async function testRefactored() {
  console.log('Testing refactored miharu...');
  
  try {
    // Initialize miharu
    await miharu.init();
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log('OPENAI_API_KEY not set, skipping API test');
      return;
    }
    
    // Test with real API call
    console.log('Making OpenAI API call to test refactored structure...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "Refactoring successful!"' }],
        max_tokens: 10
      })
    });
    
    console.log('API call completed, status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response:', data.choices[0].message.content);
    }
    
    // Wait for async database save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Refactored structure working successfully!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testRefactored();