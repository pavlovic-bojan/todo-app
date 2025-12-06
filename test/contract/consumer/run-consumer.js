/**
 * Contract Tests - Consumer Runner
 * Runs consumer-side Pact tests
 */
const { exec } = require('child_process')
const path = require('path')
const { promisify } = require('util')

const execAsync = promisify(exec)

console.log('🔍 Running Consumer Contract Tests...\n')

const testFile = path.relative(path.resolve(__dirname, '../..'), path.join(__dirname, 'todo-api.pact.test.js'))
const testDir = path.resolve(__dirname, '../..')

async function runTests() {
  try {
    // Try using local mocha first, fallback to npx
    const mochaPath = path.join(testDir, 'node_modules', '.bin', 'mocha')
    const fs = require('fs')
    const useLocalMocha = fs.existsSync(mochaPath)
    
    let command
    if (useLocalMocha) {
      // Use local mocha
      command = `"${mochaPath}" "${testFile}" --timeout 10000`
    } else {
      // Fallback to npx with proper quoting
      command = `npx --yes -- mocha "${testFile}" --timeout 10000`
    }
    const { stdout, stderr } = await execAsync(command, {
      cwd: testDir,
      shell: true
    })
    
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    
    console.log('\n✅ Consumer contract tests passed!\n')
    console.log('📄 Pact file generated in: pacts/TodoFrontend-TodoBackend.json\n')
    process.exit(0)
  } catch (error) {
    if (error.stdout) console.log(error.stdout)
    if (error.stderr) console.error(error.stderr)
    console.error('\n❌ Consumer contract tests failed!\n')
    process.exit(1)
  }
}

runTests()

