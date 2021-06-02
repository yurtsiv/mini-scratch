const puppeteer = require('puppeteer')
const iPhone = puppeteer.devices['iPhone 6']

const wait = (time) =>
  new Promise((res) => {
    setTimeout(() => {
      res()
    }, time)
  })

const spritesLibBtn = (page) => page.$('[data-testid="sprites-lib-button"]')
const scriptEditorBtn = (page) => page.$('[data-testid="script-editor-button"')

describe('Mini Scratch', () => {
  /** @type {puppeteer.Page} */
  let page
  /** @type {puppeteer.Browser} */
  let browser
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false })
    page = await browser.newPage()
    await page.emulate(iPhone)
    await page.goto('http://localhost:3000')
  })

  afterAll(() => {
    browser.close()
  })

  it('should be titled "Mini Scratch"', async () => {
    await expect(page.title()).resolves.toMatch('Mini Scratch')
  })

  it('should change navigation buttons', async (done) => {
    await wait(200)
    await (await spritesLibBtn(page)).tap()

    expect(await scriptEditorBtn(page)).toBeDefined()

    await wait(200)
    await (await scriptEditorBtn(page)).tap()

    expect(await spritesLibBtn(page)).toBeDefined()

    done()
  })

  it('should rener sprites in library', async (done) => {
    await wait(500)

    await (await spritesLibBtn(page)).tap()

    const sprites = await page.$$('[data-testid="sprite-item"]')

    expect(sprites.length > 10).toBe(true)

    done()
  })

  it('should add sprites to the project', async (done) => {
    await wait(500)

    const sprites = await page.$$('[data-testid="sprite-item"]')

    sprites[0].tap()

    await wait(500)

    const project = JSON.parse(await page.evaluate(() => window.vm.toJSON()))

    expect(project.targets.length).toBe(3)

    done()
  })
})
