/**
 * Convert Artillery JSON results to Allure format
 * This script converts Artillery performance test results to Allure-compatible format
 */
const fs = require('fs')
const path = require('path')
// Simple UUID generator (no external dependency needed)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Artillery results directory
const ARTILLERY_RESULTS_DIR = path.join(__dirname, 'reports')
const ALLURE_RESULTS_DIR = path.resolve(__dirname, '..', 'allure-results')

// Ensure allure-results directory exists
if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
  fs.mkdirSync(ALLURE_RESULTS_DIR, { recursive: true })
}

/**
 * Convert Artillery result to Allure test result
 */
function convertArtilleryToAllure(artilleryResult, testName) {
  const testUuid = generateUUID()
  const startTime = Date.now()
  
  // Calculate duration from Artillery metrics
  const duration = artilleryResult.latency?.mean || 0
  
  // Determine status based on errors
  const hasErrors = artilleryResult.errors && Object.keys(artilleryResult.errors).length > 0
  const status = hasErrors ? 'failed' : 'passed'
  
  // Create Allure test result JSON
  const allureResult = {
    uuid: testUuid,
    historyId: testName,
    fullName: `Performance Test: ${testName}`,
    labels: [
      { name: 'suite', value: 'Performance Tests' },
      { name: 'testClass', value: 'Artillery' },
      { name: 'tag', value: '@performance' }
    ],
    links: [],
    name: testName,
    status: status,
    statusDetails: hasErrors ? {
      message: 'Performance test completed with errors',
      trace: JSON.stringify(artilleryResult.errors, null, 2)
    } : null,
    stage: 'finished',
    description: `Performance test: ${testName}\nTarget: ${artilleryResult.target || 'N/A'}`,
    descriptionHtml: `<p>Performance test: <strong>${testName}</strong></p><p>Target: ${artilleryResult.target || 'N/A'}</p>`,
    steps: [],
    attachments: [
      {
        name: 'Artillery Metrics',
        source: `${testUuid}-artillery-metrics.json`,
        type: 'application/json'
      }
    ],
    parameters: [
      { name: 'Target URL', value: artilleryResult.target || 'N/A' },
      { name: 'Duration', value: `${duration}ms` },
      { name: 'Requests', value: (artilleryResult.aggregate?.counters?.['http.requests'] || 0).toString() }
    ],
    start: startTime,
    stop: startTime + duration
  }
  
  // Save Artillery metrics as attachment
  const metricsPath = path.join(ALLURE_RESULTS_DIR, `${testUuid}-artillery-metrics.json`)
  fs.writeFileSync(metricsPath, JSON.stringify(artilleryResult, null, 2))
  
  // Save Allure result
  const resultPath = path.join(ALLURE_RESULTS_DIR, `${testUuid}-result.json`)
  fs.writeFileSync(resultPath, JSON.stringify(allureResult, null, 2))
  
  return testUuid
}

/**
 * Process Artillery results
 */
function processArtilleryResults() {
  console.log('📊 Converting Artillery results to Allure format...\n')
  
  if (!fs.existsSync(ARTILLERY_RESULTS_DIR)) {
    console.log('⚠️  No Artillery results directory found, skipping conversion')
    return
  }
  
  const files = fs.readdirSync(ARTILLERY_RESULTS_DIR)
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  
  if (jsonFiles.length === 0) {
    console.log('⚠️  No Artillery JSON results found')
    return
  }
  
  let converted = 0
  jsonFiles.forEach(file => {
    try {
      const filePath = path.join(ARTILLERY_RESULTS_DIR, file)
      const artilleryData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      const testName = file.replace('.json', '').replace(/-/g, ' ')
      convertArtilleryToAllure(artilleryData, testName)
      converted++
      console.log(`✅ Converted: ${testName}`)
    } catch (error) {
      console.error(`❌ Failed to convert ${file}: ${error.message}`)
    }
  })
  
  console.log(`\n✅ Converted ${converted} Artillery result(s) to Allure format`)
}

// Run conversion
processArtilleryResults()
