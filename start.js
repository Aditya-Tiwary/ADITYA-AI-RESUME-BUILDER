const { spawn, execSync } = require('child_process');

// Check if running in production (Render or other production environments)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

if (isProduction) {
  // Production mode: Build frontend and start unified server
  console.log('🚀 Starting in PRODUCTION mode...');
  console.log('📦 Building frontend...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend build complete!');
  } catch (error) {
    console.error('❌ Frontend build failed:', error);
    process.exit(1);
  }
  
  console.log('🌐 Starting unified server (API + Frontend)...');
  const server = spawn('node', ['src/server/server.js'], { stdio: 'inherit' });
  
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
  
  process.on('SIGINT', () => {
    console.log('Stopping server...');
    server.kill();
    process.exit();
  });
} else {
  // Development mode: Run API server and Vite dev server separately
  console.log('🔧 Starting in DEVELOPMENT mode...');
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
}
