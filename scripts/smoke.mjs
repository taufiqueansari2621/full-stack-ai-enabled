import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox'],
})

const page = await browser.newPage()
const errors = []
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', error => errors.push(error.message))

const clickText = async text => {
  const clicked = await page.evaluate(label => {
    const elements = [...document.querySelectorAll('button')]
    const target = elements.find(element => element.textContent?.trim().includes(label))
    if (!target) return false
    target.click()
    return true
  }, text)
  if (!clicked) throw new Error(`Button not found: ${text}`)
  await new Promise(resolve => setTimeout(resolve, 80))
}

const expectText = async text => {
  const found = await page.evaluate(label => document.body.textContent?.includes(label), text)
  if (!found) throw new Error(`Expected text not found: ${text}`)
}

try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' })
  await page.evaluate(() => localStorage.removeItem('forge-learning-state-v1'))
  await page.reload({ waitUntil: 'networkidle0' })
  await expectText('Welcome back, Taufique')

  await clickText('Practice')
  await expectText('Train the skill')
  await clickText('A → D → C → B')
  await clickText('Check answer')
  await expectText('Exactly right')
  const attemptsBeforeReload = await page.evaluate(() => JSON.parse(localStorage.getItem('forge-learning-state-v1')).practiceAttempts.length)
  if (attemptsBeforeReload !== 1) throw new Error('Practice attempt was not persisted')
  await page.reload({ waitUntil: 'networkidle0' })
  await clickText('Practice')
  await expectText('1 saved attempts')

  await clickText('Knowledge')
  await clickText('New note')
  const inputs = await page.$$('.modal input')
  await inputs[0].type('Smoke test note')
  await page.type('.modal textarea', 'This verifies that local knowledge entries persist after a browser refresh.')
  await clickText('Save')
  await expectText('Smoke test note')

  await clickText('Projects')
  await clickText('Continue P05')
  await expectText('PROJECT WORKSPACE')
  await clickText('Define search contract')
  await expectText('7/11 saved locally')
  await clickText('All projects')

  await clickText('Reviews')
  await expectText('Make knowledge')
  await page.click('.check-button')
  const completedReviews = await page.evaluate(() => JSON.parse(localStorage.getItem('forge-learning-state-v1')).completedReviews.length)
  if (completedReviews !== 1) throw new Error('Review completion was not persisted')

  await clickText('Interview')
  await clickText('Start')
  await page.type('.interview-question textarea', 'The call stack executes synchronous work. Promise callbacks enter the microtask queue while timer callbacks enter the task queue. For example, I used this model in a project to prevent stale search results. A trade-off is that long tasks block rendering and endless microtasks can cause starvation.')
  await clickText('Submit')
  await expectText('100%')

  await page.keyboard.down('Meta')
  await page.keyboard.press('KeyK')
  await page.keyboard.up('Meta')
  await expectText('QUICK NAVIGATION')
  await page.keyboard.press('Escape')

  await page.setViewport({ width: 375, height: 812 })
  await page.reload({ waitUntil: 'networkidle0' })
  await expectText('Welcome back, Taufique')
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (horizontalOverflow) {
    const offenders = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(element => {
      const rect = element.getBoundingClientRect()
      return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1
    }).slice(0, 8).map(element => `${element.tagName}.${element.className}: ${Math.round(element.getBoundingClientRect().left)}..${Math.round(element.getBoundingClientRect().right)}`))
    throw new Error(`Mobile layout has horizontal overflow: ${offenders.join(' | ')}`)
  }

  if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`)
  console.log('Smoke test passed: dashboard, practice persistence, knowledge, projects, reviews, interview, search, and mobile layout.')
} finally {
  await browser.close()
}
