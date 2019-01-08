const puppeteer = require('puppeteer')
const Mustache = require('mustache')
const fs = require('fs');

const main = (async () => {
    const seq = fs.readFileSync('test.seq', 'utf8')
    const template = fs.readFileSync('tmpl.mustache', 'utf8')
    let output = Mustache.render(template, {
        seq: seq
    })
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({
        width: 800,
        height: 800,
        deviceScaleFactor: 2
    });
    //await page.goto('file:///Users/kaleocheng/Dropbox/Archives/2018/vim-sequence-diagram/plugin/tmpl.html')
    await page.setContent(output)
    const diagram = await page.$('svg')
    await diagram.screenshot({
        path: 'diagram.png',
    })
    await browser.close()
})

main()
