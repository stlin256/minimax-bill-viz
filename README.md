<!-- omit in toc -->
<div align="center">
  <img src="https://img.shields.io/github/stars/stlin256/minimax-bill-viz?style=flat&color=ec4899" alt="stars">
  <img src="https://img.shields.io/github/license/stlin256/minimax-bill-viz" alt="license">
  <img src="https://img.shields.io/github/deployments/stlin256/minimax-bill-viz/github-pages?style=flat" alt="deployment">

  <h1>MiniMax Bill Viz</h1>
  <p>✨ 优雅的 MiniMax 账单可视化工具</p>

  <a href="https://stlin256.github.io/minimax-bill-viz/">
    <img src="https://img.shields.io/badge/Live Demo-EC4899?style=for-the-badge" alt="Live Demo">
  </a>
</div>

---

## 📌 简介

MiniMax Bill Viz 是一款专为 MiniMax 用户打造的账单可视化工具。通过优雅的拖拽交互，帮助您直观地分析 API 调用费用、Token 消耗等核心数据。

## ✨ 特性

- 🎯 **拖拽上传** - 极简的拖拽式 CSV 文件导入
- 📊 **可视化图表** - 每日消费趋势一目了然
- 🎚️ **时间区间筛选** - 拖拽滑块精准分析任意时间段，双击快速选择单天
- 📈 **实时统计** - 总消费、Token 消耗、调用次数、单次调用成本实时计算
- 🔄 **小时/天视图** - 支持按天或按小时查看数据分布
- 📊 **Input vs Output** - 堆叠柱状图展示输入/输出 Token 消耗对比
- ⏰ **24小时分布** - 查看各时段 API 调用热度
- 🌙 **深色主题** - 护眼舒适的暗黑模式
- 📋 **数据表格** - 支持排序的分页数据展示
- 🎨 **现代 UI** - 流畅动画与精致光效

## 🚀 快速开始

### 在线使用

访问 [Live Demo](https://stlin256.github.io/minimax-bill-viz/) 即可直接使用。

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/stlin256/minimax-bill-viz.git
cd minimax-bill-viz

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 使用方法

1. 从 [MiniMax 账单中心](https://platform.minimaxi.com/user-center/payment/billing-history) 导出账单 CSV
2. 将 CSV 文件拖入页面或点击选择
3. 拖动底部时间滑块筛选分析区间，双击快速选择单天
4. 切换"按天/按小时"视图查看不同粒度数据

## 🛠️ 技术栈

<div align="center">
  <img src="https://skillicons.dev/icons?i=react&theme=dark" alt="React">
  <img src="https://skillicons.dev/icons?i=typescript&theme=dark" alt="TypeScript">
  <img src="https://skillicons.dev/icons?i=vite&theme=dark" alt="Vite">
  <img src="https://skillicons.dev/icons?i=echarts&theme=dark" alt="ECharts">
  <img src="https://skillicons.dev/icons?i=zustand&theme=dark" alt="Zustand">
</div>

## 📄 许可证

[MIT License](./LICENSE)

---

<div align="center">
  <sub>Made with ❤️ by <a href="https://github.com/stlin256">stlin256</a></sub>
</div>
