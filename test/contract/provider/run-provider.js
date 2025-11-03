/**
 * Contract Tests - Provider Runner
 * Runs provider-side verification against consumer contracts
 */
const { spawn } = require('child_process')
const path = require('path')

console.log('🔍 Running Provider Contract Verification...\n')
console.log('⚠️  Make sure backend server is running on http://localhost:3000\n')

const testFile = path.join(__dirname, 'todo-api.provider.test.js')

const proc = spawn('npx', ['mocha', testFile, '--timeout', '30000'], {
  stdio: 'inherit',
  shell: true
})

proc.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Provider verification passed!\n')
    console.log('🎉 Backend API matches frontend expectations!\n')
    process.exit(0)
  } else {
    console.error('\n❌ Provider verification failed!\n')
    console.error('⚠️  Backend API does not match consumer contract!\n')
    process.exit(1)
  }
})

