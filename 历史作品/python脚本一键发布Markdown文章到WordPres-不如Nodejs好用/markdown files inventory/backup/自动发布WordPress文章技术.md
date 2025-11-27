

好，下面是一步步教你如何把这个项目设置成 GitHub 仓库，并让它能自动同步到你的 WordPress。！！！！

------

## ✅ 步骤总览单独的

1. 创建 GitHub 仓库
2. 上传打包的项目文件
3. 设置 GitHub Secrets（保存 WordPress 凭据）
4. 提交并触发自动部署
5. 以后你只需要改 `.md` 文件并 push，文章就会自动更新！

------

## 🧱 第 1 步：创建 GitHub 仓库

1. 打开 https://github.com/new
2. 填写：
   - **Repository name**：比如 `wp-markdown-sync`
   - **Visibility**：建议选 Private（私有）
3. 点击 “Create repository”

------

## 📤 第 2 步：上传项目

### 方式 1：在 GitHub 网站上传 ZIP 解压后的文件

1. 解压你刚刚下载的 `wp-markdown-sync.zip`
2. 进入仓库主页 → 点击 “Add file” → “Upload files”
3. 拖拽所有文件进去，点 Commit 上传

------

### 方式 2：用 Git 命令上传（推荐）

假设你已经安装了 Git：

```
bash複製編輯# 解压文件
unzip wp-markdown-sync.zip
cd wp-markdown-sync

# 初始化 Git 仓库
git init
git remote add origin https://github.com/YOUR_USERNAME/wp-markdown-sync.git
git add .
git commit -m "初始化自动发布项目"
git push -u origin master
```

⚠️ 请把 `YOUR_USERNAME` 和仓库名换成你自己的。

------

## 🔐 第 3 步：设置 GitHub Secrets

1. 打开你的仓库页面
2. 点击菜单栏：`Settings` → 左侧选择 **Secrets and variables** → 选择 **Actions**
3. 点击 `New repository secret`，添加下面 3 个变量：

| Name              | Value（示例）                 |
| ----------------- | ----------------------------- |
| `WP_URL`          | `https://haoyelaiga.com`      |
| `WP_USER`         | `your-wp-username`            |
| `WP_APP_PASSWORD` | `your-generated-app-password` |



------

## ✅ 第 4 步：试运行一次

1. 在 `content/` 目录下写一篇 `.md` 文件，带上 `title`、`slug`

2. commit 并 push：

   ```
   bash複製編輯git add .
   git commit -m "新增一篇文章"
   git push
   ```

3. 打开 GitHub → Actions → 查看运行日志（会自动部署）

------

## 🖊️ 以后怎么更新文章？滴滴滴滴

只需要：

- 编辑本地 `.md` 文件内容

- 执行：

  ```
  bash複製編輯git add .
  git commit -m "更新文章"
  git push
  ```

GitHub 会自动调用脚本更新 WordPress 文章，后台都不用登录！



是的，**当前脚本确实是每次都遍历 `content/` 文件夹下的所有 Markdown 文件**，并对每篇文章执行发布或更新操作。

### ❗存在的问题：

目前脚本不会判断文章是否真的有变动，也不会判断你是否真的修改了某篇文章的内容。因此。

- **即使文章没有改动**，只要你 push，它就会重新上传；
- 如果文章很多，会浪费时间和 API 请求次数；
- WordPress REST API 不会因为重复内容而报错，但每次都会更新“修改时间”（updated date）。

------

## ✅ 如何优化：只上传有改动的文章？

我们可以通过两种方式改进：

------

### 方式 1：用 Git diff 检查哪些 `.md` 文件有改动（推荐 ✅）

这个思路是：

- GitHub Actions 运行时，对比当前和上次提交；
- **只处理那些本次 commit 中被修改过的 Markdown 文件**。

#### ✅ 修改 deploy.js → 只处理 Git 改动的文件：

我们在 GitHub Actions 的 shell 中先运行这个命令，生成一个文件列表：

```
yaml複製編輯- name: Get changed files
  id: files
  run: |
    git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep '\.md$' || true > changed-files.txt
```

然后再把 `deploy.js` 改成只读取 `changed-files.txt`：

```
js複製編輯const changedFiles = fs.readFileSync('changed-files.txt', 'utf-8')
  .split('\n')
  .filter(f => f && f.endsWith('.md'));

for (const file of changedFiles) {
  await publishPost(file);
}
```





### ✅ 本次更新内容：

1. **GitHub Actions 自动获取有变动的 `.md` 文件**；
2. `deploy.js` 读取 `changed-files.txt`，只处理被修改的文章；
3. 如果没有 Markdown 被修改，自动跳过部署。

------

### 下一步建议：

- 将新版文件上传到你的 GitHub 仓库；
- Push 后，只会自动同步你修改过的文章；
- 想手动触发也可直接 commit 再 push（只要改了 `.md` 文件）。

如需支持“删除文章”、“草稿状态”、“支持标签分类”，也可以继续告诉我。