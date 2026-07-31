"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix: Add cleanObj BigInt sanitizer replacer for D1 objects passed to Server/Client Components"
"C:\Program Files\Git\cmd\git.exe" push
cmd.exe /c "npm run deploy"
