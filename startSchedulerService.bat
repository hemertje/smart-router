@echo off
REM 🚀 SMART ROUTER SCHEDULER SERVICE STARTER
REM Start de persistent scheduler als Windows service

echo 🚀 Starting Smart Router Persistent Scheduler...
echo ===============================================
echo 📧 Daily mail will be sent at 09:00
echo 🔍 Real-time monitoring every 30 minutes
echo 🔄 Auto-restart enabled
echo.

REM Change to Smart Router directory
cd /d "C:\Dev\smart-router-v2.0.0"

REM Start persistent scheduler
echo 🔄 Starting persistent scheduler...
node startPersistentScheduler.js

REM If process stops, wait and restart
:restart_loop
echo ⚠️ Scheduler stopped, waiting 10 seconds before restart...
timeout /t 10 /nobreak >nul
echo 🔄 Restarting scheduler...
node startPersistentScheduler.js
goto restart_loop
