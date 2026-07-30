$files = Get-ChildItem -Path "src\app" -Recurse -Include "*.tsx","*.ts"
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $newContent = $content -replace "(?m)\s*\r?\nexport const runtime = 'edge';\s*\r?\n?", ""
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}
Write-Host "Done!"
