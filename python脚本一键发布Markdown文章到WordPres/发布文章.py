import os
import xmlrpc.client
import logging
import shutil
from markdown import markdown
from dotenv import load_dotenv
from pygments.formatters import HtmlFormatter

# 加载环境变量
load_dotenv()

# WordPress 配置
WP_URL = os.getenv("WP_URL")
WP_USER = os.getenv("WP_USER")
WP_PASSWORD = os.getenv("WP_PASSWORD")

# Markdown
MARKDOWN_FOLDER = "./markdown files inventory"
EXTENSIONS = [
    'extra',          # 支持表格、围栏代码块等
    'codehilite',     # 代码高亮
    'toc',           # 目录生成
    'nl2br',         # 换行转<br>
    'sane_lists'     # 智能列表
]
EXTENSION_CONFIGS = {
    'codehilite': {
        'use_pygments': True,
        'css_class': 'wp-block-code',
        'linenums': False,
        'guess_lang': True
    },
    'toc': {
        'toc_depth': '2-4',
        'marker': '[TOC]'
    }
}

def setup_logging():
    """配置日志记录"""
    logging.basicConfig(
        filename='wp_importer.log',
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        encoding='utf-8'  # 添加 UTF-8 编码设置
    )
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

def convert_md_to_html(md_file_path):
    """
    将Markdown转换为WordPress兼容的HTML
    包含代码块高亮预处理
    """
    try:
        with open(md_file_path, "r", encoding="utf-8") as f:
            md_content = f.read()

        # 转换Markdown
        html_content = markdown(
            md_content,
            extensions=EXTENSIONS,
            extension_configs=EXTENSION_CONFIGS,
            output_format='html5'
        )

        # 添加代码高亮样式占位（实际CSS应放在WordPress主题中）
        html_content = f"<!--code-style-->\n{html_content}"
        
        return html_content

    except Exception as e:
        logging.error(f"转换失败: {md_file_path} - {str(e)}")
        raise

def publish_post_to_wordpress(title, content, categories=None, tags=None, status="publish"):
    """
    修改后的发布函数，移除了不支持的timeout参数
    """
    if categories is None:
        categories = ["默认分类"]
    if tags is None:
        tags = []

    post_data = {
        "title": title,
        "description": content,
        "post_type": "post",
        "post_status": status,
        "terms": {
            "category": categories,
            "post_tag": tags
        },
        "custom_fields": [
            {"key": "_md_source", "value": "markdown_importer"}
        ]
    }

    try:
        # 移除了timeout参数
        server = xmlrpc.client.ServerProxy(WP_URL)
        post_id = server.metaWeblog.newPost("", WP_USER, WP_PASSWORD, post_data, True)
        logging.info(f"发布成功: {title} (ID:{post_id})")
        return post_id
    except xmlrpc.client.Fault as err:
        logging.error(f"API错误: {title} - {err.faultString} (code:{err.faultCode})")
    except Exception as err:
        logging.error(f"发布失败: {title} - {type(err).__name__}: {str(err)}")
    return None

def extract_metadata(md_content):
    """
    从Markdown的YAML front matter提取元数据
    示例格式：
    ---
    title: 真实标题
    categories: [技术, 教程]
    tags: [python, markdown]
    ---
    """
    metadata = {
        "title": None,
        "categories": ["默认分类"],
        "tags": []
    }
    
    if md_content.startswith('---\n'):
        try:
            import yaml
            parts = md_content.split('---\n', 2)
            if len(parts) > 2:
                front_matter = yaml.safe_load(parts[1])
                metadata.update({
                    k: v for k, v in front_matter.items() 
                    if k in metadata
                })
                md_content = parts[2]  # 移除front matter后的内容
        except Exception as e:
            logging.warning(f"Front matter解析失败: {str(e)}")
    
    return metadata, md_content

def process_markdown_file(md_file_path):
    """处理单个Markdown文件"""
    try:
        with open(md_file_path, "r", encoding="utf-8") as f:
            raw_content = f.read()

        # 提取元数据
        metadata, md_content = extract_metadata(raw_content)
        title = metadata["title"] or os.path.splitext(os.path.basename(md_file_path))[0]
        
        # 转换内容
        html_content = markdown(
            md_content,
            extensions=EXTENSIONS,
            extension_configs=EXTENSION_CONFIGS
        )

        # 发布到WordPress
        post_id = publish_post_to_wordpress(
            title=title,
            content=html_content,
            categories=metadata["categories"],
            tags=metadata["tags"]
        )
        
        if post_id is not None:
            # 备份已发布的 Markdown 文件
            backup_dir = os.path.join(os.path.dirname(md_file_path), "backup")
            if not os.path.exists(backup_dir):
                os.makedirs(backup_dir)
            shutil.move(md_file_path, os.path.join(backup_dir, os.path.basename(md_file_path)))
            logging.info(f"已备份: {md_file_path} -> {backup_dir}")
            return True

    except Exception as e:
        logging.error(f"处理文件失败: {md_file_path} - {type(e).__name__}: {str(e)}")
        return False

def main():
    """主执行函数"""
    setup_logging()
    logging.info("=== Markdown导入任务开始 ===")
    
    if not WP_PASSWORD:
        logging.error("未检测到WordPress密码，请检查.env文件")
        return

    processed = 0
    for filename in os.listdir(MARKDOWN_FOLDER):
        if filename.endswith(".md"):
            md_file = os.path.join(MARKDOWN_FOLDER, filename)
            if process_markdown_file(md_file):
                processed += 1

    logging.info(f"任务完成，共处理 {processed}/{len(os.listdir(MARKDOWN_FOLDER))} 个文件")

if __name__ == "__main__":
    main()