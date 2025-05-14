@echo off
echo Updating RecSpicy Repository...

:: Add all changes
git add .

:: Get current date and time for commit message
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"

set "timestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"

:: Commit changes with timestamp
git commit -m "Repository update: %timestamp%"

:: Push to remote repository
git push

echo.
echo Repository updated successfully!
echo.

pause