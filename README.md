# AI 逻辑密室闯关抽题器

这是一个给游戏现场使用的随机抽题网页，题库来自“AI 逻辑密室闯关：校园梅花档案”100 题版本。

## 功能

- 随机抽题
- 点击查看/隐藏答案
- 30 秒倒计时
- 普通、挑战、终极关卡筛选
- 避免重复抽题
- 复制当前题目

## 本地预览

```bash
python -m http.server 8088
```

打开：

```text
http://127.0.0.1:8088/
```

## GitHub Pages

仓库推送到 `main` 分支后，GitHub Actions 会自动部署静态网页。

如果第一次部署没有生成页面，请到仓库：

```text
Settings -> Pages -> Build and deployment -> Source
```

选择 `GitHub Actions`，然后重新运行 `Deploy static site to GitHub Pages` 工作流。
