#!/usr/bin/env node

const commander = require('commander')
const path = require('path')
const fs = require('fs')
const pkg = require('./package.json')
const render = require('./render')


function exit(info) {
    console.log(info)
    process.exit(0)
}

commander
    .version(pkg.version)
    .option('-W, --width [width]', 'Width of the page. Optional.', /^\d+$/, '800')
    .option('-H, --height [height]', 'Height of the page. Optional.', /^\d+$/, '600')
    .option('-p, --puppeteer-config [puppeteer-config]', 'Customer Config of Puppeteer')
    .action(cmd => {
        if (cmd.puppeteerConfig) {
            if (!fs.existsSync(cmd.puppeteerConfig)) {
                exit(`Puppeteer config file ${cmd.puppeteerConfig} doesn't exist`)
            }
        }
    })
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
    let r = await render(fs.readFileSync(commander.input, 'utf8'), commander.width, commander.height, commander.puppeteerConfig)
    fs.writeFileSync(commander.output, r)
})()
