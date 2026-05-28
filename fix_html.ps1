$file = "c:\Users\wingxu\Desktop\myCodes\sedex自动计算网页\sedex审核信息收集表.html"
$enc = [System.Text.Encoding]::UTF8
$lines = [System.IO.File]::ReadAllLines($file, $enc)

# 找到 DOMContentLoaded 行（第一次出现的脚本部分）
$startLine = -1
$endLine = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($startLine -eq -1 -and $lines[$i] -match "^document\.addEventListener\('DOMContentLoaded'") {
        $startLine = $i
    }
    if ($startLine -ge 0 -and $lines[$i] -match "^\}\);" -and $i -gt $startLine) {
        # 如果后面还有 pageshow 块，继续找
        $endLine = $i
        # 检查后续是否有 pageshow，如果有把它也包含进来
        for ($j = $i + 1; $j -lt $lines.Length -and $j -lt $i + 5; $j++) {
            if ($lines[$j] -match "pageshow") {
                # 找到 pageshow 块的结尾
                for ($k = $j; $k -lt $lines.Length; $k++) {
                    if ($lines[$k] -match "^\}\);") {
                        $endLine = $k
                        break
                    }
                }
                break
            }
        }
        break
    }
}

Write-Host "Start: $startLine, End: $endLine"
Write-Host "StartLine content: $($lines[$startLine])"
Write-Host "EndLine content: $($lines[$endLine])"

$newBlock = @(
"document.addEventListener('DOMContentLoaded', function() {",
"  if (window.__SEDEX_SAVED__) {",
"    applyFormData(window.__SEDEX_SAVED__);",
"  } else {",
"    var today = new Date();",
"    var y = today.getFullYear();",
"    var m = String(today.getMonth() + 1).padStart(2, '0');",
"    var d = String(today.getDate()).padStart(2, '0');",
"    var fillDateEl = document.getElementById('fill-date');",
"    if (fillDateEl && !fillDateEl.value) {",
"      fillDateEl.value = y + '-' + m + '-' + d;",
"    }",
"  }",
"",
"  recalc();",
"",
"  document.querySelectorAll('input, textarea').forEach(function(el) {",
"    el.addEventListener('focus', function() {",
"      var self = this;",
"      setTimeout(function() { self.select(); }, 0);",
"    });",
"    el.addEventListener('input', function() {",
"      recalc();",
"    });",
"  });",
"});"
)

$result = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $startLine; $i++) { $result.Add($lines[$i]) }
foreach ($l in $newBlock) { $result.Add($l) }
for ($i = $endLine + 1; $i -lt $lines.Length; $i++) { $result.Add($lines[$i]) }

[System.IO.File]::WriteAllLines($file, $result, $enc)
Write-Host "Done. Total lines: $($result.Count)"
