# Obsidian Timeflow Starter

这是一个面向初学者的 Obsidian 插件起步项目，适合你从 0 开始做“日历 / 时间流任务管理”类插件。

## 这个 starter 已经包含
- 自定义侧边栏视图（Timeflow）
- 命令面板入口
- Ribbon 图标入口
- 插件设置页
- 新增 / 完成 / 删除任务
- 使用 `saveData()` / `loadData()` 保存到插件自己的 `data.json`

## 推荐你的开发顺序
1. 先让这个项目跑起来
2. 改标题、命令名称、样式
3. 把任务数据模型改成你自己的习惯
4. 再接入每日笔记 / note properties / Dataview / 外部日历

## 本地启动
1. 安装 Node.js 和 Git
2. 打开一个单独的测试 vault
3. 把本项目放到：
   `.obsidian/plugins/timeflow-starter/`
4. 在项目目录运行：
   `npm install`
5. 启动监听编译：
   `npm run dev`
6. 打开 Obsidian → 设置 → 第三方插件 → 启用本插件

## 你下一步最值得改的地方
- `src/main.ts` 里的 `TimeflowTask`：改成你的任务字段
- `AddTaskModal`：改成你的录入表单
- `TimeflowView.render()`：改成你喜欢的时间流布局
- `TimeflowSettingTab`：加上每日笔记文件夹、默认标签、自动排序等设置

## 第二阶段建议
- 把任务同步到每日笔记
- 支持拖拽调整时间块
- 支持任务重复规则
- 支持统计“专注时长 / 习惯打卡”
- 接入 SecretStorage 存储第三方 API token
