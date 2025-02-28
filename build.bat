@echo off
echo Building Wails app for Windows x64...
wails build -platform windows/amd64
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b %ERRORLEVEL%
)
echo Build completed successfully!
pause