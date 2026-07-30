"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix: remove globalThis cache so D1 binding resolves per-request"
"C:\Program Files\Git\cmd\git.exe" push
npm run deploy
