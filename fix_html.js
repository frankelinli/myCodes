const fs = require('fs');
const path = require('path');

const file = 'c:\\Users\\wingxu\\Desktop\\myCodes\\sedex\u81ea\u52a8\u8ba1\u7b97\u7f51\u9875\\sedex\u5ba1\u6838\u4fe1\u606f\u6536\u96c6\u8868.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the justReset / sessionStorage / loadFromLocalStorage / if(!justReset) wrapper
// and replace the DOMContentLoaded init block
const oldInit = /document\.addEventListener\('DOMContentLoaded', function\(\) \{[\s\S]*?recalc\(\);[\s\S]*?\/\/ [^\n]*localStorage[\s\S]*?querySelectorAll/;

// Use a line-based approach instead
const lines = content.split('\n');
let startIdx = -1, endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (startIdx === -1 && lines[i].includes("document.addEventListener('DOMContentLoaded'")) {
    startIdx = i;
  }
  if (startIdx >= 0 && lines[i].trim() === '});' && i > startIdx) {
    endIdx = i;
    break;
  }
}

console.log(`DOMContentLoaded block: lines ${startIdx+1} to ${endIdx+1}`);
console.log('First line:', lines[startIdx]);
console.log('Last line:', lines[endIdx]);

// Find end of the entire block including the comment about autosave before querySelectorAll
// We need to find the recalc() and then the querySelectorAll line
let recalcLine = -1;
let queryLine = -1;
for (let i = startIdx; i <= endIdx; i++) {
  if (lines[i].trim() === 'recalc();' && recalcLine === -1) {
    recalcLine = i;
  }
  if (lines[i].includes("querySelectorAll('input, textarea')") && queryLine === -1) {
    queryLine = i;
  }
}

console.log(`recalc at line ${recalcLine+1}: ${lines[recalcLine]}`);
console.log(`querySelectorAll at line ${queryLine+1}: ${lines[queryLine]}`);

// Replace lines from startIdx to queryLine-1 (inclusive of any comment line before it)
// Keep from queryLine onwards until endIdx
const newLines = [
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
];

// Find the line with querySelectorAll to get the actual indented version
// Replace from startIdx to queryLine (exclusive) with newLines
const result = [
  ...lines.slice(0, startIdx),
  ...newLines,
  ...lines.slice(queryLine + 1),
];

fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log('Done. Total lines:', result.length);

// Verify
const check = fs.readFileSync(file, 'utf8');
console.log('localStorage occurrences:', (check.match(/localStorage/g) || []).length);
console.log('autoSave occurrences:', (check.match(/autoSave/g) || []).length);
