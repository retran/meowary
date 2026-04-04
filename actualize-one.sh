#!/usr/bin/env bash
# actualize-one.sh
#
# Thin wrapper: runs the next pending resources operation from the progress file.
# Delegates to actualize-all.sh --once, which handles all progress tracking.
#
# Usage:
#   ./actualize-one.sh                       # next pending operation
#   ./actualize-one.sh --subfolder maia      # next pending in resources/maia/

exec "$(cd "$(dirname "$0")" && pwd)/actualize-all.sh" --once "$@"
