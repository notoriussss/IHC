@echo off
echo Installing dependencies for main application...
call npm install

echo Installing dependencies for forum...
cd foro
call npm install
cd ..

echo Starting both applications...
call npm start 