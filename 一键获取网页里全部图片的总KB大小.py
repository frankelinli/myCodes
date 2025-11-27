#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片提取器 - 从指定网页提取所有图片并计算总大小
"""

import re
import requests
from urllib.parse import urljoin, urlparse
import os
from typing import List, Tuple
import time

class ImageExtractor:
    def __init__(self, base_url: str, content: str):
        self.base_url = base_url
        self.content = content
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def extract_image_urls(self) -> List[str]:
        """从内容中提取所有图片URL"""
        # 匹配各种图片URL格式
        patterns = [
            r'!\[.*?\]\((https?://[^\s\)]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|ico))\)',  # Markdown格式
            r'<img[^>]*src=["\']([^"\']+)["\'][^>]*>',  # HTML img标签
            r'(https://images\.haoyelaiga\.com/[^\s\)]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|ico))',  # 直接图片链接
            r'src=["\']([^"\']*\.(?:jpg|jpeg|png|gif|webp|svg|bmp|ico))["\']',  # src属性
        ]
        
        image_urls = set()
        
        for pattern in patterns:
            matches = re.findall(pattern, self.content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    url = match[0] if match[0] else match[1]
                else:
                    url = match
                
                # 转换为绝对URL
                if url.startswith('http'):
                    image_urls.add(url)
                else:
                    absolute_url = urljoin(self.base_url, url)
                    image_urls.add(absolute_url)
        
        return list(image_urls)
    
    def get_image_size(self, url: str) -> Tuple[int, str]:
        """获取图片大小（字节）"""
        try:
            print(f"正在获取图片: {url}")
            response = self.session.head(url, timeout=10, allow_redirects=True)
            
            if response.status_code == 200:
                content_length = response.headers.get('content-length')
                if content_length:
                    return int(content_length), "success"
                else:
                    # 如果HEAD请求没有content-length，尝试GET请求部分内容
                    response = self.session.get(url, timeout=10, stream=True)
                    size = 0
                    for chunk in response.iter_content(chunk_size=1024):
                        size += len(chunk)
                    return size, "success"
            else:
                return 0, f"HTTP {response.status_code}"
                
        except Exception as e:
            print(f"获取图片失败: {url} - {str(e)}")
            return 0, f"Error: {str(e)}"
    
    def format_size(self, size_bytes: int) -> str:
        """格式化文件大小"""
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        size = float(size_bytes)
        
        while size >= 1024.0 and i < len(size_names) - 1:
            size /= 1024.0
            i += 1
        
        return f"{size:.2f} {size_names[i]}"
    
    def process_images(self) -> dict:
        """处理所有图片并返回结果"""
        image_urls = self.extract_image_urls()
        print(f"找到 {len(image_urls)} 个图片URL")
        
        results = {
            'images': [],
            'total_size': 0,
            'total_count': len(image_urls),
            'successful_count': 0,
            'failed_count': 0
        }
        
        for i, url in enumerate(image_urls, 1):
            print(f"处理第 {i}/{len(image_urls)} 个图片...")
            size, status = self.get_image_size(url)
            
            image_info = {
                'url': url,
                'filename': os.path.basename(urlparse(url).path),
                'size_bytes': size,
                'size_formatted': self.format_size(size),
                'status': status
            }
            
            results['images'].append(image_info)
            
            if status == "success":
                results['total_size'] += size
                results['successful_count'] += 1
            else:
                results['failed_count'] += 1
            
            # 添加延迟避免请求过快
            time.sleep(0.5)
        
        return results

def main():
    # 网页URL
    url = "https://haoyelaiga.com/wordpres%E5%A6%82%E4%BD%95%E8%AE%BE%E7%BD%AE%E5%AA%92%E4%BD%93%E5%9B%BE%E7%89%87%E7%9A%84%E5%B0%BA%E5%AF%B8%EF%BC%9F/"
    
    # 从fetch_webpage获取的内容（简化版）
    content = """
    ![image-20250929202644509](https://images.haoyelaiga.com/image-20250929202644509.webp)
    ![image-20250929204909116](https://images.haoyelaiga.com/image-20250929204909116.webp)
    ![image-20250929211027599](https://images.haoyelaiga.com/image-20250929211027599.webp)
    ![feature images demo](https://images.haoyelaiga.com/image-20250929230446885.webp)
    ![image-20250929234810969](https://images.haoyelaiga.com/image-20250929234810969.webp)
    ![image-20250929235606755](https://images.haoyelaiga.com/image-20250929235606755.webp)
    ![image-20250929220716847](https://images.haoyelaiga.com/image-20250929220716847.webp)
    ![image-20251001000852805](https://images.haoyelaiga.com/image-20251001000852805.webp)
    ![image-20251001125712501](https://images.haoyelaiga.com/image-20251001125712501.webp)
    ![image-20251001015533174](https://images.haoyelaiga.com/image-20251001015533174.webp)
    ![image-20250928115827175](https://images.haoyelaiga.com/image-20250928115827175.webp)
    """
    
    print("开始提取和计算图片大小...")
    print("=" * 60)
    
    extractor = ImageExtractor(url, content)
    results = extractor.process_images()
    
    # 输出结果
    print("\n" + "=" * 60)
    print("图片提取和大小计算结果")
    print("=" * 60)
    
    print(f"总计找到图片: {results['total_count']} 个")
    print(f"成功获取大小: {results['successful_count']} 个")
    print(f"获取失败: {results['failed_count']} 个")
    print()
    
    print("详细图片信息:")
    print("-" * 60)
    for i, img in enumerate(results['images'], 1):
        status_icon = "✓" if img['status'] == "success" else "✗"
        print(f"{i:2d}. {status_icon} {img['filename']}")
        print(f"     大小: {img['size_formatted']}")
        print(f"     URL: {img['url']}")
        if img['status'] != "success":
            print(f"     状态: {img['status']}")
        print()
    
    print("-" * 60)
    print(f"图片总大小: {extractor.format_size(results['total_size'])}")
    print(f"平均大小: {extractor.format_size(results['total_size'] // max(results['successful_count'], 1))}")
    
    return results

if __name__ == "__main__":
    main()