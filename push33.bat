"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix: Remove non-existent D1 columns and add graceful fallback UI instead of notFound() digest exception"
"C:\Program Files\Git\cmd\git.exe" push
npm run deploy
