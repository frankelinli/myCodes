![image-20240721202652772](https://docu-1319658309.cos.ap-guangzhou.myqcloud.com/image-20240721202652772.png)

WordPress子主题实现：鼠标在空白处摁下左键，会弹出五彩斑斓的颜色

要在WordPress子主题中实现这样的效果，你需要使用JavaScript来捕获鼠标左键按下事件，并在空白处生成五彩斑斓的颜色。以下是实现此功能的基本步骤：





### 在子主题中添加JavaScript

1. **创建JavaScript文件**： 在你的WordPress子主题目录下创建一个新的JavaScript文件，比如 `custom.js`。

   ```php
   // custom.js
   jQuery(document).ready(function($) {
       $(document).mousedown(function(event) {
           // Check if left mouse button is pressed
           if (event.which === 1) {
               // Generate random RGB color
               var color = getRandomColor();
               // Create a div with the color at mouse position
               createColorSpot(event.pageX, event.pageY, color);
           }
       });
   
       function getRandomColor() {
           var r = Math.floor(Math.random() * 256);
           var g = Math.floor(Math.random() * 256);
           var b = Math.floor(Math.random() * 256);
           return 'rgb(' + r + ',' + g + ',' + b + ')';
       }
   
       function createColorSpot(x, y, color) {
           // Create a colored div at the specified position
           var $spot = $('<div></div>').css({
               'position': 'absolute',
               'left': x + 'px',
               'top': y + 'px',
               'width': '20px',
               'height': '20px',
               'background-color': color,
               'border-radius': '50%'
           });
   
           // Append the div to the body
           $('body').append($spot);
   
           // Fade out and remove the div after a certain time
           $spot.fadeOut(1500, function() {
               $(this).remove();
           });
       }
   });
   
   ```

2. **将JavaScript文件添加到WordPress主题中**： 打开你的子主题的 `functions.php` 文件，在其中添加以下代码将 `custom.js` 文件包含进来。

   ```php
   function add_custom_scripts() {
       wp_enqueue_script('custom-script', get_stylesheet_directory_uri() . '/custom.js', array('jquery'), '1.0', true);
   }
   add_action('wp_enqueue_scripts', 'add_custom_scripts');
   
   ```

### 解释与功能说明

- **jQuery Document Ready**：确保文档加载完成后再执行JavaScript代码。
- **mousedown事件监听**：捕获鼠标左键按下事件。
- **event.pageX和event.pageY**：获取鼠标点击位置的页面坐标。
- **getRandomColor函数**：生成随机的RGB颜色值。
- **createColorSpot函数**：创建一个带有随机颜色的div，并将其放置在鼠标点击的位置上。
- **fadeOut和remove**：设置颜色块淡出并在淡出完成后从DOM中移除，以避免页面过度加载。

### 注意事项

- 这段代码假设你的子主题中已经包含了jQuery库。大多数WordPress主题都会自带jQuery，但如果没有，你需要将其手动添加到你的主题中。
- 这种效果会在用户点击页面空白处时产生颜色斑点，但它们会渐渐消失，而不会永久留在页面上。

通过这些步骤，你就可以在WordPress子主题中实现在空白处按下鼠标左键时产生五彩斑斓颜色的效果了。
