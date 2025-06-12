const miharu = require('../dist/index.js').default;

// Test database functionality
async function testDatabase() {
  console.log('Testing database integration...');
  
  try {
    // Initialize miharu (now async)
    await miharu.init();
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log('OPENAI_API_KEY not set, using mock data for database test');
      
      // Test with mock data
      const { Database } = require('../dist/database.js');
      const db = new Database();
      await db.init();
      
      const mockCall = {
        id: 'test_123',
        timestamp: Date.now(),
        model: 'gpt-3.5-turbo',
        prompt_tokens: 10,
        completion_tokens: 5,
        cost_cents: 0.0025,
        duration_ms: 150,
        status: 'success'
      };
      
      await db.saveCall(mockCall);
      console.log('Mock data saved to database');
      
      const calls = await db.getAllCalls();
      console.log('Retrieved calls:', calls.length);
      console.log('Latest call:', calls[0]);
      
      await db.close();
      return;
    }
    
    // Test with real API call
    console.log('Making real OpenAI API call to test database...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "Hello from miharu test!"' }],
        max_tokens: 10
      })
    });
    
    console.log('API call completed, status:', response.status);
    
    // Wait a moment for async database save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check database
    const { Database } = require('../dist/database.js');
    const db = new Database();
    await db.init();
    
    const calls = await db.getAllCalls();
    console.log('Total calls in database:', calls.length);
    if (calls.length > 0) {
      console.log('Latest call:', calls[0]);
    }
    
    await db.close();
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testDatabase();