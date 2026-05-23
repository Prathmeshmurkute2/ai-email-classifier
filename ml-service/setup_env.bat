@echo off
echo ===================================================
echo Setting up Python Virtual Environment for ML Service
echo ===================================================
cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in the system PATH.
    echo Please install Python (3.8+) and try again.
    pause
    exit /b %errorlevel%
)

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment (venv)...
    python -m venv venv
) else (
    echo Virtual environment (venv) already exists.
)

REM Activate and install packages
echo Activating virtual environment...
call venv\Scripts\activate

echo Installing requirements...
pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo ===================================================
    echo Setup completed successfully!
    echo To start the Flask service, run: start_server.bat
    echo ===================================================
) else (
    echo [ERROR] Package installation failed. Please check your internet connection.
)
pause
