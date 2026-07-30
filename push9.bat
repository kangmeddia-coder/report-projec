echo. >> "src\app\(dashboard)\layout.tsx"
echo export const runtime = 'edge'; >> "src\app\(dashboard)\layout.tsx"

echo. >> "src\app\(dashboard)\page.tsx"
echo export const runtime = 'edge'; >> "src\app\(dashboard)\page.tsx"

echo. >> "src\app\(dashboard)\reports\page.tsx"
echo export const runtime = 'edge'; >> "src\app\(dashboard)\reports\page.tsx"

echo. >> "src\app\(dashboard)\reports\new\page.tsx"
echo export const runtime = 'edge'; >> "src\app\(dashboard)\reports\new\page.tsx"

echo. >> "src\app\(dashboard)\reports\[id]\page.tsx"
echo export const runtime = 'edge'; >> "src\app\(dashboard)\reports\[id]\page.tsx"

echo. >> "src\app\(dashboard)\reports\[id]\preview\page.tsx"
echo export const runtime = 'edge'; >> "src\app\(dashboard)\reports\[id]\preview\page.tsx"

echo. >> "src\app\(dashboard)\settings\page.tsx"
echo export const runtime = 'edge'; >> "src\app\(dashboard)\settings\page.tsx"

echo. >> "src\app\login\page.tsx"
echo export const runtime = 'edge'; >> "src\app\login\page.tsx"

"C:\Program Files\Git\cmd\git.exe" commit -am "Add runtime edge to all page components"
"C:\Program Files\Git\cmd\git.exe" push
