@echo off
setlocal
cd /d "%~dp0"

if not exist "package.json" (
    echo Error: no se encontro package.json en "%CD%".
    pause
    exit /b 1
)

start "" /b powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$url = 'https://polirrubro.test:3000/'; for ($i = 0; $i -lt 60; $i++) { $client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 3000); $client.Close(); Start-Process $url; exit 0 } catch { $client.Close(); Start-Sleep -Seconds 1 } }; Write-Host 'No se detecto el servidor en el puerto 3000. Revisa los errores de inicio.'"

npm run dev

echo.
echo El servidor se detuvo o el comando finalizo.
pause
