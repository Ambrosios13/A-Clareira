@echo off
cd /d "%~dp0"
echo Abra http://localhost:5173 no navegador.
echo Mantenha esta janela aberta enquanto explorar a Clareira.
node server.mjs
pause
