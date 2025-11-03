/**
 * Database Test Runner
 * Standalone runner for database tests
 */
const { spawn } = require('child_process')
const path = require('path')

console.log('🔍 Running Database Tests...\n')

const testFiles = [
  'database/user.db.test.js',
  'database/todo.db.test.js',
  'database/integrity.db.test.js'
]

async function runTests() {
  for (const testFile of testFiles) {
    console.log(`\n📝 Running ${testFile}...\n`)
    
    const testPath = path.join(__dirname, '..', testFile)
    
    const proc = spawn('npx', ['playwright', 'test', testPath], {
      stdio: 'inherit',
      shell: true
    })

    await new Promise((resolve, reject) => {
      proc.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Test failed with code ${code}`))
        }
      })
    })
  }

  console.log('\n✅ All database tests completed!\n')
}

runTests().catch(err => {
  console.error('❌ Database tests failed:', err.message)
  process.exit(1)
})

