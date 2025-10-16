const { spawn } = require('child_process');

console.log('Starting AI enhancement server on port 3002...');
const apiServer = spawn('node', ['src/server/server.js']);

apiServer.stdout.on('data', (data) => {
  console.log(`[AI Server]: ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
  console.error(`[AI Server Error]: ${data.toString().trim()}`);
});

setTimeout(() => {
  console.log('Starting frontend development server...');
  const frontendServer = spawn('npm', ['run', 'dev']);
  
  frontendServer.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Frontend]: ${output}`);
    
    if (output.includes('Local:') && output.includes('http://localhost:3000')) {
      console.log('\n╔════════════════════════════════════════════════════════════════╗');
      console.log('║                                                                ║');
      console.log('║  🌐 FRONTEND SERVER RUNNING AT: http://localhost:3000/         ║');
      console.log('║                                                                ║');
      console.log('╚════════════════════════════════════════════════════════════════╝\n');
    }
  });
  
  frontendServer.stderr.on('data', (data) => {
    console.error(`[Frontend Error]: ${data.toString().trim()}`);
  });
  
  frontendServer.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
    apiServer.kill();
    process.exit(code);
  });
}, 2000);

apiServer.on('close', (code) => {
  console.log(`AI enhancement server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('Stopping all servers...');
  apiServer.kill();
  process.exit();
});