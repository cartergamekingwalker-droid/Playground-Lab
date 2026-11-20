@echo off
title Build Playground Lab for Windows
cd /d "%~dp0"
echo ==========================================
echo        PLAYGROUND LAB - WINDOWS BUILD
echo ==========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js LTS first.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js with npm included.
  pause
  exit /b 1
)
echo [1/2] Installing build packages...
call npm install
if errorlevel 1 (
  echo.
  echo Package installation failed. Check your internet connection and try again.
  pause
  exit /b 1
)
echo.
echo [2/2] Creating the Windows installer...
call npm run dist
if errorlevel 1 (
  echo.
  echo Build failed. The error above should explain why.
  pause
  exit /b 1
)
echo.
echo SUCCESS! Look in the dist folder for:
echo Playground-Lab-Setup.exe
pause
