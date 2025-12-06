/**
 * Artillery Wrapper Script
 * Loads environment variables and runs Artillery with correct target URL
 * Uses spawn for real-time output streaming
 */
require('dotenv').config()
const { spawn } = require('child_process')
const path = require('path')

// Get backend URL from environment or use default hosted URL
const BACKEND_URL = process.env.BACKEND_URL || 'https://todo-app-xhn2.onrender.com'

// Get the test file from command line arguments
const testFile = process.argv[2]

if (!testFile) {
  console.error('❌ Error: Please provide a test file path')
  console.log('Usage: node run-artillery.js <test-file.yml>')
  process.exit(1)
}

// Use relative path to avoid issues with spaces in Windows paths
// testFile is already relative (e.g., "scenarios/load-test.yml")
// We need to prepend "performance/" to make it work from test/ directory
const testFileRelative = path.join('performance', testFile)

console.log('🚀 Running Artillery Performance Test...')
console.log(`📡 Target URL: ${BACKEND_URL}`)
console.log(`📄 Test File: ${testFileRelative}\n`)

// Use spawn for real-time output streaming
// Use relative path to avoid Windows path issues with spaces
const artillery = spawn('artillery', ['run', testFileRelative, '--target', BACKEND_URL], {
  cwd: path.resolve(__dirname, '..'),
  shell: true,
  stdio: 'inherit', // Pipe stdout/stderr directly to parent process
  env: {
    ...process.env,
    BACKEND_URL: BACKEND_URL
  }
})

artillery.on('error', (error) => {
  console.error(`\n❌ Failed to start Artillery: ${error.message}`)
  process.exit(1)
})

artillery.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Performance test completed!')
  } else {
    console.error(`\n❌ Performance test failed with exit code ${code}`)
  }
  process.exit(code)
})

