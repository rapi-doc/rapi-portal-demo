# The demo server

Rapid Parcels runs on a managed VPS sponsored by [Simafri](https://www.simafri.com/en/managed-vps/)
(Ubuntu 24.04, 2 vCPU, 4 GB): `parcels.rapidocui.com` is the portal with sign-in (`rapidoc serve`) and
`mock.rapidocui.com` the mock API that checks its access tokens (`rapidoc mock`). The other examples are
static and stay on GitHub Pages.

## What is on the server

| Path | What |
| :--- | :--- |
| `/srv/rapidoc-demo` | A checkout of this repository, owned by the `deploy` user |
| `/etc/rapidoc-demo/parcels.env` | The portal's settings: Auth0 client ID and secret, session key, public URL, port 8090. Readable by root and `deploy` only |
| `/etc/rapidoc-demo/mock.env` | The mock's issuer and audience (public values) |
| `/etc/systemd/system/rapid-parcels.service`, `rapidoc-mock.service` | The two services, on 127.0.0.1:8090 and 127.0.0.1:4010 |
| `/etc/caddy/Caddyfile`, `/etc/caddy/sites/` | Caddy: HTTPS and Let's Encrypt certificates, one file per domain (`.caddy` is live, `.off` is not) |
| `/usr/local/bin/rapidoc-demo-deploy` | What a deploy runs (below) |
| `/etc/sudoers.d/rapidoc-demo` | Lets `deploy` restart and inspect the two services, nothing else |

The firewall (ufw) allows SSH, 80 and 443; SSH takes keys only. Simafri's front end forwards port 23001
to the server's SSH and routes each domain added in the "Your domains" card of the client area; a new
domain also needs an A record to 46.105.38.83 and an AAAA record to 2001:41d0:203:e39c::1001.

## Deploys

`.github/workflows/deploy-server.yml` runs on a push to `main` that touches `rapid-parcels/` or `deploy/`.
It connects as `deploy` with the key in the repository secret `DEPLOY_SSH_KEY`. On the server that key is
tied to one command (`command=` in `~deploy/.ssh/authorized_keys`): `/usr/local/bin/rapidoc-demo-deploy`
moves the checkout to the pushed commit, which must be on `origin/main`, and runs `deploy/server/deploy.sh`
(install the pinned packages, build, restart both services, check that they answer). The key cannot open
a shell or run anything else. `known_hosts` here is the server's host key, which the workflow requires.

To deploy by hand: Actions → Deploy Rapid Parcels → Run workflow.

## By hand, as an administrator

```bash
ssh -p 23001 root@46.105.38.83
systemctl status rapid-parcels rapidoc-mock caddy
journalctl -u rapid-parcels -n 50
```

- **Change a secret**: edit `/etc/rapidoc-demo/parcels.env`, then `systemctl restart rapid-parcels`.
- **Add a domain**: DNS records and "Your domains" first, then a file in `/etc/caddy/sites/` and
  `systemctl reload caddy`.
- **Another Node.js version**: the NodeSource package `nodejs` (`/etc/apt/sources.list.d/nodesource.list`).
