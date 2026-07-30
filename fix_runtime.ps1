$files = Get-ChildItem -Path src -Recurse -Filter *.ts*
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "export const runtime\s*=\s*['""]edge['""];?") {
        $content = $content -replace "(?m)^export const runtime\s*=\s*['""]edge['""];?\s*$", ""
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Fixed $($file.Name)"
    }
}
