#!/usr/bin/env bash
# Builds and restarts the Rapid Parcels demo on its server (parcels.rapidocui.com, mock.rapidocui.com).
# Runs on the server as the `deploy` user, from the checkout in /srv/rapidoc-demo, after that checkout was
# moved to the commit being deployed (see deploy/server/README.md). Not for a developer machine.
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "Deploying $(git log --oneline -1)"
# The published @rapidoc packages pinned in deploy/package-lock.json, as for GitHub Pages
npm ci --prefix deploy --no-audit --no-fund
deploy/node_modules/.bin/rapidoc build rapid-parcels

# The deploy user may restart these two services and nothing else (/etc/sudoers.d/rapidoc-demo)
sudo -n /usr/bin/systemctl restart rapidoc-mock.service
sudo -n /usr/bin/systemctl restart rapid-parcels.service

sleep 3
curl --fail --silent --show-error --output /dev/null http://127.0.0.1:4010/
curl --fail --silent --show-error --output /dev/null http://127.0.0.1:8090/
echo "Both services answer."
