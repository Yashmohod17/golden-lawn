import http from 'http';

function checkHealth() {
  http.get('http://localhost:5000/health', (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('--- SERVER HEALTH CHECK ---');
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Response Body: ${body}`);
      if (res.statusCode === 200) {
        console.log('[SUCCESS] Server is online and healthy on port 5000!');
      } else {
        console.error('[FAILURE] Server returned non-200 status code');
      }
    });
  }).on('error', (err) => {
    console.error('[FAILURE] Could not connect to server:', err.message);
  });
}

checkHealth();
