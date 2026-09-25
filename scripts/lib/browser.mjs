import { mkdtempSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const CHROME_PATH = process.env.CHROME_PATH
  ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

export const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export const launchChrome = async ({ webgl = false, forceFallback = false } = {}) => {
  const profileDirectory = mkdtempSync(join(tmpdir(), 'dup-global-coverage-'))
  const flags = [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDirectory}`,
  ]

  if (forceFallback) flags.push('--disable-webgl')
  else if (webgl) flags.push('--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-angle=swiftshader')
  else flags.push('--disable-gpu')
  flags.push('about:blank')

  const chrome = spawn(CHROME_PATH, flags, { stdio: ['ignore', 'ignore', 'pipe'] })
  const browserWebSocketUrl = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome did not expose a debugging endpoint.')), 10_000)
    let stderr = ''
    chrome.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/)
      if (match) {
        clearTimeout(timeout)
        resolve(match[1])
      }
    })
    chrome.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
  })

  return { chrome, browserWebSocketUrl, profileDirectory }
}

export const connectToPage = async (browserWebSocketUrl, baseUrl = 'about:blank') => {
  const endpoint = new URL(browserWebSocketUrl)
  const response = await fetch(
    `http://${endpoint.host}/json/new?${encodeURIComponent(baseUrl)}`,
    { method: 'PUT' },
  )
  if (!response.ok) throw new Error(`Could not create a Chrome audit tab (${response.status}).`)

  const target = await response.json()
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  let nextId = 0
  const pending = new Map()
  const eventWaiters = new Map()
  const eventListeners = new Map()
  const events = []

  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.id && pending.has(message.id)) {
      const pendingCall = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) pendingCall.reject(new Error(message.error.message))
      else pendingCall.resolve(message.result)
      return
    }

    events.push(message)
    for (const listener of eventListeners.get(message.method) ?? []) listener(message.params)
    const waiters = eventWaiters.get(message.method) ?? []
    eventWaiters.delete(message.method)
    for (const resolve of waiters) resolve(message.params)
  })

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })

  const waitForEvent = (method, timeoutMilliseconds = 10_000) => new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`Timed out waiting for ${method}.`)),
      timeoutMilliseconds,
    )
    const complete = (params) => {
      clearTimeout(timeout)
      resolve(params)
    }
    eventWaiters.set(method, [...(eventWaiters.get(method) ?? []), complete])
  })

  const on = (method, listener) => {
    eventListeners.set(method, [...(eventListeners.get(method) ?? []), listener])
  }

  return { socket, send, waitForEvent, on, events }
}

export const evaluate = async (client, expression) => {
  const result = await Promise.race([
    client.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    }),
    wait(5_000).then(() => {
      throw new Error('Timed out evaluating browser state.')
    }),
  ])
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? 'Browser evaluation failed.')
  }
  return result.result.value
}

export const waitForCondition = async (client, expression, description, timeoutMs = 10_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) return
    await wait(100)
  }
  throw new Error(`Timed out waiting for ${description}.`)
}

export const closeChrome = async ({ chrome, profileDirectory }) => {
  const exited = new Promise((resolve) => {
    if (chrome.exitCode !== null || chrome.signalCode !== null) resolve()
    else chrome.once('exit', resolve)
  })
  chrome.kill('SIGTERM')
  await Promise.race([exited, wait(3_000)])
  if (chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill('SIGKILL')
    await Promise.race([exited, wait(1_000)])
  }
  await rm(profileDirectory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
}
