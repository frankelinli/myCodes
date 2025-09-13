import os
import re
import requests
import html2text
import yaml

# WordPress REST API 地址（请根据实际站点修改）
API_URL = "https://csrwiki.com/wp-json/wp/v2"
# 保存 Markdown 文件的目录
SAVE_DIR = "./exported_posts"

# 确保保存目录存在
os.makedirs(SAVE_DIR, exist_ok=True)


def get_all(endpoint):
    """
    从 WordPress REST API 分页获取数据
    endpoint: API 子路径，例如 "posts", "categories", "tags", "users", "media"
    return: 返回所有数据的列表
    """
    items = []
    page = 1
    while True:
        r = requests.get(f"{API_URL}/{endpoint}", params={"per_page": 100, "page": page})
        if r.status_code != 200:
            print(f"⚠️ 请求失败: {endpoint}, 状态码 {r.status_code}")
            break
        data = r.json()
        if not data:  # 没有更多数据，退出循环
            break
        items.extend(data)
        page += 1
    return items


def sanitize_filename(filename: str) -> str:
    """
    清理文件名中不合法的字符，避免保存失败
    """
    return re.sub(r'[\\/*?:"<>|]', "_", filename)


def main():
    print("🔍 获取分类和标签...")
    categories = {c["id"]: c["name"] for c in get_all("categories")}
    tags = {t["id"]: t["name"] for t in get_all("tags")}

    print("🔍 获取作者信息...")
    authors = {a["id"]: a["name"] for a in get_all("users")}

    print("🔍 获取文章...")
    posts = get_all("posts")

    print("🔍 获取媒体（特色图片）...")
    media = {m["id"]: m["source_url"] for m in get_all("media")}

    # 初始化 HTML → Markdown 转换器
    h = html2text.HTML2Text()
    h.ignore_links = False  # 保留超链接

    for post in posts:
        post_id = post["id"]
        title = post["title"]["rendered"]
        date = post["date"]
        content_html = post["content"]["rendered"]

        # 转换 HTML → Markdown
        content_md = h.handle(content_html)

        # 分类和标签
        post_categories = [categories.get(cid, "未分类") for cid in post["categories"]]
        post_tags = [tags.get(tid, f"tag-{tid}") for tid in post["tags"]]

        # 作者信息
        author_name = authors.get(post["author"], "未知作者")

        # 特色图片（如果有）
        featured_image = None
        if post.get("featured_media"):
            featured_image = media.get(post["featured_media"], None)

        # front matter
        front_matter = {
            "id": post_id,
            "title": title,
            "date": date,
            "author": author_name,
            "categories": post_categories,
            "tags": post_tags
        }
        if featured_image:
            front_matter["featured_image"] = featured_image

        # 组合 front matter 和正文
        md_content = f"---\n{yaml.dump(front_matter, allow_unicode=True)}---\n\n{content_md}"

        # 用中文标题作为文件名
        safe_title = sanitize_filename(title)
        filename = os.path.join(SAVE_DIR, f"{safe_title}.md")

        with open(filename, "w", encoding="utf-8") as f:
            f.write(md_content)

        print(f"✅ 已保存: {filename}")


if __name__ == "__main__":
    main()
