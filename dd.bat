@echo off
echo ========================================
echo   正在搜索并移除被 git 跟踪的 node_modules
echo ========================================

REM 遍历 Git 仓库中所有文件，并筛选出 node_modules
for /f "delims=" %%i in ('git ls-files ^| findstr node_modules') do (
    echo 移除追踪: %%i
    git rm -r --cached "%%i"
)

echo.
echo ========================================
echo   处理完成！请记得：
echo   1. 确认 .gitignore 里有 node_modules/
echo   2. git commit -m "remove node_modules"
echo   3. git push
echo ========================================
pause