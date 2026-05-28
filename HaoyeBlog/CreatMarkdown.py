import datetime
import os
import requests
import hashlib
import time
import random

def translate_to_english(chinese_text, use_baidu=True):
    """使用百度翻译 API 将中文翻译为英文"""
    if use_baidu:
        # 百度翻译 API（免费版）
        url = "https://api.fanyi.baidu.com/api/trans/vip/translate"
        
        appid = "20220000000000001"  # 需要自己注册获取
        secret_key = "YOUR_SECRET_KEY"  # 需要自己注册获取
        
        salt = random.randint(32768, 65536)
        sign_str = appid + chinese_text + str(salt) + secret_key
        sign = hashlib.md5(sign_str.encode('utf-8')).hexdigest()
        
        params = {
            'q': chinese_text,
            'from': 'zh',
            'to': 'en',
            'appid': appid,
            'salt': salt,
            'sign': sign
        }
        
        try:
            response = requests.get(url, params=params, timeout=5)
            result = response.json()
            if 'trans_result' in result and len(result['trans_result']) > 0:
                return result['trans_result'][0]['dst']
        except:
            pass
    
    return None

def slugify(text):
    """将英文文本转换为 URL Slug 格式"""
    if not text:
        return ""
    return (text.lower()
            .strip()
            .replace(' ', '-')
            .replace('_', '-')
            .replace('/', '-')
            .replace('.', '-')
            .replace('，', '-')
            .replace(',', '-')
            .strip('-'))

def create_markdown():
    now = datetime.datetime.now()
    filename = now.strftime("%Y-%m-%d-%H%M%S") + ".md"
    
    # 获取中文标题
    title = input("请输入文章标题（中文）: ").strip()
    if not title:
        print("标题不能为空!")
        return
    
    print(f"正在翻译标题: {title}...")
    
    # 自动翻译成英文
    english_title = translate_to_english(title)
    if not english_title:
        print("翻译失败，请手动输入英文标题")
        english_title = input("请输入英文标题: ").strip()
    
    # 自动生成 slug
    slug = slugify(english_title)
    print(f"✓ 自动生成 URL: /{slug}")
    
    # 可选：让用户修改 slug
    custom_slug = input("按 Enter 确认，或输入自定义 slug: ").strip()
    if custom_slug:
        slug = slugify(custom_slug)
        print(f"✓ 已更新 URL: /{slug}")
    
    # 生成 YAML 头部
    yaml_header = f"""---
title: {title}
slug: {slug}
categories:
  - notes
tags: []
---

"""
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(yaml_header)
    
    print(f"\n✓ 已创建文件: {filename}")
    print(f"✓ 中文标题: {title}")
    print(f"✓ 英文标题: {english_title}")
    print(f"✓ URL Slug: {slug}")

if __name__ == "__main__":
    create_markdown()