# 验证记录

日期：2026-10-18（Asia/Taipei）。以下为本次本地实际执行的结果。

## 环境与构建

- macOS，Node.js 24.21.0，npm 11.19.0。
- `npm install` 成功；锁文件已生成。
- `npm run typecheck` 成功。
- 最终 `npm run build` 成功：TypeScript 检查通过，Vite 转换 2,159 个模块并输出 `dist/`。
- 开发页面 `http://127.0.0.1:5173/` 返回 HTTP 200。
- 生产预览 `http://127.0.0.1:4173/` 返回 HTTP 200，并在 Google Chrome 中实际渲染成功。
- 生产页面初始相机为 `[16.80, 1.70, 24.00]`，运行时错误为空；资源加载记录中的外部 origin 数为 0。

构建仍有包大小提示：Three.js 分块约 704.15 kB，应用分块约 537.81 kB（未压缩）。它们不是构建错误；本次没有通过调高阈值隐藏提示。

## Chrome 交互检查：21 / 21 通过

测试使用独立的 Google Chrome 会话，桌面视口 1440 × 900，窄屏视口 390 × 844。

| 检查 | 结果 |
| --- | --- |
| WebGL 画面就绪，初始机位正确 | 通过 |
| Low 画质切换与渲染 | 通过 |
| High 画质切换与渲染 | 通过 |
| Medium 画质切换与渲染 | 通过 |
| 傍晚光照切换 | 通过 |
| 雨量 0% | 通过 |
| 雨量 100% | 通过 |
| 雨量键盘细调至 99% | 通过 |
| Cinematic 相机实际产生位移 | 通过 |
| 从 Cinematic 恢复初始机位 | 通过 |
| 鼠标拖动实际改变相机 | 通过 |
| 滚轮实际改变距离 | 通过 |
| 重置后清除旋转、缩放残余惯性 | 通过 |
| 持续按 W 前进并在店铺边界停止 | 通过 |
| H 进入隐藏界面的摄影模式 | 通过 |
| Escape 恢复界面 | 通过 |
| PNG 实际下载并保存为本地文件 | 通过 |
| 主动开启雨声 | 通过 |
| 雨声静音 | 通过 |
| 390 px 窄屏设置面板完整落在视口内 | 通过 |
| 检查期间无运行时或 Shader 编译错误 | 通过，0 个错误 |

碰撞检查的最终相机位置为 `[-0.36, 1.70, -1.00]`，位于店铺前方安全边界。PNG 导出已实际打开检查，具有真实场景内容且不含 HTML 界面。

逐项原始结果：`output/playwright/results.json`。执行日志：`output/playwright/browser-check.log`。

## 已保存的截图

- `output/playwright/01-night-medium.png`：初始雨夜及界面。
- `output/playwright/quality-low.png`、`quality-medium.png`、`quality-high.png`：三档实际渲染。
- `output/playwright/02-dusk.png`：傍晚模式。
- `output/playwright/03-close-storefront.png`：接近便利店后的三维室内视野。
- `output/playwright/04-photography-mode.png`：摄影模式。
- `output/playwright/05-exported-photograph.png`：通过产品截图按钮下载的 PNG。
- `output/playwright/06-mobile.png`、`07-mobile-settings.png`：窄屏布局。
- `output/playwright/08-production.png`：生产构建的实际 Chrome 画面。

这些截图是运行中的 WebGL 场景截帧，不是场景输入素材。该输出目录默认被 Git 忽略。

## 修复与验证边界

本次检查中修复了相机重置后的残余轨道阻尼，以及开发热更新时雨声 AudioContext 的关闭与重建问题。最终上述浏览器检查从页面重新加载后执行并全部通过。

尚未进行 Intel MacBook 真机基准、长时间 GPU 内存压力测试、Safari / Firefox 兼容性测试、自动降级分支的强制性能测试或手机真机触摸测试。390 px 检查是在桌面 Chrome 中改变视口尺寸，不等同于手机真机测试。合成雨声开关已验证；音色和响度仍属于主观听感，不作为自动化通过项。
