# 设计令牌 Design Tokens

所有令牌在 `src/styles/tokens.css` 定义。覆写 `:root` 或任意祖先元素的 CSS 变量即可定制。

## 主题切换

```html
<html data-theme="light" data-accent="rose" data-density="comfortable">
```

| 属性 | 可选值 |
|---|---|
| `data-theme` | `light`（默认） \| `dark` |
| `data-accent` | `rose` \| `sky` \| `coral` \| `mint` \| `violet` \| `amber` |
| `data-density` | `compact` \| `comfortable` \| `spacious` |

## 色彩令牌

### 表面 Surface
| Token | Light | Dark |
|---|---|---|
| `--bg` | `#e7ebf3` | `#2a3142` |
| `--bg-raised` | `#eef1f7` | `#313a4f` |
| `--bg-sunken` | `#dde2ec` | `#232a38` |
| `--fg` | `#2a3248` | `#e8ecf4` |
| `--fg-muted` | `#6b7590` | `#a6b0c3` |
| `--fg-subtle` | `#9ba4bc` | `#6c7892` |

### 强调 Accent
当前主题色族（随 `data-accent` 变化）：
- `--accent` — 主体
- `--accent-ink` — 深色变体（用于文字 / 图标）
- `--accent-soft` — 淡色变体（用于柔和背景）
- `--accent-glow` — 发光变体（半透明）

### 语义
| Token | 用途 |
|---|---|
| `--info` | 信息蓝 |
| `--success` | 成功绿 |
| `--warning` | 警告黄 |
| `--danger` | 危险红 |

## 阴影系统

拟态核心。所有阴影由 `--shadow-dark` 和 `--shadow-light` 两种颜色组合而成。

| Token | 作用 |
|---|---|
| `--neu-out` | 标准凸起 |
| `--neu-out-sm` | 小凸起 |
| `--neu-out-lg` | 大凸起 |
| `--neu-in` | 标准凹陷 |
| `--neu-in-sm` | 小凹陷 |
| `--neu-flat` | 微凸（仅 1px 光边） |

### 强度调节

通过 `--d` 乘数统一缩放：

```css
.app { --d: 0.8; }  /* 更柔和 */
.app { --d: 1.2; }  /* 更夸张 */
```

## 圆角 Radius

| Token | 值 |
|---|---|
| `--r-xs` | `6px` |
| `--r-sm` | `10px` |
| `--r-md` | `16px` |
| `--r-lg` | `22px` |
| `--r-xl` | `32px` |

## 间距 Spacing

`--gap-1` (4) · `--gap-2` (8) · `--gap-3` (12) · `--gap-4` (20) · `--gap-5` (32)

## 控件尺寸 Control Size

| Token | Comfortable | Compact | Spacious |
|---|---|---|---|
| `--ctrl-h` | 40px | 32px | 48px |
| `--ctrl-pad-x` | 18px | 14px | 22px |

## 动效 Motion

| Token | 值 |
|---|---|
| `--ease` | `cubic-bezier(.22, 1, .36, 1)` |
| `--dur-fast` | `120ms` |
| `--dur` | `200ms` |
| `--dur-slow` | `360ms` |

## 字体 Typography

| Token | 值 |
|---|---|
| `--font-sans` | 系统无衬线栈（SF Pro / Segoe UI …） |
| `--font-mono` | `"SF Mono", "JetBrains Mono", Menlo, monospace` |
| `--font-display` | SF Pro Display 或回退 sans |

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
