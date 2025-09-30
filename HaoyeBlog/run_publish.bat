@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
REM run_publish.bat - 先 dry-run，再可选正式执行 batch_publish.js，并自动打开发布的文章

:: 切换到脚本所在目录（支持拖放或双击）
cd /d "%~dp0"

:: 检查 node 是否可用
where node >nul 2>&1
if errorlevel 1 (
  echo 未检测到 Node.js，请先安装或将 node 加入 PATH。
  pause
  exit /b 1
)

:: 先执行 --dry-run
echo 正在运行: node batch_publish.js --dry-run
node batch_publish.js --dry-run

:: 提示，回车默认为 Y
set /p userInput=是否现在运行正式发布 (Y/n)? 
if "%userInput%"=="" set userInput=Y

if /i "%userInput%"=="Y" (
  echo 运行正式发布: node batch_publish.js
  
  REM 捕获输出到临时文件
  node batch_publish.js > publish_output.tmp 2>&1
  
  REM 显示输出
  type publish_output.tmp
  
  REM 提取发布的URL并在浏览器中打开
  set "extracting=false"
  for /f "usebackq delims=" %%i in ("publish_output.tmp") do (
    if "%%i"=="=== PUBLISHED_URLS ===" set "extracting=true"
    if "%%i"=="=== END_URLS ===" set "extracting=false"
    if "!extracting!"=="true" if not "%%i"=="=== PUBLISHED_URLS ===" (
      echo 正在打开文章: %%i
      start "" "%%i"
      timeout /t 1 /nobreak >nul
    )
  )
  
  REM 清理临时文件
  del publish_output.tmp 2>nul
) else (
  echo 未执行正式发布。
)

echo 完成。按任意键退出。
pause >nul
