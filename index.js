#!/usr/bin/env node

const puppeteer = require('puppeteer')
const Mustache = require('mustache')
const commander = require('commander')
const path = require('path')
const fs = require('fs')
const pkg = require('./package.json')


function exit(info) {
    console.log(info)
    process.exit(0)
}

commander
    .version(pkg.version)
    .option('-W, --width [width]', 'Width of the page. Optional.', /^\d+$/, '800')
    .option('-H, --height [height]', 'Height of the page. Optional.', /^\d+$/, '600')
    .option('-e, --external [externalPath]', 'Use external chromium path')
    .option('-i, --input <input>', 'Input seq file. Required.')
    .action(cmd => {
        if (!cmd.input) {
            exit('Need a input file')
        }
        if (!fs.existsSync(cmd.input)) {
            exit(`Input file ${cmd.input} doesn't exist`)
        }
    })
    .option('-o, --output [output]', 'Output file. It should be svg')
    .action(cmd => {
        if (!cmd.output) {
            cmd.output = path.join(path.parse(cmd.input).dir, `${path.parse(cmd.input).name}.svg`)
        }
        const outputDir = path.dirname(cmd.output)
        if (!fs.existsSync(outputDir)) {
            error(`Output directory "${outputDir}/" doesn't exist`)
        }
    })
    .parse(process.argv);



(async () => {
    const index = path.join(__dirname, 'index.html')
    const seq = fs.readFileSync(commander.input, 'utf8')
    const template = fs.readFileSync(path.join(__dirname, 'index.mustache'), 'utf8')
    let output = Mustache.render(template, {
        seq: seq
    })
    fs.writeFileSync(index, output)
    const config = {}
    if (commander.external) {
        config.executablePath = commander.external
    }
    const browser = await puppeteer.launch(config)
    const page = await browser.newPage()
    await page.setViewport({
        width: parseInt(commander.width),
        height: parseInt(commander.height),
        deviceScaleFactor: 2
    });
    await page.goto(`file://${index}`)
    await page.$eval('svg', (element) => {
        element.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        element.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    })
    const diagram = await page.$eval('#diagram', (element) => {
        return element.innerHTML
    })

    fs.writeFileSync(commander.output, diagram)
    await browser.close()
})()
