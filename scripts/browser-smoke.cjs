// Run with the Playwright CLI's `run-code` command against a fresh local scene.
// This is a browser integration check, not part of the production application.
async (page) => {
  const out = 'output/playwright'
  const results = [], errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  const check = (name, ok, detail) => {
    results.push({ name, passed: Boolean(ok), detail })
    if (!ok) throw new Error(`${name}: ${JSON.stringify(detail)}`)
  }
  const camera = async () => (await page.locator('canvas').getAttribute('data-camera')).split(',').map(Number)
  const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.reload()
  await page.locator('canvas[data-camera]').waitFor()
  // Make reruns independent of the previous camera and setting-panel state.
  await page.keyboard.press('Escape')
  await page.keyboard.press('r')
  await page.getByRole('status').waitFor({ state: 'detached' })
  check('WebGL scene ready', await page.getByText('Interactive 3D scene ready.', { exact: false }).count() === 1, await camera())
  await page.screenshot({ path: `${out}/01-night-medium.png` })

  await page.getByRole('button', { name: 'Scene settings', exact: true }).click()
  for (const q of ['Low', 'High', 'Medium']) {
    await page.getByRole('button', { name: q, exact: true }).click()
    await page.waitForFunction(q => document.querySelector('main').dataset.quality === q, q.toLowerCase())
    await page.locator('canvas').screenshot({ path: `${out}/quality-${q.toLowerCase()}.png` })
    check(`Quality ${q}`, await page.locator('main').getAttribute('data-quality') === q.toLowerCase(), q)
  }
  await page.getByLabel('Time of day', { exact: true }).selectOption('dusk')
  check('Dusk lighting', await page.locator('main').getAttribute('data-time') === 'dusk', '18:40')
  await page.screenshot({ path: `${out}/02-dusk.png` })
  await page.getByLabel('Time of day', { exact: true }).selectOption('night')
  await page.getByLabel('Rain intensity', { exact: true }).press('Home')
  check('Rain zero', await page.locator('main').getAttribute('data-rain') === '0', '0%')
  await page.getByLabel('Rain intensity', { exact: true }).press('End')
  check('Rain maximum', await page.locator('main').getAttribute('data-rain') === '100', '100%')
  await page.getByLabel('Rain intensity', { exact: true }).press('ArrowLeft')
  check('Rain keyboard increment', await page.locator('main').getAttribute('data-rain') === '99', '99%')
  await page.getByRole('button', { name: 'Close settings', exact: true }).click()

  const start = await camera()
  await page.getByRole('button', { name: 'Cinematic C', exact: true }).click()
  await page.waitForFunction(before => {
    const p = document.querySelector('canvas').dataset.camera.split(',').map(Number)
    return Math.hypot(...p.map((v, i) => v - before[i])) > .3
  }, start)
  check('Cinematic motion', await page.locator('main').getAttribute('data-cinematic') === 'true', await camera())
  await page.keyboard.press('r')
  await page.waitForFunction(() => document.querySelector('main').dataset.cinematic === 'false')
  check('Reset exact camera', distance(await camera(), [16.8, 1.7, 24]) < .08, await camera())

  await page.mouse.move(800, 400)
  await page.mouse.down()
  await page.mouse.move(990, 450, { steps: 20 })
  await page.mouse.up()
  check('Mouse orbit', distance(await camera(), [16.8, 1.7, 24]) > .5, await camera())
  const beforeZoom = await camera()
  await page.mouse.wheel(0, -450)
  await page.waitForFunction(before => {
    const p = document.querySelector('canvas').dataset.camera.split(',').map(Number)
    return Math.hypot(...p.map((v, i) => v - before[i])) > .5
  }, beforeZoom)
  check('Wheel zoom', distance(beforeZoom, await camera()) > .5, await camera())
  await page.keyboard.press('r')
  await page.waitForTimeout(250)
  check('Reset clears orbit and zoom inertia', distance(await camera(), [16.8, 1.7, 24]) < .08, await camera())
  await page.mouse.click(800, 360)
  await page.keyboard.down('w')
  try {
    await page.waitForFunction(() => Number(document.querySelector('canvas').dataset.camera.split(',')[2]) < -.7, null, { timeout: 25000 })
    await page.waitForTimeout(900)
  } finally { await page.keyboard.up('w') }
  const stopped = await camera()
  check('WASD moves and stops at storefront', stopped[2] >= -1.01 && stopped[2] < 0 && stopped[1] >= 1.35, stopped)
  await page.locator('canvas').screenshot({ path: `${out}/03-close-storefront.png` })
  await page.keyboard.press('r')
  await page.keyboard.press('h')
  check('Photography mode hides UI', await page.locator('main').evaluate(el => el.classList.contains('photo-mode')), 'H')
  await page.screenshot({ path: `${out}/04-photography-mode.png` })
  await page.keyboard.press('Escape')
  check('Escape restores UI', !await page.locator('main').evaluate(el => el.classList.contains('photo-mode')), 'Escape')

  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Save screenshot', exact: true }).click()
  const download = await downloadEvent
  await download.saveAs(`${out}/05-exported-photograph.png`)
  check('PNG download', download.suggestedFilename().endsWith('.png'), download.suggestedFilename())

  await page.getByRole('button', { name: 'Enable rain sound', exact: true }).click()
  await page.getByRole('button', { name: 'Mute rain sound', exact: true }).waitFor({ state: 'visible' })
  check('Sound opt-in', await page.getByRole('button', { name: 'Mute rain sound', exact: true }).isVisible(), 'Enabled by click')
  await page.getByRole('button', { name: 'Mute rain sound', exact: true }).click()
  await page.getByRole('button', { name: 'Enable rain sound', exact: true }).waitFor({ state: 'visible' })
  check('Sound mute', await page.getByRole('button', { name: 'Enable rain sound', exact: true }).isVisible(), 'Muted')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: `${out}/06-mobile.png` })
  await page.getByRole('button', { name: 'Scene settings', exact: true }).click()
  check('Mobile settings fit viewport', await page.locator('.settings-panel').evaluate(el => {
    const b = el.getBoundingClientRect()
    return b.left >= 0 && b.right <= innerWidth && b.bottom <= innerHeight
  }), '390 × 844')
  await page.screenshot({ path: `${out}/07-mobile-settings.png` })
  await page.getByRole('button', { name: 'Close settings', exact: true }).click()
  await page.setViewportSize({ width: 1440, height: 900 })
  check('No runtime or shader errors', errors.length === 0, errors)
  return { browser: 'Google Chrome', viewport: '1440x900; mobile 390x844', passed: results.length, errors, output: out, results }
}
