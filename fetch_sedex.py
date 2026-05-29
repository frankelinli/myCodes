import urllib.request
import smtplib
import os
from bs4 import BeautifulSoup
from email.mime.text import MIMEText
from email.header import Header
from datetime import datetime

def get_sedex_articles():
    # 💡 使用标准的 RSS 资讯接口，稳定且不触发人机验证
    url = "https://www.sedex.com/feed/" 
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    try:
        print("正在获取 Sedex 最新文章数据...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as response:
            xml_data = response.read()
        
        soup = BeautifulSoup(xml_data, 'xml') # 使用 xml 解析器
        items = soup.find_all('item')[:20] # 严格限制只取最近的 20 篇
        print(f"成功捕获到 {len(items)} 篇最新资讯。")
        
        # 开始构建精美的 HTML 邮件正文
        html_content = """
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #002B49; border-bottom: 2px solid #FF5C39; padding-bottom: 10px; margin-top: 0;">
                Sedex 官网最新动态看板 <br>
                <span style="font-size: 0.6em; color: #666; font-weight: normal;">推送时间: {time}</span>
            </h2>
            <ul style="list-style: none; padding-left: 0;">
        """.format(time=datetime.now().strftime('%Y-%m-%d %H:%M'))
        
        for item in items:
            title = item.find('title').get_text(strip=True) if item.find('title') else '无标题'
            link = item.find('link').get_text(strip=True) if item.find('link') else '#'
            
            # 提取摘要并去掉 HTML 标签，限制长度
            desc_tag = item.find('description')
            desc = "暂无摘要描述。"
            if desc_tag:
                desc_soup = BeautifulSoup(desc_tag.get_text(), 'html.parser')
                desc = desc_soup.get_text(strip=True)[:120] + "..."
            
            html_content += f"""
                <li style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #eee;">
                    <a href="{link}" target="_blank" style="color: #005A9C; font-size: 16px; font-weight: bold; text-decoration: none; display: block; margin-bottom: 5px;">{title}</a>
                    <p style="color: #555; font-size: 13px; line-height: 1.6; margin: 0;">{desc}</p>
                    <a href="{link}" target="_blank" style="color: #FF5C39; font-size: 12px; text-decoration: none; font-weight: bold;">阅读原文 &raquo;</a>
                </li>
            """
            
        html_content += """
            </ul>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 30px;">
            <p style="font-size: 11px; color: #999; text-align: center; margin-bottom: 0;">* 本邮件由 GitHub Actions 自动化看板提供，数据源自 Sedex 官方 Feed</p>
        </div>
        """
        return html_content
    except Exception as e:
        print(f"提取数据失败: {e}")
        return None

def send_email(html_body):
    # 从 GitHub Secrets 中安全读取邮箱配置
    mail_host = os.environ.get("MAIL_SERVER")
    mail_port = int(os.environ.get("MAIL_PORT", 465))
    mail_user = os.environ.get("MAIL_USERNAME")
    mail_pass = os.environ.get("MAIL_PASSWORD")
    sender = os.environ.get("MAIL_FROM")
    receiver = "wingxyq@qq.com"
    
    msg = MIMEText(html_body, 'html', 'utf-8')
    msg['From'] = Header(f"Sedex Monitor <{sender}>", 'utf-8')
    msg['To'] = Header(receiver)
    msg['Subject'] = Header(f"【自动化看板】Sedex 官网最近 20 篇文章更新", 'utf-8')
    
    try:
        print("正在通过 SSL 安全连接邮件服务器...")
        server = smtplib.SMTP_SSL(mail_host, mail_port, timeout=15)
        print("正在登录邮箱...")
        server.login(mail_user, mail_pass)
        print("正在发送邮件...")
        server.sendmail(sender, [receiver], msg.as_string())
        server.quit()
        print("🎉 邮件发送成功！请检查你的 QQ 邮箱。")
    except Exception as e:
        print(f"❌ 邮件发送失败: {e}")
        raise

if __name__ == "__main__":
    content = get_sedex_articles()
    if content:
        send_email(content)