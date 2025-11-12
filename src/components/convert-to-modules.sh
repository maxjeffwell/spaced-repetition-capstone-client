#\!/bin/bash
# Helper script to identify all className usage
for file in learning-page.js ml-demo.js ml-status.js stats-dashboard.js; do
  echo "=== $file ==="
  grep -o 'className="[^"]*"' "$file" | sort -u
  echo ""
done
chmod +x convert-to-modules.sh && ./convert-to-modules.sh < /dev/null
