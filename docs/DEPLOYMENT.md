# Deployment & Production Operations — ApiCrafter

**Target:** Contract Mock Server & Chaos Latency Simulator  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))

---

## 1. Container Deployment (Docker)

```bash
docker build -t apicrafter:latest .
docker run -d -p 5050:5050 --name apicrafter apicrafter:latest
```

## 2. Process Manager (PM2)

```bash
npm install -g pm2
pm2 start dist/bin.js --name "apicrafter" -- studio --port 5050
```

## 3. Systemd Service Unit

```ini
[Unit]
Description=ApiCrafter Background Service
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/apicrafter
ExecStart=/usr/bin/node dist/bin.js studio --port 5050
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
