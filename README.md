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

本项目已经准备了 `gh-pages` 分支，推荐直接从该分支发布静态网页。

到仓库：

```text
Settings -> Pages -> Build and deployment -> Source
```

选择：

```text
Deploy from a branch
Branch: gh-pages
Folder: / (root)
```

保存后等待 1-3 分钟，公网访问地址通常是：

```text
https://59lovelysunny.github.io/AIGameforGrade8/
```
