#!/bin/bash

# Script to stage and commit each file individually
# This helps create a clean git history with separate commits per file

echo "🚀 Starting individual file staging and committing..."
echo ""

# Get list of all changed and untracked files
files=$(git status --porcelain | awk '{print $2}')

if [ -z "$files" ]; then
    echo "✅ No changes to commit!"
    exit 0
fi

# Counter for commits
count=0

# Loop through each file
while IFS= read -r file; do
    if [ -z "$file" ]; then
        continue
    fi
    
    echo "📝 Processing: $file"
    
    # Stage the file
    git add "$file"
    
    # Generate commit message based on file type and name
    if [[ "$file" == *"package.json" ]]; then
        commit_msg="chore: update package.json for InfoGent project"
    elif [[ "$file" == *"README.md" ]]; then
        commit_msg="docs: update README for InfoGent"
    elif [[ "$file" == *"config.ts" ]]; then
        commit_msg="config: update configuration for InfoGent"
    elif [[ "$file" == *"infoAgent.ts" ]]; then
        commit_msg="feat: add InfoGent AI agent"
    elif [[ "$file" == *"index.ts" ]]; then
        commit_msg="refactor: update main server for InfoGent"
    elif [[ "$file" == *"transportation.ts" ]]; then
        commit_msg="feat: add transportation routes with real data"
    elif [[ "$file" == *".sh" ]]; then
        commit_msg="chore: add utility script"
    elif [[ "$file" == *"test"* ]]; then
        commit_msg="test: update $file"
    else
        # Generic commit message
        filename=$(basename "$file")
        commit_msg="update: $filename"
    fi
    
    # Commit the file
    git commit -m "$commit_msg"
    
    if [ $? -eq 0 ]; then
        echo "✅ Committed: $file"
        count=$((count + 1))
    else
        echo "❌ Failed to commit: $file"
    fi
    
    echo ""
done <<< "$files"

echo "🎉 Done! Total commits created: $count"
echo ""
echo "To push all commits to remote, run: git push"
