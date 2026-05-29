import cloudscraper  # 💡 核心更新：替代 requests 避免被挂起
from bs4 import BeautifulSoup
from datetime import datetime

def generate_auditors_table():
    url = "https://www.ethicalsupplychain.org/accredited-auditors-specialists"
    try:
        print("正在向 ESCP 官网发起请求 (正在安全穿透 Cloudflare)...")
        
        # 创建带有防拦截策略的 scraper 实例
        scraper = cloudscraper.create_scraper() 
        
        # 💡 核心更新：必须加 timeout=30。即便遇到极端网络波动，30秒也强行断开，坚决不卡死
        response = scraper.get(url, timeout=30) 
        
        print(f"请求成功！响应状态码: {response.status_code}")
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        auditor_divs = soup.find_all('div', class_='quick-links-wrapper')
        print(f"解析成功：在页面中捕获到 {len(auditor_divs)} 个审核机构节点。")

        # 构建简明醒目的 HTML 表格
        html_output = f"""
        <div class="escp-auditors-table-simple">
            <h2 style='color:#1565c0;font-family:sans-serif;'>ESCP认证审核公司列表<br><span style='font-size:0.7em;color:#888;'>(更新于 {datetime.now().strftime('%Y-%m-%d')})</span></h2>
            <table style='width:100%;border-collapse:collapse;font-family:sans-serif;'>
                <thead>
                    <tr style='background:#1976d2;color:#fff;'>
                        <th style='padding:10px;border:1px solid #1976d2;'>公司</th>
                        <th style='padding:10px;border:1px solid #1976d2;'>技术经理</th>
                        <th style='padding:10px;border:1px solid #1976d2;'>联系人</th>
                    </tr>
                </thead>
                <tbody>
        """

        for div in auditor_divs:
            company = div.find('h3', class_='h3').get_text(strip=True)
            tech_manager = div.find('a', class_='button align-centre w-button')
            contact_person = div.find('a', class_='button secondary align-centre w-button')
            html_output += f"""
                <tr style='background:#e3f2fd;'>
                    <td style='padding:8px;border:1px solid #90caf9;font-weight:bold;color:#0d47a1;'>{company}</td>
                    <td style='padding:8px;border:1px solid #90caf9;'>
                        {tech_manager.get_text(strip=True) if tech_manager else ''}<br>
                        <a href="{tech_manager['href'] if tech_manager else '#'}" style='color:#1976d2;'>
                            {tech_manager['href'].replace('mailto:','').split('?')[0] if tech_manager else ''}
                        </a>
                    </td>
                    <td style='padding:8px;border:1px solid #90caf9;'>
                        {contact_person.get_text(strip=True) if contact_person else ''}<br>
                        <a href="{contact_person['href'] if contact_person else '#'}" style='color:#1976d2;'>
                            {contact_person['href'].replace('mailto:','').split('?')[0] if contact_person else ''}
                        </a>
                    </td>
                </tr>
            """

        html_output += """
                </tbody>
            </table>
            <p style='font-size:0.95em;color:#666;margin-top:10px;'>* 数据自动采集自 ethicalsupplychain.org</p>
        </div>
        """

        # 保存为本地 HTML 文件
        with open('escp_auditors_simple.html', 'w', encoding='utf-8') as f:
            f.write(html_output)

        print("成功生成 HTML 报告：escp_auditors_simple.html")
        return html_output

    except Exception as e:
        print(f"❌ 运行发生致命错误: {e}")
        # 抛出异常确保 GitHub Actions 在日志中能显性弹红叉，不隐瞒错误
        raise 

# 执行
generate_auditors_table()