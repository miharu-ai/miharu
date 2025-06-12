const { startDashboard } = require('../dist/dashboard.js');

async function testDashboard() {
  console.log('Starting dashboard test...');
  
  try {
    // Start dashboard on a different port for testing
    const port = 3002;
    console.log(`Starting dashboard on port ${port}...`);
    
    // Start dashboard (this will keep running)
    startDashboard(port);
    
    // Give it a moment to start
    setTimeout(async () => {
      try {
        // Test if dashboard is accessible
        const response = await fetch(`http://localhost:${port}/`);
        if (response.ok) {
          console.log('✅ Dashboard is running successfully!');
          console.log(`✅ Access it at: http://localhost:${port}`);
        } else {
          console.log('❌ Dashboard returned error:', response.status);
        }
      } catch (error) {
        console.error('❌ Failed to connect to dashboard:', error.message);
      }
    }, 1000);
    
  } catch (error) {
    console.error('Dashboard test error:', error);
  }
}

testDashboard();