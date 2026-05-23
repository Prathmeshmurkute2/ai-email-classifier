@echo off
echo ===================================================
echo Starting SmartMail AI - Flask ML Service (Port 5000)
echo ===================================================
cd /d "%~dp0"

if not exist "venv" (
    echo [WARNING] venv folder not found. Running setup_env.bat first...
    call setup_env.bat
)

call venv\Scripts\activate
python app.py
pause
