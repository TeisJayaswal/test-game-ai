#!/bin/bash
# TypeScript type checking hook for Claude Code
# Runs after Edit/Write on TypeScript files

# Read input from stdin
INPUT=$(cat)

# Extract file path from tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // ""')

# Only run if it's a TypeScript file in src/
if [[ "$FILE_PATH" == *"src/"*".ts" ]]; then
    cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

    # Check if node_modules exists (project initialized)
    if [ -d "node_modules" ] && [ -f "tsconfig.json" ]; then
        # Run TypeScript check
        TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
        TSC_EXIT=$?

        if [ $TSC_EXIT -ne 0 ]; then
            # Get just the first few errors
            ERRORS=$(echo "$TSC_OUTPUT" | head -15)
            echo "{\"hookSpecificOutput\": {\"hookEventName\": \"PostToolUse\", \"additionalContext\": \"TypeScript errors found:\\n$ERRORS\"}}"
            exit 0
        fi
    fi
fi

# Success - no output needed
echo "{}"
exit 0
