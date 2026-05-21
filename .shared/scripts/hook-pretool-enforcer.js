#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"

const BLOCKED_BASH = [
  /(^|\s)rm\s+-rf(\s|$)/i,
  /(^|\s)sudo(\s|$)/i,
  /git\s+reset\s+--hard/i,
  /git\s+clean\s+-fd/i,
  /drop\s+table/i,
  /truncate\s+table/i
]

const ENV_PATH = /(^|\/)\.env(\.|$)/i
const ENV_EXAMPLE = /(^|\/)\.env\.example$/i

function readStdin() {
  return new Promise((resolvePromise) => {
    let data = ""
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", (chunk) => {
      data += chunk
    })
    process.stdin.on("end", () => resolvePromise(data))
    process.stdin.on("error", () => resolvePromise(""))
  })
}

function parsePayload(text) {
  if (!text.trim()) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function pickTool(payload) {
  return String(
    payload.tool_name ?? payload.toolName ?? payload.tool?.name ?? ""
  )
}

function pickInput(payload) {
  return payload.tool_input ?? payload.input ?? {}
}

function pickCommand(toolInput) {
  if (typeof toolInput.command === "string") return toolInput.command
  if (typeof toolInput.cmd === "string") return toolInput.cmd
  if (Array.isArray(toolInput.argv)) return toolInput.argv.map(String).join(" ")
  return ""
}

function pickPath(toolInput) {
  const keys = [
    "file_path",
    "filePath",
    "path",
    "target_file",
    "old_path",
    "new_path"
  ]
  for (const key of keys) {
    const value = toolInput[key]
    if (typeof value === "string" && value.length > 0) return value
  }
  return ""
}

function isEnvFile(filePath) {
  return ENV_PATH.test(filePath) && !ENV_EXAMPLE.test(filePath)
}

function ensureParent(filePath) {
  mkdirSync(dirname(filePath), { recursive: true })
}

function loadState(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"))
  } catch {
    return { repos: {} }
  }
}

function saveState(filePath, state) {
  ensureParent(filePath)
  writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8")
}

function resolvePath(pathValue) {
  if (!pathValue) return ""
  if (isAbsolute(pathValue)) return pathValue
  return resolve(process.cwd(), pathValue)
}

function findRepoRoot(filePath) {
  let current = filePath
  while (current && current !== dirname(current)) {
    if (existsSync(join(current, ".git"))) return current
    current = dirname(current)
  }
  return ""
}

function block(message) {
  process.stderr.write(`${message}\n`)
  process.exit(2)
}

const stateFile = resolve(process.cwd(), ".claude/runtime/hook-state.json")

const payload = parsePayload(await readStdin())
const tool = pickTool(payload)
const toolInput = pickInput(payload)
const state = loadState(stateFile)

if (tool === "Bash") {
  const command = pickCommand(toolInput)
  for (const pattern of BLOCKED_BASH) {
    if (pattern.test(command)) {
      block(`hook-pretool-enforcer blocked bash command: ${command}`)
    }
  }
}

if (["Read", "Edit", "Write", "MultiEdit"].includes(tool)) {
  const rawPath = pickPath(toolInput)
  const absolutePath = resolvePath(rawPath)

  if (rawPath && isEnvFile(rawPath)) {
    block(`hook-pretool-enforcer blocked .env access: ${rawPath}`)
  }

  if (absolutePath) {
    const repoRoot = findRepoRoot(dirname(absolutePath))
    if (repoRoot) {
      state.repos ??= {}
      state.repos[repoRoot] ??= {
        agentsLoaded: false,
        claudeLoaded: false,
        lastLoadedAt: ""
      }

      const repoState = state.repos[repoRoot]
      if (absolutePath.endsWith("/AGENTS.md")) {
        repoState.agentsLoaded = true
        repoState.lastLoadedAt = new Date().toISOString()
      }
      if (absolutePath.endsWith("/CLAUDE.md")) {
        repoState.claudeLoaded = true
        repoState.lastLoadedAt = new Date().toISOString()
      }

      const repoHasAgents = existsSync(join(repoRoot, "AGENTS.md"))
      const writes = ["Edit", "Write", "MultiEdit"]
      if (writes.includes(tool) && repoHasAgents && !repoState.agentsLoaded) {
        block(
          `hook-pretool-enforcer blocked ${tool}: load repo AGENTS.md first (${join(
            repoRoot,
            "AGENTS.md"
          )})`
        )
      }
    }
  }
}

saveState(stateFile, state)
process.exit(0)
