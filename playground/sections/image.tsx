import * as React from "react";
import { Icon, Image, ImageGrid, LayeredImage, SpriteImage } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionImage: React.FC<SectionCtx> = () => {
  const rng = (seed: number) => {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const hsl = (hue: number, sat = 72, light = 58) =>
    `hsl(${Math.round(hue % 360)}, ${sat}%, ${light}%)`;
  const mkSvg = (seed: number, label: string) => {
    const rand = rng(seed);
    const h1 = rand() * 360;
    const h2 = h1 + 60 + rand() * 120;
    const h3 = h1 + 180 + rand() * 100;
    const circles = Array.from({ length: 5 }, (_, index) => {
      const cx = Math.round(rand() * 420 - 10);
      const cy = Math.round(rand() * 320 - 10);
      const r = Math.round(28 + rand() * 86);
      const opacity = (0.18 + rand() * 0.36).toFixed(2);
      return `<circle cx='${cx}' cy='${cy}' r='${r}' fill='${hsl(h3 + index * 34, 84, 68)}' opacity='${opacity}'/>`;
    }).join("");
    const bars = Array.from({ length: 4 }, (_, index) => {
      const x = Math.round(rand() * 360 - 40);
      const y = Math.round(rand() * 250 - 20);
      const width = Math.round(110 + rand() * 180);
      const height = Math.round(18 + rand() * 42);
      const rotate = Math.round(-24 + rand() * 48);
      return `<rect x='${x}' y='${y}' width='${width}' height='${height}' rx='${Math.round(height / 2)}' fill='white' opacity='${(0.14 + rand() * 0.2).toFixed(2)}' transform='rotate(${rotate} 200 150)'/>`;
    }).join("");
    return (
      `data:image/svg+xml;utf8,` +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>
          <defs>
            <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0' stop-color='${hsl(h1, 86, 70)}'/>
              <stop offset='0.54' stop-color='${hsl(h2, 74, 58)}'/>
              <stop offset='1' stop-color='${hsl(h3, 68, 46)}'/>
            </linearGradient>
            <radialGradient id='r' cx='22%' cy='18%' r='70%'>
              <stop offset='0' stop-color='rgba(255,255,255,.78)'/>
              <stop offset='1' stop-color='rgba(255,255,255,0)'/>
            </radialGradient>
          </defs>
          <rect width='400' height='300' fill='url(%23g)'/>
          <rect width='400' height='300' fill='url(%23r)'/>
          ${circles}
          ${bars}
          <path d='M0 238 C82 196 146 308 226 250 C292 202 330 210 400 166 L400 300 L0 300 Z' fill='rgba(0,0,0,.18)'/>
          <text x='24' y='270' font-size='23' font-family='ui-sans-serif, system-ui, sans-serif' font-weight='800' fill='rgba(255,255,255,.88)' letter-spacing='3'>${label}</text>
        </svg>`
      )
    );
  };
  const images = Array.from({ length: 6 }, (_, index) => ({
    src: mkSvg(4200 + index * 37, `FAKE ${index + 1}`),
    alt: `Random color image ${index + 1}`,
  }));
  const mkIconSvg = (seed: number, mark: string) => {
    const rand = rng(seed);
    const h1 = rand() * 360;
    const h2 = h1 + 80 + rand() * 100;
    return (
      `data:image/svg+xml;utf8,` +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
          <defs>
            <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0' stop-color='${hsl(h1, 88, 72)}'/>
              <stop offset='1' stop-color='${hsl(h2, 78, 48)}'/>
            </linearGradient>
          </defs>
          <rect x='5' y='5' width='54' height='54' rx='15' fill='url(%23g)'/>
          <circle cx='18' cy='18' r='13' fill='rgba(255,255,255,.22)'/>
          <path d='M46 8 L59 34 L36 59 L14 46 Z' fill='rgba(0,0,0,.14)'/>
          <text x='32' y='40' font-size='24' text-anchor='middle' font-family='Arial' font-weight='700' fill='white'>${mark}</text>
        </svg>`
      )
    );
  };
  const iconUrls = [mkIconSvg(710, "A"), mkIconSvg(880, "B"), mkIconSvg(990, "C")];
  const spriteSheet = (() => {
    const marks = ["*", "o", "#"];
    const tiles = marks
      .map((mark, index) => {
        const rand = rng(1200 + index * 91);
        const h1 = rand() * 360;
        const h2 = h1 + 96 + rand() * 80;
        const x = index * 32;
        return `
          <defs>
            <linearGradient id='tile-${index}' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0' stop-color='${hsl(h1, 82, 68)}'/>
              <stop offset='1' stop-color='${hsl(h2, 72, 48)}'/>
            </linearGradient>
          </defs>
          <rect x='${x}' width='32' height='32' fill='url(%23tile-${index})'/>
          <circle cx='${x + 10}' cy='9' r='9' fill='rgba(255,255,255,.2)'/>
          <text x='${x + 16}' y='22' font-size='15' text-anchor='middle' font-family='Arial' font-weight='700' fill='white'>${mark}</text>`;
      })
      .join("");
    return (
      `data:image/svg+xml;utf8,` +
      encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 32'>${tiles}</svg>`)
    );
  })();
  const headUrl = mkSvg(1808, "AVTR");
  const frameUrl =
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'>
        <defs><linearGradient id='f' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${hsl(44, 92, 66)}'/><stop offset='1' stop-color='${hsl(322, 74, 58)}'/></linearGradient></defs>
        <circle cx='40' cy='40' r='36' fill='none' stroke='url(%23f)' stroke-width='7'/>
        <circle cx='40' cy='40' r='27' fill='none' stroke='rgba(255,255,255,.75)' stroke-width='2'/>
      </svg>`
    );
  return (
    <DocPage
      whenToUse={<p>承载图片、游戏图标、sprite 裁剪和多层头像等媒体资源。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          code: `<Image src={url} width={240} height={160} />`,
          render: () => (
            <Row gap={20}>
              <Image src={images[0].src} alt="demo" width={240} height={160} />
              <Image width={160} height={160} placeholder={<Icon name="image" size={28} />} />
              <Image src="https://broken.fake" width={160} height={160} />
            </Row>
          ),
        },
        {
          id: "preview-mask",
          title: "预览遮罩",
          description: "全屏预览默认使用中性 --mask-bg,previewClassName / previewStyle 可单独控制预览蒙层。",
          code: `<Image
  src={url}
  previewClassName="asset-preview-mask"
  previewStyle={{ background: "var(--mask-bg)", backdropFilter: "none" }}
/>`,
          render: () => (
            <Image
              src={images[2].src}
              alt="preview mask"
              width={240}
              height={160}
              previewClassName="demo-image-preview-mask"
              previewStyle={{ background: "var(--mask-bg)", backdropFilter: "none" }}
            />
          ),
        },
        {
          id: "asset-icons",
          title: "图标 / 原始资源",
          description: "variant=\"icon\" 会默认去掉外层 padding,适合 1:1 装备、物品、头像缩略图；variant=\"raw\" 保留原始图片比例。",
          code: `<Image variant="icon" src={iconUrl} width={56} height={56} preview={false} />
<Image variant="raw" src={bannerUrl} width={220} height={84} objectFit="contain" />`,
          render: () => (
            <Row gap={18}>
              {iconUrls.map((src, index) => (
                <Image
                  key={src}
                  variant="icon"
                  src={src}
                  alt={`icon-${index}`}
                  width={56}
                  height={56}
                  preview={false}
                />
              ))}
              <Image
                variant="raw"
                src={images[1].src}
                alt="raw"
                width={220}
                height={84}
                preview={false}
                objectFit="contain"
              />
            </Row>
          ),
        },
        {
          id: "sprite",
          title: "Sprite 裁剪",
          description: "SpriteImage 用 background-position 裁剪同一张雪碧图,适合 url + x/y/width/height 形式的图标资源。",
          code: `<SpriteImage src={sheetUrl} sprite={{ x: 32, y: 0, width: 32, height: 32 }} />`,
          render: () => (
            <Row gap={14}>
              <SpriteImage src={spriteSheet} alt="star" sprite={{ x: 0, y: 0, width: 32, height: 32 }} />
              <SpriteImage src={spriteSheet} alt="circle" sprite={{ x: 32, y: 0, width: 32, height: 32 }} />
              <SpriteImage src={spriteSheet} alt="square" sprite={{ x: 64, y: 0, width: 32, height: 32 }} />
            </Row>
          ),
        },
        {
          id: "layered",
          title: "多图层图片",
          description: "LayeredImage 将多张图片叠在同一个盒子里,适合头像 + 头像框、底图 + 标记等资产。",
          code: `<LayeredImage
  width={72}
  height={72}
  layers={[
    { src: headUrl, fit: "cover" },
    { src: frameUrl },
  ]}
/>`,
          render: () => (
            <Row gap={18}>
              <LayeredImage
                width={72}
                height={72}
                layers={[
                  { src: headUrl, alt: "avatar", fit: "cover", inset: 6 },
                  { src: frameUrl, alt: "" },
                ]}
              />
              <LayeredImage
                variant="framed"
                width={86}
                height={86}
                layers={[
                  { src: headUrl, alt: "avatar", fit: "cover", inset: 10 },
                  { src: frameUrl, alt: "" },
                ]}
              />
            </Row>
          ),
        },
        {
          id: "grid",
          title: "图片组",
          span: 2,
          code: `<ImageGrid images={images} />
<ImageGrid images={icons} imageProps={{ variant: "icon", preview: false }} />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <ImageGrid images={images} />
              <ImageGrid
                images={iconUrls.map((src, index) => ({ src, alt: `icon-${index}` }))}
                columns={6}
                itemHeight={56}
                minItemWidth={56}
                imageProps={{ variant: "icon", preview: false }}
              />
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Image",
          rows: [
            { prop: "src", description: "图片 URL", type: "string" },
            { prop: "width / height", description: "尺寸", type: "number | string" },
            { prop: "variant", description: "视觉形态", type: `"framed" | "raw" | "icon"`, default: `"framed"` },
            { prop: "frame", description: "是否保留内层凹陷 frame", type: "boolean", default: "framed 时 true" },
            { prop: "padding", description: "外层留白,raw/icon 默认 0", type: "number | string" },
            { prop: "objectFit / objectPosition", description: "底层 img 的 object-fit / object-position", type: "CSSProperties" },
            { prop: "preview", description: "支持点击全屏预览", type: "boolean", default: "true" },
            { prop: "previewClassName", description: "预览蒙层 className", type: "string" },
            { prop: "previewStyle", description: "预览蒙层内联样式", type: "CSSProperties" },
            { prop: "hover", description: "悬浮放大", type: "boolean", default: "true" },
            { prop: "placeholder", description: "占位/错误时内容", type: "ReactNode" },
            { prop: "imgProps", description: "透传到底层 img 的属性", type: "ImgHTMLAttributes" },
          ],
        },
        {
          title: "ImageGrid",
          rows: [
            { prop: "images", description: "图片项数组,单项也可覆盖 Image props", type: "ImageGridItem[]", required: true },
            { prop: "columns", description: "固定列数,不传则自动填充", type: "number" },
            { prop: "itemHeight", description: "默认图片高度", type: "number", default: "130" },
            { prop: "minItemWidth", description: "自动填充时的最小列宽", type: "number | string", default: "160" },
            { prop: "gap", description: "网格间距", type: "number | string", default: "14" },
            { prop: "imageProps", description: "批量传给每个 Image 的属性", type: "ImageProps" },
          ],
        },
        {
          title: "SpriteImage",
          rows: [
            { prop: "src", description: "sprite sheet 图片 URL", type: "string", required: true },
            { prop: "sprite", description: "裁剪区域", type: "{ x; y; width; height }", required: true },
            { prop: "width / height", description: "渲染尺寸,默认使用 sprite 尺寸", type: "number | string" },
            { prop: "scale", description: "未指定 width/height 时的缩放倍数", type: "number", default: "1" },
            { prop: "backgroundSize", description: "自定义 background-size", type: "string" },
            { prop: "variant / frame / padding", description: "同 Image 的媒体外观控制", type: "ImageVariant / boolean / number" },
          ],
        },
        {
          title: "LayeredImage",
          rows: [
            { prop: "layers", description: "按顺序叠放的图片层", type: "LayeredImageLayer[]", required: true },
            { prop: "width / height", description: "容器尺寸", type: "number | string" },
            { prop: "variant / frame / padding", description: "同 Image 的媒体外观控制", type: "ImageVariant / boolean / number" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "image",
  group: "数据展示",
  order: 50,
  label: "Image 图片",
  eyebrow: "DATA DISPLAY",
  title: "Image 图片",
  desc: "凹陷外框包裹的图片容器,带预览、错误占位。",
  Component: SectionImage,
});
