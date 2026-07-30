REM Remove runtime = 'edge' from all pages since OpenNext handles it automatically
REM Also remove the appended lines from all page files

for %%f in (
  "src\app\layout.tsx"
  "src\app\login\page.tsx"
  "src\app\(dashboard)\layout.tsx"
  "src\app\(dashboard)\page.tsx"
  "src\app\(dashboard)\reports\page.tsx"
  "src\app\(dashboard)\reports\new\page.tsx"
  "src\app\(dashboard)\reports\[id]\page.tsx"
  "src\app\(dashboard)\reports\[id]\preview\page.tsx"
  "src\app\(dashboard)\settings\page.tsx"
  "src\app\api\auth\[...nextauth]\route.ts"
  "src\app\api\reports\route.ts"
  "src\app\api\reports\[id]\route.ts"
  "src\app\api\reports\[id]\autosave\route.ts"
) do (
  powershell -Command "(Get-Content %%f) | Where-Object {$_ -notmatch 'runtime'} | Set-Content %%f"
)

"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" commit -m "Switch to OpenNext for Cloudflare Workers deployment"
"C:\Program Files\Git\cmd\git.exe" push
