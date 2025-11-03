/**
 * Contract Tests - Consumer Runner
 * Runs consumer-side Pact tests
 */
const { spawn } = require('child_process')
const path = require('path')

console.log('🔍 Running Consumer Contract Tests...\n')

const testFile = path.join(__dirname, 'todo-api.pact.test.js')

const proc = spawn('npx', ['mocha', testFile, '--timeout', '10000'], {
  stdio: 'inherit',
  shell: true
})

proc.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Consumer contract tests passed!\n')
    console.log('📄 Pact file generated in: pacts/TodoFrontend-TodoBackend.json\n')
    process.exit(0)
  } else {
    console.error('\n❌ Consumer contract tests failed!\n')
    process.exit(1)
  }
})

