#!/usr/bin/env python3
"""
mr_discussions.py — GitLab MR discussion helper

Fetch, reply to, and resolve MR discussion threads via the GitLab API.
Reads GITLAB_TOKEN and GITLAB_HOST from environment (or .env file).

Usage:
    python3 mr_discussions.py list <mr-id>
    python3 mr_discussions.py reply <mr-id> <discussion-id> "<message>"
    python3 mr_discussions.py resolve <mr-id> <discussion-id>

Environment variables (or .env in cwd/parents):
    GITLAB_TOKEN   — personal access token with api scope
    GITLAB_HOST    — GitLab host, e.g. gitlab.example.com (no https://)
    GITLAB_PROJECT — project path, e.g. mygroup/myrepo
                     (optional if run inside a git repo with a GitLab remote)
"""

import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------


def load_env_file() -> dict[str, str]:
    """Walk up from cwd to find a .env file and parse it."""
    path = Path.cwd()
    for candidate in [path, *path.parents]:
        env_file = candidate / ".env"
        if env_file.exists():
            result = {}
            for line in env_file.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                result[key.strip()] = value.strip().strip('"').strip("'")
            return result
    return {}


def get_config() -> tuple[str, str, str]:
    """Return (token, host, project). Raises on missing required values."""
    env = {**load_env_file(), **os.environ}

    token = env.get("GITLAB_TOKEN", "")
    host = env.get("GITLAB_HOST", "gitlab.com").rstrip("/")
    project = env.get("GITLAB_PROJECT", "")

    if not token:
        sys.exit("Error: GITLAB_TOKEN not set. Add it to .env or export it.")
    if not project:
        project = _detect_project_from_git(host)
    if not project:
        sys.exit(
            "Error: GITLAB_PROJECT not set and could not detect from git remote.\n"
            "Set GITLAB_PROJECT=group/repo in .env or the environment."
        )

    return token, host, project


def _detect_project_from_git(host: str) -> str:
    """Try to derive project path from the git remote URL."""
    try:
        import subprocess

        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        url = result.stdout.strip()
        # ssh: git@gitlab.example.com:group/repo.git
        # https: https://gitlab.example.com/group/repo.git
        if host in url:
            path = url.split(host)[-1].lstrip(":").lstrip("/")
            return path.removesuffix(".git")
    except Exception:
        pass
    return ""


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------


def api_request(
    token: str,
    host: str,
    path: str,
    method: str = "GET",
    body: dict | None = None,
) -> dict | list:
    """Make a GitLab API request. Returns parsed JSON."""
    url = f"https://{host}/api/v4{path}"
    data = json.dumps(body).encode() if body else None
    headers = {
        "PRIVATE-TOKEN": token,
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body_text = e.read().decode(errors="replace")
        sys.exit(f"API error {e.code} {e.reason} — {url}\n{body_text}")


def encode_project(project: str) -> str:
    return project.replace("/", "%2F")


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------


def cmd_list(token: str, host: str, project: str, mr_id: str) -> None:
    """List unresolved discussion threads for an MR."""
    ep = encode_project(project)
    discussions = api_request(
        token, host, f"/projects/{ep}/merge_requests/{mr_id}/discussions"
    )

    unresolved = []
    for d in discussions:
        notes = d.get("notes", [])
        if not notes:
            continue
        # A thread is unresolved if any note is not resolved
        # (system notes have no 'resolvable' field)
        resolvable = [n for n in notes if n.get("resolvable")]
        if resolvable and all(n.get("resolved") for n in resolvable):
            continue  # fully resolved
        unresolved.append((d["id"], notes))

    if not unresolved:
        print("No unresolved discussion threads.")
        return

    print(f"Unresolved threads ({len(unresolved)}):\n")
    for i, (disc_id, notes) in enumerate(unresolved, 1):
        first = notes[0]
        author = first.get("author", {}).get("username", "?")
        body = first.get("body", "").strip().replace("\n", " ")
        pos = first.get("position", {})
        location = ""
        if pos:
            new_path = pos.get("new_path") or pos.get("old_path", "")
            new_line = pos.get("new_line") or pos.get("old_line", "")
            if new_path:
                location = f"{new_path}:{new_line} — "
        print(f"[{i}] {location}@{author}: {body[:120]}")
        print(f"     discussion_id: {disc_id}")
        if len(notes) > 1:
            print(f"     ({len(notes) - 1} follow-up note(s))")
        print()


def cmd_reply(
    token: str, host: str, project: str, mr_id: str, disc_id: str, message: str
) -> None:
    """Reply to a discussion thread."""
    if not message.strip():
        sys.exit("Error: reply message cannot be empty.")
    ep = encode_project(project)
    result = api_request(
        token,
        host,
        f"/projects/{ep}/merge_requests/{mr_id}/discussions/{disc_id}/notes",
        method="POST",
        body={"body": message},
    )
    print(f"Replied (note id: {result.get('id')})")


def cmd_resolve(token: str, host: str, project: str, mr_id: str, disc_id: str) -> None:
    """Mark a discussion thread as resolved."""
    ep = encode_project(project)
    api_request(
        token,
        host,
        f"/projects/{ep}/merge_requests/{mr_id}/discussions/{disc_id}",
        method="PUT",
        body={"resolved": True},
    )
    print(f"Thread {disc_id} resolved.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

USAGE = """Usage:
    python3 mr_discussions.py list <mr-id>
    python3 mr_discussions.py reply <mr-id> <discussion-id> "<message>"
    python3 mr_discussions.py resolve <mr-id> <discussion-id>
"""


def main() -> None:
    args = sys.argv[1:]
    if not args:
        sys.exit(USAGE)

    token, host, project = get_config()
    command = args[0]

    if command == "list":
        if len(args) < 2:
            sys.exit("Usage: mr_discussions.py list <mr-id>")
        cmd_list(token, host, project, args[1])

    elif command == "reply":
        if len(args) < 4:
            sys.exit(
                'Usage: mr_discussions.py reply <mr-id> <discussion-id> "<message>"'
            )
        cmd_reply(token, host, project, args[1], args[2], args[3])

    elif command == "resolve":
        if len(args) < 3:
            sys.exit("Usage: mr_discussions.py resolve <mr-id> <discussion-id>")
        cmd_resolve(token, host, project, args[1], args[2])

    else:
        sys.exit(f"Unknown command: {command}\n{USAGE}")


if __name__ == "__main__":
    main()
