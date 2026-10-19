@echo off
chcp 65001 >nul
cd /d D:\snake-game
echo ========================================
echo  Pushing snake-game to GitHub
echo ========================================
echo.
git push -u origin main
echo.
if %errorlevel%==0 (
  echo [OK] Push finished.
  echo Open: https://github.com/holycrosswitteth788-alt/snake-game
) else (
  echo [FAILED] Check the message above.
)
echo.
pause
