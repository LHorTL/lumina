import * as React from "react";
import { Icon, Image, ImageGrid } from "lumina";
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
  return (
    <DocPage
      whenToUse={<p>承载图片资源,带凹陷边框、悬浮预览、错误占位。</p>}
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
          id: "grid",
          title: "图片组",
          span: 2,
          code: `<ImageGrid images={images} />`,
          render: () => <ImageGrid images={images} />,
        },
      ]}
      api={[
        {
          title: "Image",
          rows: [
            { prop: "src", description: "图片 URL", type: "string" },
            { prop: "width / height", description: "尺寸", type: "number | string" },
            { prop: "preview", description: "支持点击全屏预览", type: "boolean", default: "true" },
            { prop: "hover", description: "悬浮放大", type: "boolean", default: "true" },
            { prop: "placeholder", description: "占位/错误时内容", type: "ReactNode" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "image",
  group: "数据展示",
  order: 100,
  label: "Image 图片",
  eyebrow: "DATA DISPLAY",
  title: "Image 图片",
  desc: "凹陷外框包裹的图片容器,带预览、错误占位。",
  Component: SectionImage,
});
