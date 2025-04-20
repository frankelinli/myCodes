"""
图片水印添加工具

此脚本使用Python实现，提供了一个简单的GUI界面，用于选择图片文件并添加水印。
水印内容包括图片的EXIF日期信息（如果可用）以及用户输入的时间。

功能：
1. 从图片的EXIF元数据中提取拍摄日期。
2. 自动旋转图片以纠正方向。
3. 用户可以手动输入时间并将其与日期组合形成水印。
4. 支持多种图片格式（JPEG, PNG, BMP等）。
5. 生成带有水印的新图片文件。

依赖：
- tkinter: 用于创建文件选择对话框。
- PIL (Pillow): 用于图像处理。
"""

import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
import os
from PIL.ExifTags import TAGS

def get_date_from_exif(img):
    try:
        exif = img._getexif()
        if exif is not None:
            for tag_id in exif:
                tag = TAGS.get(tag_id, tag_id)
                data = exif.get(tag_id)
                if tag == 'DateTimeOriginal':
                    # EXIF日期格式通常为'YYYY:MM:DD HH:MM:SS'
                    return data.split()[0].replace(':', '-')
    except:
        pass
    return None

def process_image():
    # 创建文件选择对话框
    root = tk.Tk()
    root.withdraw()
    
    image_path = filedialog.askopenfilename(
        title="选择图片文件",
        filetypes=[
            ("图片文件", "*.jpg;*.jpeg;*.png;*.bmp"),
            ("所有文件", "*.*")
        ]
    )
    
    if not image_path:
        print("未选择文件！")
        input("按Enter键退出...")
        return
        
    try:
        # 打开图片
        img = Image.open(image_path)
        
        # 获取原图日期
        date_str = get_date_from_exif(img)
        if not date_str:
            print("无法从图片中读取日期！请手动输入日期。")
            while True:
                try:
                    date_str = input("请输入日期 (格式: YYYY-MM-DD): ")
                    datetime.strptime(date_str, '%Y-%m-%d')  # 验证日期格式
                    break
                except ValueError:
                    print("日期格式错误，请重新输入！")
        else:
            print(f"从图片中读取到日期: {date_str}")
        
        # 自动旋转图片
        try:
            if hasattr(img, '_getexif'):
                exif = img._getexif()
                if exif is not None:
                    orientation = exif.get(274)  # 274是方向标签的ID
                    if orientation == 3:
                        img = img.rotate(180, expand=True)
                    elif orientation == 6:
                        img = img.rotate(270, expand=True)
                    elif orientation == 8:
                        img = img.rotate(90, expand=True)
        except:
            pass
            
        # 如果是JPEG格式，创建不带EXIF的新图片
        if image_path.lower().endswith(('.jpg', '.jpeg')):
            data = list(img.getdata())
            new_img = Image.new(img.mode, img.size)
            new_img.putdata(data)
        else:
            new_img = img.copy()
        
        # 获取用户输入的时间
        while True:
            try:
                hour = int(input("请输入小时 (0-23): "))
                if 0 <= hour <= 23:
                    break
                print("小时必须在0-23之间！")
            except ValueError:
                print("请输入有效的数字！")
        
        while True:
            try:
                minute = int(input("请输入分钟 (0-59): "))
                if 0 <= minute <= 59:
                    break
                print("分钟必须在0-59之间！")
            except ValueError:
                print("请输入有效的数字！")
            
        watermark_text = f"{date_str} {hour:02d}:{minute:02d}"
        
        # 创建绘图对象
        draw = ImageDraw.Draw(new_img)
        
        # 设置字体大小
        img_w, img_h = new_img.size
        font_size = int(min(img_w, img_h) / 20)  # 根据图片尺寸调整字体大小
        
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("msyh.ttc", font_size)
            except:
                font = ImageFont.load_default()
        
        # 获取文字尺寸
        try:
            text_w = draw.textlength(watermark_text, font=font)
            bbox = draw.textbbox((0, 0), watermark_text, font=font)
            text_h = bbox[3] - bbox[1]
        except:
            text_w, text_h = draw.textsize(watermark_text, font=font)
        
        # 计算位置（右下角，留出较大间隙）
        margin = int(min(img_w, img_h) / 25)  # 根据图片尺寸调整边距
        x = img_w - text_w - margin
        y = img_h - text_h - margin
        
        # 添加文字水印
        for offset_x, offset_y in [(1,1), (-1,-1), (-1,1), (1,-1)]:
            draw.text((x + offset_x, y + offset_y), watermark_text, (0, 0, 0), font=font)
        draw.text((x, y), watermark_text, (255, 255, 255), font=font)
        
        # 生成新文件名
        file_name, file_ext = os.path.splitext(image_path)
        new_file = f"{file_name}_watermarked{file_ext}"
        
        # 保存图片
        new_img.save(new_file)
        print(f"处理完成！新文件已保存为: {new_file}")
        
    except Exception as e:
        print(f"发生错误: {str(e)}")
    
    input("按Enter键退出...")

if __name__ == "__main__":
    process_image()