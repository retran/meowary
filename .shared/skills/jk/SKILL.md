---
name: jk
description: Jenkins CLI — query jobs, trigger builds, view logs, download artifacts, manage credentials and nodes. Load when working with Jenkins CI, checking build status, or troubleshooting pipelines.
updated: 2026-05-13
related: [codebases]
---

<role>Jenkins CI CLI authority. Read-only by default; writes (job create, configure, credential create, run start) require explicit approval.</role>

<summary>
> Use `--json` for structured output, `--jq` for filtering. NEVER write (create jobs, start runs, modify config, manage credentials) without explicit user approval. Based on jk v0.0.33.
</summary>

<agent_flags>
- `--json` — JSON output for structured parsing
- `--yaml` — YAML output
- `--jq <expr>` — filter JSON with jq expression
- `-t, --template <tmpl>` — format with Go template
- `-q, --quiet` — suppress non-essential output
- `-c, --context <name>` — use specific Jenkins context
</agent_flags>

<write_policy>
**NEVER create jobs, start runs, modify config, manage credentials, or cordon nodes without explicit user approval.**

Default: read-only. Before any write: ask "Should I execute this on Jenkins?" Proceed only on explicit yes.

### Safety rules
- NEVER start runs without confirming job path and parameters.
- NEVER modify config.xml without showing current config first.
- NEVER create or delete credentials without confirming scope and ID.
- NEVER cordon/uncordon nodes without confirming node name.
- ALWAYS show the full command before executing writes.
</write_policy>

<dependency_check>
Before executing any `jk` command, verify the CLI is installed:

```bash
jk --version
```

Minimum version: `0.0.29` for `jk job create`, `jk job config`, `jk job configure`, `jk job scan`.

Skip silently if `jk` is not installed or not configured.
</dependency_check>

<steps>

<step n="1" name="auth_and_context" condition="first use or context switch">

```bash
# Check current auth status
jk auth status

# List available contexts (* = active)
jk context ls

# Switch context
jk context use prod-jenkins
```

Environment: `JK_CONTEXT` overrides active context.

```bash
# Login (requires Jenkins URL + API token)
jk auth login https://jenkins.example.com --username alice --token <API_TOKEN>

# Login with custom context name
jk auth login https://jenkins.example.com --name prod --username alice --token <TOKEN>
```
</step>

<step n="2" name="search_and_browse" condition="finding jobs">

```bash
# Search jobs by glob pattern
jk search --job-glob '*deploy*' --limit 10

# List all jobs
jk job ls

# List jobs in a folder
jk job ls team/platform

# View job details
jk job view team/app
```
</step>

<step n="3" name="runs_and_logs" condition="checking build status or logs">

```bash
# List recent runs
jk run ls team/app

# View specific run
jk run view team/app 128

# Stream logs (live)
jk log team/app 128 --follow

# Start run and follow logs
jk run start team/app --follow

# Start with parameters (WRITE — requires approval)
jk run start team/app -p KEY=value

# Start and wait for completion
jk run start team/app --wait --timeout 10m
```
</step>

<step n="4" name="artifacts_and_tests" condition="downloading build outputs">

```bash
# Download artifacts from a run
jk artifact download team/app 128

# Download to specific directory
jk artifact download team/app 128 -o ./artifacts

# View test report
jk test report team/app 128
```
</step>

<step n="5" name="job_config" condition="inspecting or modifying job configuration" gate="HARD-GATE for writes">

```bash
# Fetch config.xml (read-only)
jk job config platform/services/auth-relay

# Patch Jenkinsfile path (WRITE — requires approval)
jk job configure platform/services/auth-relay --script-path services/auth-relay/Jenkinsfile

# Replace config.xml from file (WRITE — requires approval)
jk job configure platform/services/auth-relay --file auth-relay.config.xml

# Rescan multibranch job (WRITE — requires approval)
jk job scan platform/services/auth-relay
```
</step>

<step n="6" name="job_create" condition="creating new jobs" gate="HARD-GATE">

```bash
# Create multibranch pipeline (WRITE — requires approval)
jk job create auth-relay \
  --folder platform/services \
  --repo-owner org \
  --repository repo-name \
  --script-path services/auth-relay/Jenkinsfile \
  --credentials bitbucket-ro \
  --branch-strategy all
```
</step>

<step n="7" name="infrastructure" condition="checking nodes, queue, credentials, plugins">

```bash
# List nodes
jk node ls

# View queue
jk queue ls

# List credentials (system scope)
jk cred ls

# List plugins
jk plugin ls
```
</step>

</steps>

<quick_reference>

| Task | Command |
|------|---------|
| Search jobs | `jk search --job-glob '*deploy*'` |
| List jobs | `jk job ls` |
| View job | `jk job view team/app` |
| List runs | `jk run ls team/app` |
| View run | `jk run view team/app 128` |
| Follow logs | `jk log team/app 128 --follow` |
| Start run | `jk run start team/app -p KEY=value` |
| Download artifacts | `jk artifact download team/app 128` |
| Test report | `jk test report team/app 128` |
| Fetch config | `jk job config team/app` |
| List credentials | `jk cred ls` |
| List nodes | `jk node ls` |
| View queue | `jk queue ls` |

</quick_reference>

<rules>
- Read-only by default. Ask before any write.
- ALWAYS `--json` when parsing output programmatically.
- Use `--jq` to extract specific fields from JSON output.
- Use job full path (folder/name) in references — not search URLs.
- Search before creating new jobs.
- Log build numbers and outcomes in daily notes when monitoring CI.
</rules>

<self_review>
- [ ] No writes without explicit user approval?
- [ ] Job paths use full folder/name format?
- [ ] Correct Jenkins context active for target controller?
- [ ] No credentials or tokens in command output shared with user?
</self_review>

<output_rules>Output in English. Preserve verbatim CLI commands, job paths, and build numbers.</output_rules>
