@echo off
setlocal enabledelayedexpansion  :: Enable delayed expansion for safe variable handling

:: Initialize IP variable
set "IP="

:: Attempt to retrieve the local IP address (case-insensitive search)
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%A"
    :: Trim leading spaces using delayed expansion
    set "IP=!IP:~1!"
    goto :foundIP
)

:foundIP
:: Check if IP was found; if not, default to localhost
if "%IP%"=="" (
    echo No local IP address found. Defaulting to localhost.
    set "IP=127.0.0.1"
)

:: Start the Angular HTTP server with the determined IP
echo Starting server on %IP%...
angular-http-server --open -p 4200 --host %IP%

endlocal