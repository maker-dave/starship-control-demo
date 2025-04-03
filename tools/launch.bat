@echo off
:: Batch script to launch all stations in kiosk mode on Windows

:: Path to Chrome executable
set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

:: URLs for each station
set NAV_URL=http://192.168.86.69:8126/navigation.html
set ENG_URL=http://192.168.86.69:8126/engineering.html
set WORLD_URL=http://192.168.86.69:8126/world.html
set SCI_URL=http://192.168.86.69:8126/science.html
set OPS_URL=http://192.168.86.69:8126/ops.html
set CONFIG_URL=http://192.168.86.69:8126/config.html

:: Launch each station in a separate Chrome instance in kiosk mode
:: Use --user-data-dir to ensure each instance is independent
:: Position windows to avoid overlap (adjust positions based on your screen resolution)
start "" %CHROME% --kiosk --user-data-dir=%TEMP%\chrome-nav --window-position=0,0 --app=%NAV_URL%
timeout /t 1 >nul
start "" %CHROME% --kiosk --user-data-dir=%TEMP%\chrome-eng --window-position=200,0 --app=%ENG_URL%
timeout /t 1 >nul
start "" %CHROME% --kiosk --user-data-dir=%TEMP%\chrome-world --window-position=400,0 --app=%WORLD_URL%
timeout /t 1 >nul
start "" %CHROME% --kiosk --user-data-dir=%TEMP%\chrome-sci --window-position=600,0 --app=%SCI_URL%
timeout /t 1 >nul
start "" %CHROME% --kiosk --user-data-dir=%TEMP%\chrome-ops --window-position=800,0 --app=%OPS_URL%
timeout /t 1 >nul
start "" %CHROME% --kiosk --user-data-dir=%TEMP%\chrome-config --window-position=1000,0 --app=%CONFIG_URL%
