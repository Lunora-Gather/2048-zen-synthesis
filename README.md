<div align="center">

# 2048

**经典数字合并游戏的精致网页版实现。**  
支持多棋盘尺寸、主题切换、音效预设、撤销、成就、统计与移动端滑动操作。

[![HTML5](https://img.shields.io/badge/HTML5-Static-E34F26?style=flat-square&logo=html5&logoColor=white)](#技术栈)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572B6?style=flat-square&logo=css3&logoColor=white)](#技术栈)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=111111)](#技术栈)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-222222?style=flat-square&logo=github&logoColor=white)](https://lunora-gather.github.io/2048/)

[在线游玩](https://lunora-gather.github.io/2048/) · [项目结构](#项目结构) · [本地运行](#本地运行)

</div>

---

## 项目简介

**2048** 是一个纯前端网页版数字合并游戏。玩家通过方向键或触摸滑动移动棋盘，让相同数字合并成更大的数字，并在有限空间内挑战更高分数。

这个版本在经典玩法上做了更完整的网页游戏包装：界面更精致，反馈更明确，并补充了多棋盘尺寸、撤销、成就、音效、主题和移动端体验优化。

---

## 核心功能

| 模块 | 内容 |
| --- | --- |
| **经典规则** | 标准 2048 移动、合并、胜利与失败判断 |
| **棋盘尺寸** | 支持 `4 × 4`、`5 × 5`、`6 × 6` |
| **操作方式** | 电脑端方向键，移动端触摸滑动 |
| **撤销机制** | 支持撤销上一步操作，并保留多步历史状态 |
| **数据统计** | 当前分数、最高分、最大方块、步数和游戏时间 |
| **视觉主题** | Purple、Classic、Fresh、Minimal 多套主题 |
| **显示模式** | 支持浅色 / 深色模式切换 |
| **音效预设** | Default Sound、Electronic、Retro、Mechanical |
| **成就系统** | First Merge、Reach 64、Reach 512、Reach 2048 |
| **活动抽屉** | 集中展示成就状态和操作日志 |
| **页面优化** | 无 JavaScript 提示、可访问性标签、移动端适配 |

---

## 操作方式

| 操作 | 电脑端 | 手机端 |
| --- | --- | --- |
| 向上移动 | `↑` | 向上滑动 |
| 向下移动 | `↓` | 向下滑动 |
| 向左移动 | `←` | 向左滑动 |
| 向右移动 | `→` | 向右滑动 |
| 重新开始 | `Restart Grid` | `Restart Grid` |
| 撤销一步 | `Undo Step` | `Undo Step` |
| 切换棋盘大小 | 棋盘尺寸选择框 | 棋盘尺寸选择框 |
| 切换主题 | 主题选择框 | 主题选择框 |
| 开关音效 | 音量按钮 | 音量按钮 |

---

## 本地运行

项目是纯静态网页，可以直接打开 `index.html`。更推荐使用本地静态服务器运行：

```bash
git clone https://github.com/Lunora-Gather/2048.git
cd 2048
npx -y http-server -p 8080 -c-1
```

然后访问：

```text
http://localhost:8080
```

也可以使用 VS Code 的 Live Server 或任意 HTTP 静态服务器。

---

## 项目结构

```text
.
├── .nojekyll              # GitHub Pages 静态发布标记
├── index.html             # 页面结构、SEO 信息、资源引用和游戏容器
├── style.css              # 主视觉样式、棋盘、方块、按钮、弹窗和响应式布局
├── optimizations.css      # 移动端、滚动区域、可访问性和细节优化
├── script.js              # 游戏规则、移动合并、计分、撤销、音效、存档和成就
├── optimizations.js       # 非侵入式运行时优化和辅助功能增强
├── OPTIMIZATION_REPORT.md # 优化记录
└── README.md              # 项目说明
```

---

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 页面结构 | HTML5 |
| 样式 | CSS3 |
| 游戏逻辑 | Vanilla JavaScript |
| 图标 | Font Awesome |
| 字体 | Google Fonts |
| 音效 | Web Audio API |
| 部署 | GitHub Pages |

---

## 设计取向

- **清晰**：棋盘是视觉中心，分数、设置和操作区保持轻量。
- **精致**：用主题、卡片、渐变、字体层级和动效提升完成度。
- **易玩**：键盘与触摸操作都能直接上手。
- **轻量**：不依赖前端框架，也不需要额外构建流程。

---

## 后续优化方向

- 拆分 `script.js`，让状态、渲染、输入、音效模块更清晰；
- 增加自动化测试，覆盖移动、合并、胜负判断和撤销逻辑；
- 继续优化小屏手机与横屏设备布局；
- 增加更多游戏设置，例如动画强度、音量控制和背景效果开关。

---

## License

当前仓库暂未声明许可证。如需公开复用或二次分发，建议后续补充明确的开源许可证。
