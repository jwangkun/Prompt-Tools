# Windows Build Environment Setup for Prompt Tools
Write-Host "Setting up Windows build environment for Prompt Tools..." -ForegroundColor Cyan

# Set Visual Studio environment
$vsPath = "E:\VStudio"
$vcvarsPath = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"

if (Test-Path $vcvarsPath) {
    Write-Host "Loading Visual Studio environment..." -ForegroundColor Yellow
    
    # Load VS environment variables
    cmd /c "`"$vcvarsPath`" && set" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
    
    # Also add compiler to PATH directly
    $compilerPath = "$vsPath\VC\Tools\MSVC\14.43.34808\bin\Hostx64\x64"
    if (Test-Path $compilerPath) {
        $env:PATH += ";$compilerPath"
    }
}

# Add Rust to PATH if available
$rustPath = "$env:USERPROFILE\.cargo\bin"
if (Test-Path $rustPath) {
    $env:PATH += ";$rustPath"
}

Write-Host ""
Write-Host "Environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  pnpm tauri:dev          - Run in development mode"
Write-Host "  pnpm tauri:build:win    - Build Windows x64 version" 
Write-Host "  pnpm tauri:build:win-arm - Build Windows ARM64 version"
Write-Host ""

# Verify environment
Write-Host "Verifying environment..." -ForegroundColor Yellow

# Check C++ Compiler
try {
    $clVersion = & cl 2>&1 | Select-String "Microsoft"
    if ($clVersion) {
        Write-Host "✓ C++ Compiler: Available" -ForegroundColor Green
        Write-Host "  $($clVersion.Line.Trim())" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ C++ Compiler: Not found" -ForegroundColor Red
}

# Check Rust
try {
    $rustVersion = rustc --version 2>$null
    if ($rustVersion) {
        Write-Host "✓ Rust: Available" -ForegroundColor Green
        Write-Host "  $rustVersion" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Rust: Not found - still installing?" -ForegroundColor Yellow
}

# Check pnpm
try {
    $pnpmVersion = pnpm --version 2>$null
    if ($pnpmVersion) {
        Write-Host "✓ pnpm: Available" -ForegroundColor Green
        Write-Host "  Version $pnpmVersion" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ pnpm: Not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Ready to build! Run 'pnpm tauri:dev' to start development." -ForegroundColor Cyan