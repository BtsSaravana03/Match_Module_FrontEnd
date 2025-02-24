@echo off
setlocal enabledelayedexpansion

:: Check for internet access by pinging Google's public DNS
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% equ 0 (
    echo Internet connection detected.
    set "USE_LOCAL_IP=1"
) else (
    echo No internet connection. Defaulting to localhost.
    set "USE_LOCAL_IP=0"
)

:: Initialize IP variable
set "IP="

:: Retrieve the local IPv4 address (excluding 127.0.0.1)
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /C:"IPv4 Address" ^| findstr /V "127.0.0.1"') do (
    set "IP=%%A"
    set "IP=!IP:~1!"  :: Trim leading space
    goto :foundIP
)

:foundIP
:: If no local IP is found, default to localhost
if "%IP%"=="" (
    set "IP=localhost"
)

:: If internet is not available, force localhost
if "%USE_LOCAL_IP%"=="0" (
    set "IP=localhost"
)

:: Start Angular HTTP server on chosen IP
echo Starting server on %IP%...
angular-http-server --open -p 4200 --host %IP% --silent

endlocal
