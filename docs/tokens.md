# 设计令牌 Design Tokens

所有令牌在 `src/styles/tokens.css` 定义。覆写 `:root` 或任意祖先元素的 CSS 变量即可定制。

## 主题切换

```html
<html data-theme="light" data-theme-mode="porcelain" data-accent="rose" data-density="comfortable">
```

| 属性 | 可选值 |
|---|---|
| `data-theme` | `light`（默认） \| `dark` |
| `data-theme-mode` | 当前模式名，例如 `light` / `dark` / `system` / 自定义模式名 |
| `data-accent` | `rose` \| `sky` \| `coral` \| `mint` \| `violet` \| `amber` |
| `data-density` | `compact` \| `comfortable` \| `spacious` |

## 色彩令牌

### 表面 Surface
| Token | Light | Dark |
|---|---|---|
| `--bg` | `#e8eef5` | `#1b2030` |
| `--bg-raised` | `#edf2f8` | `#242a3c` |
| `--bg-sunken` | `#dde4ed` | `#151a27` |
| `--fg` | `#3a4558` | `#d8deeb` |
| `--fg-muted` | `#7b8599` | `#8b94ab` |
| `--fg-subtle` | `#9ca7ba` | `#5f6a82` |

### 强调 Accent
当前主题色族（随 `data-accent` 变化）：
- `--accent` — 主体
- `--accent-ink` — 深色变体（用于文字 / 图标）
- `--accent-soft` — 淡色变体（用于柔和背景）
- `--accent-glow` — 发光变体（半透明）

### 语义
| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--info` | `oklch(68% 0.14 235)` | `oklch(78% 0.12 235)` | 信息蓝 |
| `--success` | `oklch(68% 0.14 150)` | `oklch(78% 0.14 150)` | 成功绿 |
| `--warning` | `oklch(75% 0.14 75)` | `oklch(82% 0.14 75)` | 警告黄 |
| `--danger` | `oklch(64% 0.18 25)` | `oklch(76% 0.16 25)` | 危险红 |

## 阴影系统

拟态核心。所有阴影由 `--shadow-dark` 和 `--shadow-light` 两种颜色组合而成。
组件优先消费语义阴影 token,旧的 `--neu-*` token 继续保留做兼容。

| Token | 作用 |
|---|---|
| `--neu-shadow-subtle` | 轻微边缘/低强调表面 |
| `--neu-shadow-control` | 按钮、可点击控件 |
| `--neu-shadow-panel` | 卡片、面板 |
| `--neu-shadow-lift` | hover 或高层级凸起 |
| `--neu-shadow-inset` | 小凹陷 |
| `--neu-shadow-inset-strong` | 标准凹陷 |
| `--neu-shadow-float` | 浮层阴影 |
| `--neu-out` | 标准凸起 |
| `--neu-out-sm` | 小凸起 |
| `--neu-out-lg` | 大凸起 |
| `--neu-in` | 标准凹陷 |
| `--neu-in-sm` | 小凹陷 |
| `--neu-flat` | 微凸（仅 1px 光边） |
| `--shadow-scale` | 整体阴影距离/模糊缩放 |
| `--shadow-float-scale` | 浮层阴影额外缩放 |

### 强度调节

通过 `--d` 乘数统一缩放,也可以用 `--shadow-scale` / `--shadow-float-scale` 做主题级微调：

```css
.app { --d: 0.8; }  /* 更柔和 */
.app { --d: 1.2; }  /* 更夸张 */
.app { --shadow-scale: 0.9; --shadow-float-scale: 1.15; }
```

## 圆角 Radius

| Token | 值 |
|---|---|
| `--r-xs` | `8px` |
| `--r-sm` | `12px` |
| `--r-md` | `16px` |
| `--r-lg` | `20px` |
| `--r-xl` | `28px` |
| `--r-pill` | `999px` |

## 间距 Spacing

`--gap-1` (4) · `--gap-2` (8) · `--gap-3` (12) · `--gap-4` (16) · `--gap-5` (20) · `--gap-6` (24) · `--gap-8` (32) · `--gap-10` (40)

## 控件尺寸 Control Size

| Token | Comfortable | Compact | Spacious |
|---|---|---|---|
| `--ctrl-h` | 40px | 34px | 46px |
| `--ctrl-pad-x` | 18px | 14px | 22px |

固定尺寸变体也有独立 token,方便局部主题覆写：

| Token | 默认值 | 用途 |
|---|---|---|
| `--ctrl-h-sm` | `30px` | 小号按钮 / Select |
| `--ctrl-h-lg` | `52px` | 大号按钮 |
| `--field-h-sm` | `32px` | 小号输入类控件 |
| `--field-h-lg` | `48px` | 大号输入类控件 |
| `--ctrl-pad-x-sm` | `12px` | 小号控件横向内边距 |
| `--ctrl-pad-x-lg` | `24px` | 大号控件横向内边距 |

## 动效 Motion

| Token | 值 |
|---|---|
| `--ease` | `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| `--dur-fast` | `140ms` |
| `--dur` | `220ms` |
| `--dur-slow` | `360ms` |

## 字体 Typography

| Token | 值 |
|---|---|
| `--font-sans` | 系统无衬线栈（SF Pro / Segoe UI …） |
| `--font-mono` | `ui-monospace, "SF Mono", "JetBrains Mono", Consolas, monospace` |
| `--font-display` | SF Pro Display 或回退 sans |
| `--fs-xs` | `11px` |
| `--fs-sm` | `12px` |
| `--fs-md` | `13px` |
| `--fs-lg` | `14px` |
| `--fs-xl` | `15px` |

## 自定义示例

```css
/* 全局品牌定制 */
:root {
  --accent: oklch(70% 0.18 180);
  --accent-ink: oklch(45% 0.15 180);
  --r-md: 12px;
  --d: 0.85;
}

/* 局部定制：在某个面板里使用更小的阴影 */
.compact-zone { --d: 0.6; --ctrl-h: 30px; }
```
