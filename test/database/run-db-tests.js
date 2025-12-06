/**
 * Database Test Runner
 * Standalone runner for database tests
 */
const { spawn, exec } = require('child_process')
const path = require('path')
const { promisify } = require('util')

const execAsync = promisify(exec)

console.log('🔍 Running Database Tests...\n')

const testFiles = [
  'database/user.db.test.js',
  'database/todo.db.test.js',
  'database/integrity.db.test.js'
]

async function generatePrismaClient() {
  const backendDir = path.resolve(__dirname, '../../backend')
  
  console.log('🔧 Generating Prisma Client in backend folder...\n')
  
  try {
    // Generate Prisma Client in backend folder (where schema.prisma is located)
    const { stdout, stderr } = await execAsync('npx prisma generate', {
      cwd: backendDir,
      shell: true
    })
    if (stdout) console.log(stdout)
    if (stderr && !stderr.includes('already generated') && !stderr.includes('Prisma schema loaded')) {
      console.error(stderr)
    }
    console.log('✅ Prisma Client generated successfully!\n')
  } catch (error) {
    // If Prisma Client is already generated, that's okay
    if (error.stdout && (error.stdout.includes('already generated') || error.stdout.includes('Prisma Client'))) {
      console.log('✅ Prisma Client already generated\n')
    } else {
      console.error('⚠️  Warning: Failed to generate Prisma Client:', error.message)
      if (error.stdout) console.log(error.stdout)
      if (error.stderr) console.error(error.stderr)
      console.error('   Continuing anyway...\n')
    }
  }
}

async function runTests() {
  const testDir = path.resolve(__dirname, '..')
  
  // Generate Prisma Client first
  await generatePrismaClient()
  
  // Build absolute paths to test files
  const testFilesList = testFiles.map(f => {
    const fullPath = path.resolve(testDir, f)
    console.log(`  - ${f}`)
    return fullPath
  })
  
  console.log(`\n📝 Running all database tests...\n`)
  
  // Use spawn for real-time output streaming
  const args = [...testFilesList, '--grep', '@db']
  const playwright = spawn('npx', ['playwright', 'test', ...args], {
    cwd: testDir,
    shell: true,
    stdio: 'inherit' // Pipe stdout/stderr directly to parent process
  })

  playwright.on('error', (error) => {
    console.error(`\n❌ Failed to start Playwright: ${error.message}`)
    process.exit(1)
  })

  playwright.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All database tests completed!\n')
    } else {
      console.error(`\n❌ Database tests failed with exit code ${code}`)
    }
    process.exit(code)
  })
}

runTests().catch(err => {
  console.error('❌ Database tests failed:', err.message)
  process.exit(1)
})

