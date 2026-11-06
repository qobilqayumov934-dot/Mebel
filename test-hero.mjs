import { spawn } from 'child_process'
import fs from 'fs'

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--window-size=1280,900',
  'http://localhost:5173'
])

async function run() {
  await new Promise(r => setTimeout(r, 2000))
  const versionRes = await fetch('http://127.0.0.1:9226/json')
  const pages = await versionRes.json()
  const page = pages.find(p => p.type === 'page' && p.url.includes('localhost:5173'))

  const ws = new WebSocket(page.webSocketDebuggerUrl)
  let id = 1
  function send(method, params = {}) {
    return new Promise(resolve => {
      const msgId = id++
      const handler = (evt) => {
        const data = JSON.parse(evt.data)
        if (data.id === msgId) {
          ws.removeEventListener('message', handler)
          resolve(data.result)
        }
      }
      ws.addEventListener('message', handler)
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  }

  await new Promise(r => ws.onopen = r)
  await send('Runtime.enable')

  console.log('Checking hero banner image...')
  let res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const heroImg = document.querySelector('.hero-card img')
        const customImg = document.querySelector('.custom-banner-img img')
        return {
          heroImgSrc: heroImg?.src,
          heroComplete: heroImg?.complete,
          heroWidth: heroImg?.naturalWidth,
          customImgSrc: customImg?.src,
          customComplete: customImg?.complete
        }
      })()
    `,
    returnByValue: true
  })
  console.log('Banner info:', res.result.value)

  // Test clicking swatch
  console.log('Testing clicking second color swatch...')
  await send('Runtime.evaluate', {
    expression: `document.querySelectorAll('.swatches button')[1].click()`
  })
  await new Promise(r => setTimeout(r, 400))
  res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const heroImg = document.querySelector('.hero-card img')
        const cap = document.querySelector('.stage-cap')?.textContent
        return { src: heroImg?.src, cap }
      })()
    `,
    returnByValue: true
  })
  console.log('After swatch click:', res.result.value)

  // Take screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('hero-screenshot.png', Buffer.from(screenshot.data, 'base64'))
  console.log('Saved hero-screenshot.png')

  ws.close()
  chrome.kill()
}

run().catch(err => {
  console.error(err)
  chrome.kill()
})
