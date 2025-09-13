
"""
发布文章.py
此脚本用于将本地 Markdown 文件批量转换为 HTML 并发布到 WordPress 网站。
主要功能：
1. 从指定文件夹读取 Markdown 文件；
2. 提取 YAML front matter 元数据（标题、分类、标签）；
3. 使用 Python-Markdown 转换 Markdown 为 HTML，并支持代码高亮、目录等扩展；
4. 通过 WordPress XML-RPC API 自动发布文章；此方案其实已经过时了。
官方推荐 WordPress REST API（/wp-json/wp/v2/...）来进行文章发布、修改、获取等操作。
5. 发布成功后将已处理的 Markdown 文件移动到备份目录；
6. 日志记录整个过程，便于排查问题。

依赖：
- python-dotenv 读取环境变量
- markdown 进行 Markdown 转换
- pygments 代码高亮
- pyyaml 解析 front matter
- logging 记录日志

使用方法：
1. 在项目根目录下创建 .env 文件，配置 WP_URL、WP_USER、WP_PASSWORD；
2. 将待发布的 Markdown 文件放入 “./markdown files inventory” 文件夹；
3. 运行此脚本，成功发布后，文件会被移动到 backup 文件夹。
"""