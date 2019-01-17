const puppeteer = require('puppeteer')
const Mustache = require('mustache')
const path = require('path')
const fs = require('fs');

const main = (async () => {
    const index = path.join(__dirname, 'index.html')
    const seq = fs.readFileSync('test.seq', 'utf8')
    const template = fs.readFileSync('index.mustache', 'utf8')
    let output = Mustache.render(template, {
        seq: seq
    })
    fs.writeFileSync(index, output)
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({
        width: 2000,
        height: 2000,
        deviceScaleFactor: 2
    });
    await page.goto(`file://${index}`)
    const diagram = await page.$('svg')
    await diagram.screenshot({
        path: 'diagram.png'
    })
    await browser.close()
})

main()
