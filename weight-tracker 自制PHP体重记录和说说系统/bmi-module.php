<?php
/**
 * BMI Module - WordPress Integration
 * Automatically calculates BMI for a user with a height of 170cm
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get latest weight record
$lastWeight = isset($data[0]['weight']) ? $data[0]['weight'] : null;
$lastWeightDate = isset($data[0]['date']) ? date("Y-m-d", strtotime($data[0]['date'])) : null;

// Calculate BMI (if weight data exists)
$height = 1.70; // 170cm = 1.70m
$bmi = null;
$bmiCategory = '';
$bmiColor = '';
$pointerPosition = 0;

if ($lastWeight) {
    $bmi = $lastWeight / ($height * $height);
    $roundedBMI = round($bmi * 10) / 10;
    
    if ($bmi < 18.5) {
        $bmiCategory = '偏瘦';
        $bmiColor = '#5bc0de';
        $pointerPosition = ($bmi / 18.5) * 25;
    } elseif ($bmi < 24) {
        $bmiCategory = '正常';
        $bmiColor = '#5cb85c';
        $pointerPosition = 25 + (($bmi - 18.5) / 5.5) * 25;
    } elseif ($bmi < 28) {
        $bmiCategory = '超重';
        $bmiColor = '#f0ad4e';
        $pointerPosition = 50 + (($bmi - 24) / 4) * 25;
    } else {
        $bmiCategory = '肥胖';
        $bmiColor = '#d9534f';
        $pointerPosition = 75 + min((($bmi - 28) / 12), 1) * 25;
    }
    
    // Ensure pointer position is within reasonable range
    $pointerPosition = max(0, min(100, $pointerPosition));
    
    // Calculate difference from ideal weight
    $minHealthyWeight = 18.5 * ($height * $height);
    $maxHealthyWeight = 24 * ($height * $height);
    
    if ($lastWeight < $minHealthyWeight) {
        $needToGain = round(($minHealthyWeight - $lastWeight) * 10) / 10;
        $weightDiffText = "<span style=\"color:#5bc0de\">需要增重 {$needToGain} kg 达到健康体重</span>";
    } elseif ($lastWeight > $maxHealthyWeight) {
        $needToLose = round(($lastWeight - $maxHealthyWeight) * 10) / 10;
        $weightDiffText = "<span style=\"color:#d9534f\">需要减重 {$needToLose} kg 达到健康体重</span>";
    } else {
        $weightDiffText = "<span style=\"color:#5cb85c\">您的体重在健康范围内!</span>";
    }
}
?>

<div class="bmi-calculator">
  <h3>BMI 健康指数 <small>(我的身高170cm)</small></h3>
  
  <div id="current-weight-bmi" class="current-weight-display">
    <div class="weight-info">当前体重: <span id="latest-weight-value"><?php echo $lastWeight ? number_format($lastWeight, 1) : '未记录'; ?></span> kg</div>
    <div class="date-info">记录日期: <span id="latest-weight-date"><?php echo $lastWeightDate ?: '未记录'; ?></span></div>
  </div>
  
  <div id="bmi-result" class="bmi-result" style="border-left-color: <?php echo $bmiColor ?: '#5bc0de'; ?>">
    <div class="bmi-value">BMI: <span id="bmi-value-display"><?php echo $bmi ? number_format($roundedBMI, 1) : '-'; ?></span></div>
    <div class="bmi-category">体重状态: <span id="bmi-category-display" style="color: <?php echo $bmiColor; ?>"><?php echo $bmiCategory ?: '-'; ?></span></div>
  </div>
  
  <!-- BMI Scale -->
  <div class="bmi-scale-container">
    <div class="bmi-scale">
      <div class="bmi-range underweight" title="体重过轻 BMI < 18.5">偏瘦</div>
      <div class="bmi-range normal" title="正常体重 18.5 ≤ BMI < 24">正常</div>
      <div class="bmi-range overweight" title="超重 24 ≤ BMI < 28">超重</div>
      <div class="bmi-range obese" title="肥胖 BMI ≥ 28">肥胖</div>
    </div>
    
    <div class="bmi-pointer-container">
      <div id="bmi-pointer" class="bmi-pointer" style="left: <?php echo $pointerPosition; ?>%">▼</div>
    </div>
    
    <!-- BMI Scale Markers -->
    <div class="bmi-scale-markers">
      <span class="bmi-marker" style="left: 0%">16</span>
      <span class="bmi-marker" style="left: 25%">18.5</span>
      <span class="bmi-marker" style="left: 50%">24</span>
      <span class="bmi-marker" style="left: 75%">28</span>
      <span class="bmi-marker" style="left: 100%">35+</span>
    </div>
  </div>
  
  <div class="bmi-info">
    <p>理想体重范围: <strong>53.5kg - 69.4kg</strong> (BMI 18.5-24)</p>
    <p>距离理想体重: <span id="weight-diff"><?php echo isset($weightDiffText) ? $weightDiffText : '计算中...'; ?></span></p>
  </div>

  <?php if (count($data) > 1): // Only show history chart toggle when multiple records exist ?>
  <div class="bmi-history-toggle">
    <button id="toggle-bmi-history">查看BMI历史变化</button>
  </div>
  
  <div id="bmi-history-chart" class="bmi-history-chart" style="display: none;">
    <!-- BMI history chart will display here -->
  </div>
  <?php endif; ?>
</div>