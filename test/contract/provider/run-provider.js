/**
 * Contract Tests - Provider Runner
 * Runs provider-side verification against consumer contracts
 */
const { exec } = require('child_process')
const path = require('path')
const { promisify } = require('util')

const execAsync = promisify(exec)

console.log('🔍 Running Provider Contract Verification...\n')
console.log('⚠️  Make sure backend server is running on http://localhost:3000\n')

const testFile = path.relative(path.resolve(__dirname, '../..'), path.join(__dirname, 'todo-api.provider.test.js'))
const testDir = path.resolve(__dirname, '../..')

async function runTests() {
  try {
    // Try using local mocha first, fallback to npx
    const mochaPath = path.join(testDir, 'node_modules', '.bin', 'mocha')
    const fs = require('fs')
    const useLocalMocha = fs.existsSync(mochaPath)
    
    let command
    if (useLocalMocha) {
      // Use local mocha with Allure reporter
      command = `"${mochaPath}" "${testFile}" --timeout 30000 --reporter allure-mocha`
    } else {
      // Fallback to npx with proper quoting and Allure reporter
      command = `npx --yes -- mocha "${testFile}" --timeout 30000 --reporter allure-mocha`
    }
    const { stdout, stderr } = await execAsync(command, {
      cwd: testDir,
      shell: true
    })
    
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    
    console.log('\n✅ Provider verification passed!\n')
    console.log('🎉 Backend API matches frontend expectations!\n')
    process.exit(0)
  } catch (error) {
    if (error.stdout) console.log(error.stdout)
    if (error.stderr) console.error(error.stderr)
    console.error('\n❌ Provider verification failed!\n')
    console.error('⚠️  Backend API does not match consumer contract!\n')
    process.exit(1)
  }
}

runTests()

