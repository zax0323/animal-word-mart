# 小动物单词超市 — 产品需求文档 (PRD)

> **项目名称**：小动物单词超市 (Animal Word Mart)
> **类型**：纯前端 HTML5 网页小游戏
> **目标用户**：3-8 岁英语启蒙儿童（家长陪同使用）
> **部署方式**：GitHub Pages 静态托管（发链接即玩，无需安装）

---

## 一、产品概述

一款面向幼儿的英语单词学习游戏。小朋友扮演"超市理货员"，听小动物顾客说出需要购买的物品，从 4 个选项中选出正确对应的食物/物品图片。游戏覆盖 10 个食物单词、3 个小动物角色，共 6 轮问答。

---

## 二、游戏流程

```
首页 ──点击"开始游戏"──▶ 第 1 轮 ──▶ 第 2 轮 ──▶ …… ──▶ 第 6 轮 ──▶ 结算页
                            │                                          │
                            └── 14 秒倒计时，选对加分，选错扣 3 秒 ──────┘
                                                       └── 超时自动下一轮
```

### 2.1 首页
- 展示背景图 + 游戏标题 + "开始游戏"按钮
- 自动播放背景音乐（点击页面后取消静音）

### 2.2 游戏轮次
- 每轮随机选择一个角色和一个需求模板
- 角色头顶对话框显示需求语句，例如 *"I want some bread."*
- 下方展示 4 个食物选项（1 个正确答案 + 3 个干扰项），点击选择
- 14 秒倒计时进度条
- 选对 → 角色变开心表情，0.9 秒后进入下一轮
- 选错 → 角色变难过表情，倒计时扣 3 秒，0.9 秒后进入下一轮
- 超时 → 视为失败，自动下一轮

### 2.3 结算页
- 显示"已完成 6 轮"提示
- "再来一次"按钮 → 重新开始
- "返回首页"按钮 → 回到首页

---

## 三、文件结构

```
animal-word-mart/
├── index.html              # 入口 HTML（Tailwind CDN + 样式 + 脚本引用）
├── app.js                  # 全部游戏逻辑（约 480 行）
├── styles.css              # 备用样式（未使用，样式已内联到 HTML）
├── PRD.md                  # 本产品需求文档
├── ASSET_GUIDE.md          # 素材制作说明
├── README.md               # 项目说明
└── assets/
    ├── audio/
    │   └── bgm.mp3         # 背景音乐（已压缩至 1.26MB，30 秒循环）
    ├── backgrounds/
    │   └── game-scene.jpg  # 游戏场景背景（压缩后 72KB）
    ├── characters/
    │   ├── rabbit.png       # 兔子普通表情
    │   ├── rabbit-happy.png # 兔子开心表情
    │   ├── rabbit-sad.png   # 兔子难过表情
    │   ├── cat.png
    │   ├── cat-happy.png
    │   ├── cat-sad.png
    │   ├── dog.png
    │   ├── dog-happy.png
    │   └── dog-sad.png      # 3 个角色 × 3 种表情 = 9 张图
    ├── foods/
    │   ├── bread.png
    │   ├── cake.png
    │   ├── candy.png
    │   ├── cheese.png
    │   ├── cookie.png
    │   ├── donut.png
    │   ├── egg.png
    │   ├── ice cream.png    # 注意文件名含空格，引用时需编码为 ice%20cream.png
    │   ├── milk.png
    │   └── pizza.png        # 10 种食物图片
    ├── home/
    │   └── home-hero.jpg    # 首页背景图（压缩后 103KB）
    └── dialog-bubble.png    # 对话气泡图片
```

---

## 四、素材需求清单

### 4.1 必须提供的图片资源

| 素材 | 数量 | 推荐尺寸 | 格式 | 说明 |
|------|------|---------|------|------|
| 首页背景 | 1 | 1200×1200px | JPG | 明亮可爱的超市场景 |
| 游戏背景 | 1 | 1200×670px | JPG | 超市货架/室内场景 |
| 角色-普通 | 3 | 200×200px | PNG 透明底 | 兔子、猫、狗的站姿正面 |
| 角色-开心 | 3 | 200×200px | PNG 透明底 | 同一个角色的笑脸表情 |
| 角色-难过 | 3 | 200×200px | PNG 透明底 | 同一个角色的委屈表情 |
| 食物图片 | 10 | 300×300px | PNG 透明底 | 面包、蛋糕、糖果等 |
| 对话气泡 | 1 | 自定 | PNG 透明底 | 角色说话的气泡框 |

### 4.2 音乐资源

| 素材 | 数量 | 格式 | 大小建议 | 说明 |
|------|------|------|---------|------|
| 背景音乐 | 1 首 | MP3 | ≤ 1.5MB | 轻快可爱风格，30-60 秒循环 |

### 4.3 占位与降级策略
- 图片未就绪时：代码内置渐变背景 + emoji 占位符，游戏照常运行
- 每个图片都配置了 `fallbackEmoji`，图片加载失败时自动显示 emoji

---

## 五、代码实现范围

以下全部由前端代码实现，不需要额外资源：

### 5.1 逻辑层 (app.js ~480 行)
- `gameAssets` — 图片资源的路径配置
- `characters` 数组 — 3 个角色的 id/名称/图片路径/fallback emoji
- `foods` 数组 — 10 种食物的 id/英文/中文/图片路径
- `demandTemplates` — 5 种需求句式模板
- `state` — 游戏状态管理（轮数/分数/倒计时/选中食物等）
- `shuffle / pickRandom / pickMany` — 随机工具函数
- `buildRoundData()` — 每轮生成：随机角色 + 随机模板 + 4 个选项
- `startTimer / runTimer / stopTimer` — 14 秒倒计时逻辑
- `toggleFoodSelection / isSelectionMatch` — 点击选择和答案校验
- `handleRoundSuccess / handleRoundFailure / handleRoundTimeout` — 轮次结果处理
- `renderHome / renderGame / renderSummary` — 三个页面的 DOM 渲染
- `render()` — 统一入口，根据 state.screen 分发渲染

### 5.2 HTML/CSS (index.html)
- **Tailwind CSS CDN** 引入（无需预构建）
- 自定义像素风格按钮样式
- 首屏加载后立即执行 JS 渲染全部 UI

### 5.3 部署和分发
- 已部署在 `https://zax0323.github.io/animal-word-mart/`
- 纯静态页面，无需后端、无需数据库、无需 build 步骤
- 发给任何人一个网址即可打开

---

## 六、制作流程

### 阶段 1：准备素材
1. 角色图片：AI 绘图或插画师绘制 3 个可爱动物角色，每种 3 个表情
2. 食物图片：透明背景食物素材，200-300px
3. 背景图：超市/货架风格背景
4. 音频：免版税儿童背景音乐，剪辑到 30 秒左右，比特率 ≤ 128kbps

### 阶段 2：压缩素材（⚠️ 关键步骤，最容易踩坑）

> **原始图片可能高达 3-5MB/张，必须压缩才能让网页秒开！**

推荐工具：
- **sharp** (Node.js) — 批量 PNG 压缩 + 尺寸缩放
- **TinyPNG** (tinypng.com) — 在线 PNG 压缩
- **FFmpeg** — MP3 降比特率

压缩策略：
- 背景类大图 → **JPG 80% 质量**，缩放到 ≤1200px 宽
- 角色图 → **PNG-8 256 色**，缩放到 ≤200px，单张 ≤10KB
- 食物图 → **PNG-8 256 色**，缩放到 ≤300px，单张 ≤150KB
- BGM → 比特率 ≤128kbps，时长 ≤30s，大小 ≤1.5MB

效果参考（本项目实际数据）：
```
食物图片 10 张：37MB → 1.3MB（-97%）
角色图片 9 张：3.3MB → 76KB（-98%）
首页背景 1 张：4MB → 103KB（-97%）
游戏背景 1 张：1.7MB → 72KB（-96%）
总大小：~51MB → ~1.7MB
```

### 阶段 3：开发
1. 搭建 HTML 骨架 — Tailwind CDN + 像素风 CSS
2. 实现游戏引擎 (app.js) — 数据定义 → 工具函数 → 轮次逻辑 → 渲染
3. 裁剪图片路径 — 将图片路径与代码关联
4. 本地测试 — 直接用浏览器打开 index.html

### 阶段 4：部署 (GitHub Pages)
1. 创建 GitHub 仓库，push 代码到 main 分支
2. 创建 gh-pages 分支：`git push origin HEAD:gh-pages`
3. 仓库 Settings → Pages → 选择 gh-pages 分支 + / root 目录 → Save
4. 等待 1-2 分钟，访问 `https://用户名.github.io/仓库名/`

---

## 七、关键细节与注意事项

### 7.1 编码问题（⚠️ 本项目实际踩过的坑）
- JS / HTML 文件**必须是 UTF-8 无 BOM 编码**
- PowerShell 的 `Set-Content` 默认 GBK 编码，**不要用**它保存 JS 文件
- 中文字符被截断 → JS 语法错误 → 页面白屏，**没有报错提示**
- 推荐用 Node.js 的 `fs.writeFile()` 或 VS Code 手动保存

### 7.2 图片格式选择
| 场景 | 推荐格式 | 原因 |
|------|---------|------|
| 大尺寸背景 | JPG | PNG 无损压缩效果差 |
| 带透明底的图标/角色 | PNG-8 | 需要透明通道，调色板量化可大幅缩小 |
| 有渐变/纹理的小图 | PNG-24 | 颜色丰富时用，但要控制尺寸 |

### 7.3 路径大小写
- GitHub Pages **区分文件名大小写**
- 文件名含空格（如 `ice cream.png`），代码中引用要用 `ice%20cream.png`

### 7.4 性能优化
- **总资源包 ≤ 3MB**：所有图片 + 音乐加总应控制在 3MB 以内
- BGM 初始 muted，用户点击后才 unmute，符合浏览器自动播放策略
- 图片文件过多时考虑 `loading="lazy"`

### 7.5 浏览器兼容
- Tailwind CDN 支持所有现代浏览器
- 使用 ES6+ 特性（async/await、forEach 等），不支持 IE

### 7.6 部署注意事项
- Push 后需要等待 **1-2 分钟** GitHub Pages 构建
- 构建期间访问可能是 404 或空页面，属正常现象
- 同一 commit 推到 main 不会触发 Pages 重新构建，必须推 gh-pages

### 7.7 可扩展性
- 增加角色：往 characters 数组加一个对象 + 3 张图
- 增加食物：往 foods 数组加一个对象 + 1 张图
- 增加句式模板：往 demandTemplates 数组加一个模板字符串
- 调整轮数：修改 state.totalRounds（当前为 6）

---

## 八、技术栈总结

| 层面 | 技术选型 |
|------|---------|
| 框架 | 无（原生 JS）|
| CSS | Tailwind CSS (CDN) + 自定义像素风 CSS |
| 图标/占位 | Unicode Emoji |
| 构建 | 无（纯静态）|
| 部署 | GitHub Pages |
| 编码 | UTF-8 no BOM |
| 音频 | HTML5 Audio API |
| 图片处理 | sharp (Node.js) / TinyPNG |

---

## 九、游戏核心数据模型

```
state = {
  screen: "home" | "game" | "summary",
  totalRounds: 6,
  round: 1,
  score: 0,
  currentRound: {
    character: { id, name, image, happyImage, sadImage, fallbackEmoji, anchor },
    demandText: "I want some bread.",
    correctFood: { id, word, zh, image },
    options: [{ id, word, zh, image }, ...]  // 4 项
  },
  selectedFoods: [],
  timeLeft: 14,
  timerSeconds: 14,
  feedback: null | { type: "success"|"error", text: "..." }
}
```
