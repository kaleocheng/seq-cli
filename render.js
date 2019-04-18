#!/usr/bin/env node

const puppeteer = require('puppeteer')
const Mustache = require('mustache')
const path = require('path')
const fs = require('fs')


const render = async (seq, option) => {
    let width = 800
    let height = 600
    let config = {}

    if (option) {
        if (option.width) {
            width = option.width
        }

        if (option.height) {
            height = option.height
        }
        if (option.puppeteerConfig) {
            config = option.puppeteerConfig
        }

    }
    const index = path.join(__dirname, 'index.html')
    const template = fs.readFileSync(path.join(__dirname, 'index.mustache'), 'utf8')
    let output = Mustache.render(template, {
        seq: seq.replace(/`/g, '\\`').replace(/\//g, '\\/')
    })
    fs.writeFileSync(index, output)
    const browser = await puppeteer.launch(config)
    const page = await browser.newPage()
    await page.setViewport({
        width: parseInt(width),
        height: parseInt(height),
        deviceScaleFactor: 2
    });
    await page.goto(`file://${index}`, {
        waitUntil: 'networkidle0'
    })
    await page.$eval('svg', (element) => {
        element.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        element.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    })
    const diagram = await page.$eval('#diagram', (element) => {
        return element.innerHTML
    })
    await browser.close()
    return diagram
}

module.exports = render
