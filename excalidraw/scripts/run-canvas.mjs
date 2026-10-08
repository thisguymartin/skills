#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const port = Number(process.env.PORT)
const owner = Number(process.env.OWNER_PID)
const save = process.env.SAVE
const repo = process.env.EXCALIDRAW_REPO ?? join(homedir(), 'mcp/excalidraw')
if (!Number.isInteger(port) || port < 1024 || port > 65535 || !Number.isInteger(owner) || owner <= 1 || !save) {
  throw new Error('PORT, OWNER_PID and SAVE must identify the session canvas')
}
const entry = join(repo, 'dist/server.js')
if (!existsSync(entry)) throw new Error(`Canvas server missing at ${entry}; build the Excalidraw checkout first`)
const url = `http://127.0.0.1:${port}`
const request = async (path, init) => {
  const res = await fetch(url + path, { signal: AbortSignal.timeout(2000), ...init })
  if (!res.ok) throw new Error(`Canvas ${path} failed (${res.status})`)
  const body = await res.json()
  if (body.success === false) throw new Error(`Canvas ${path} was refused`)
  return body
}
const child = spawn(process.execPath, [entry], {
  cwd: repo, stdio: 'inherit', env: { ...process.env, HOST: process.env.HOST ?? '0.0.0.0', PORT: String(port) },
})
let stopping = false
let ready = false
let tick
let pendingSave = Promise.resolve()
const saveScene = () => {
  pendingSave = pendingSave.then(async () => {
    const body = await request('/api/elements')
    if (!Array.isArray(body.elements)) throw new Error('Canvas returned no element list')
    const tmp = `${save}.${process.pid}.tmp`
    writeFileSync(tmp, JSON.stringify({ type: 'excalidraw', version: 2, source: 'local-session', elements: body.elements, appState: {}, files: {} }), { mode: 0o600 })
    renameSync(tmp, save)
  }).catch(error => console.error(`Scene save failed: ${error.message}`))
  return pendingSave
}
const stop = async (code = 0) => {
  if (stopping) return
  stopping = true
  clearInterval(tick)
  if (ready && child.exitCode === null) await saveScene()
  child.kill('SIGTERM')
  const force = setTimeout(() => child.kill('SIGKILL'), 2500)
  force.unref()
  process.exitCode = code
}
process.on('SIGTERM', () => void stop())
process.on('SIGINT', () => void stop())
child.on('error', error => { console.error(error.message); void stop(1) })
child.on('exit', code => {
  clearInterval(tick)
  if (!stopping) { stopping = true; process.exitCode = code || 1 }
})

try {
  let health
  for (let i = 0; i < 50 && !stopping; i++) {
    health = await request('/health').catch(() => null)
    if (health?.service === 'mcp-excalidraw-canvas') break
    await sleep(200)
  }
  if (stopping || health?.service !== 'mcp-excalidraw-canvas') throw new Error('Canvas did not become healthy')
  if (health.pid !== child.pid) throw new Error('Canvas does not identify as the process just started; refusing to restore over another canvas')
  if (existsSync(save)) {
    const scene = JSON.parse(readFileSync(save, 'utf8'))
    if (!Array.isArray(scene.elements)) throw new Error('Saved scene has no element list')
    await request('/api/elements/batch', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ elements: scene.elements, replace: true }),
    })
  }
  ready = true
  if (process.env.READY) writeFileSync(process.env.READY, JSON.stringify({ pid: process.pid, serverPid: child.pid, port }), { mode: 0o600 })
  let seconds = 0
  tick = setInterval(() => {
    try { process.kill(owner, 0) } catch (error) {
      if (error.code === 'ESRCH') { void stop(); return }
      console.error(`Owner check failed: ${error.message}`)
    }
    if (++seconds % 15 === 0) void saveScene()
  }, 1000)
} catch (error) {
  console.error(error.message)
  await stop(1)
}
