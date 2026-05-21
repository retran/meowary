import type { Plugin } from "@opencode-ai/plugin"

const BLOCKED_BASH = [
  /(^|\s)rm\s+-rf(\s|$)/i,
  /(^|\s)sudo(\s|$)/i,
  /git\s+reset\s+--hard/i,
  /git\s+clean\s+-fd/i,
  /drop\s+table/i,
  /delete\s+from\s+\w+\s*;?\s*$/i,
  /truncate\s+table/i
]

const ENV_PATH = /(^|\/)\.env(\.|$)/i
const ENV_EXAMPLE = /(^|\/)\.env\.example$/i

function pickToolName(input: any): string {
  return String(
    input?.tool?.name ??
      input?.toolName ??
      input?.name ??
      ""
  ).toLowerCase()
}

function pickArgs(input: any): Record<string, unknown> {
  return (input?.args ?? input?.input ?? {}) as Record<string, unknown>
}

function pickCommand(args: Record<string, unknown>): string {
  if (typeof args.command === "string") return args.command
  if (typeof args.cmd === "string") return args.cmd
  if (Array.isArray(args.argv)) return args.argv.map(String).join(" ")
  return ""
}

function pickPath(args: Record<string, unknown>): string {
  const keys = [
    "filePath",
    "path",
    "target",
    "file",
    "file_path",
    "oldPath",
    "newPath"
  ]
  for (const key of keys) {
    const value = args[key]
    if (typeof value === "string" && value.length > 0) return value
  }
  return ""
}

function isEnvFile(path: string): boolean {
  return ENV_PATH.test(path) && !ENV_EXAMPLE.test(path)
}

export default (async () => {
  return {
    "tool.execute.before": async (input: any) => {
      const tool = pickToolName(input)
      const args = pickArgs(input)

      if (tool === "bash") {
        const command = pickCommand(args)
        for (const pattern of BLOCKED_BASH) {
          if (pattern.test(command)) {
            throw new Error(`safety-guard blocked bash command: ${command}`)
          }
        }
      }

      if (["read", "edit", "write", "patch", "multiedit"].includes(tool)) {
        const filePath = pickPath(args)
        if (filePath && isEnvFile(filePath)) {
          throw new Error(`safety-guard blocked .env access: ${filePath}`)
        }
      }
    }
  }
}) satisfies Plugin
