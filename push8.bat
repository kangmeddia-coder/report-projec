echo. >> src\app\api\auth\[...nextauth]\route.ts
echo export const runtime = 'edge'; >> src\app\api\auth\[...nextauth]\route.ts
echo. >> src\app\api\reports\route.ts
echo export const runtime = 'edge'; >> src\app\api\reports\route.ts
echo. >> src\app\api\reports\[id]\route.ts
echo export const runtime = 'edge'; >> src\app\api\reports\[id]\route.ts
echo. >> src\app\api\reports\[id]\autosave\route.ts
echo export const runtime = 'edge'; >> src\app\api\reports\[id]\autosave\route.ts

"C:\Program Files\Git\cmd\git.exe" commit -am "Add edge runtime to routes"
"C:\Program Files\Git\cmd\git.exe" push
