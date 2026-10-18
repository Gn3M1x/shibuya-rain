import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const code = readFileSync(new URL('./browser-smoke.cjs', import.meta.url), 'utf8')
const executable = process.env.PLAYWRIGHT_CLI_PATH ?? 'npx'
const prefix = process.env.PLAYWRIGHT_CLI_PATH ? [] : ['--yes', '--package', '@playwright/cli', 'playwright-cli']
mkdirSync('output/playwright', { recursive: true })
const result = spawnSync(executable, [...prefix, '-s=shibuya-qa', 'run-code', code], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
const log = (result.stdout ?? '') + (result.stderr ?? '')
console.log(log)
writeFileSync('output/playwright/browser-check.log', log)
const match = log.match(/### Result\s*\n([\s\S]*?)\n### /)
if (match) {
  const report = JSON.parse(match[1])
  writeFileSync('output/playwright/results.json', JSON.stringify(report, null, 2))
  console.log(`Verified ${report.passed} browser checks; ${report.errors.length} runtime errors.`)
}
process.exit(result.status ?? 1)
