param([string]$Mode = "switch")
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifestPath = Join-Path $rootDir "manifest.json"
$firefoxManifestPath = Join-Path $rootDir "manifest-firefox.json"
$backupPath = Join-Path $rootDir "manifest.json.backup"

if ($Mode -eq "switch") {
    if ((Test-Path $manifestPath) -and (Test-Path $firefoxManifestPath)) {
        Copy-Item -Path $manifestPath -Destination $backupPath -Force
        Write-Host "备份完成" -ForegroundColor Green
        Copy-Item -Path $firefoxManifestPath -Destination $manifestPath -Force
        Write-Host "切换完成" -ForegroundColor Green
    } else {
        Write-Host "错误: 缺少文件" -ForegroundColor Red
    }
} elseif ($Mode -eq "recover") {
    if (Test-Path $backupPath) {
        Copy-Item -Path $backupPath -Destination $manifestPath -Force
        Remove-Item -Path $backupPath -Force
        Write-Host "恢复完成，备份文件已删除" -ForegroundColor Green
    } else {
        Write-Host "错误: 备份不存在" -ForegroundColor Red
    }
} else {
    Write-Host "错误: 模式不支持" -ForegroundColor Red
}
