import * as React from "react";
import { Icon, Image, ImageGrid, LayeredImage, SpriteImage } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionImage: React.FC<SectionCtx> = () => {
  const mkSvg = (h1: number, h2: number) =>
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='hsl(${h1}, 60%, 72%)'/>
        <stop offset='1' stop-color='hsl(${h2}, 55%, 58%)'/>
      </linearGradient></defs>
      <rect width='400' height='300' fill='url(%23g)'/>
    </svg>`
    );
  const images = [
    { src: mkSvg(210, 260), alt: "Image 1" },
    { src: mkSvg(30, 80), alt: "Image 2" },
    { src: mkSvg(140, 180), alt: "Image 3" },
    { src: mkSvg(340, 20), alt: "Image 4" },
    { src: mkSvg(90, 140), alt: "Image 5" },
    { src: mkSvg(280, 320), alt: "Image 6" },
  ];
  const mkIconSvg = (h: number, mark: string) =>
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stop-color='hsl(${h}, 76%, 72%)'/>
            <stop offset='1' stop-color='hsl(${h + 42}, 70%, 48%)'/>
          </linearGradient>
        </defs>
        <rect x='5' y='5' width='54' height='54' rx='14' fill='url(%23g)'/>
        <text x='32' y='40' font-size='24' text-anchor='middle' font-family='Arial' font-weight='700' fill='white'>${mark}</text>
      </svg>`
    );
  const iconUrls = [mkIconSvg(14, "A"), mkIconSvg(150, "B"), mkIconSvg(220, "C")];
  const spriteSheet =
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 32'>
        <rect width='32' height='32' fill='hsl(18, 78%, 58%)'/>
        <rect x='32' width='32' height='32' fill='hsl(154, 58%, 46%)'/>
        <rect x='64' width='32' height='32' fill='hsl(216, 66%, 56%)'/>
        <path d='M16 7l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z' fill='white'/>
        <circle cx='48' cy='16' r='9' fill='white'/>
        <path d='M72 8h16v16H72z' fill='white'/>
      </svg>`
    );
  const headUrl =
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'>
        <defs><linearGradient id='h' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(210, 76%, 72%)'/><stop offset='1' stop-color='hsl(260, 62%, 48%)'/></linearGradient></defs>
        <circle cx='40' cy='40' r='32' fill='url(%23h)'/>
        <circle cx='30' cy='33' r='4' fill='white'/><circle cx='50' cy='33' r='4' fill='white'/>
        <path d='M28 50c7 6 17 6 24 0' stroke='white' stroke-width='5' fill='none' stroke-linecap='round'/>
      </svg>`
    );
  const frameUrl =
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'>
        <circle cx='40' cy='40' r='36' fill='none' stroke='hsl(43, 88%, 62%)' stroke-width='7'/>
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
