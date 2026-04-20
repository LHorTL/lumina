import * as React from "react";

/**
 * Name of a built-in icon. To add your own, pass `children` (raw SVG paths) instead.
 */
export type IconName =
  | "search"
  | "plus"
  | "minus"
  | "check"
  | "x"
  | "chevDown"
  | "chevRight"
  | "chevLeft"
  | "chevUp"
  | "arrowRight"
  | "settings"
  | "user"
  | "bell"
  | "mail"
  | "heart"
  | "star"
  | "home"
  | "folder"
  | "file"
  | "image"
  | "play"
  | "pause"
  | "volume"
  | "trash"
  | "edit"
  | "copy"
  | "download"
  | "upload"
  | "info"
  | "alert"
  | "check2"
  | "eye"
  | "eyeOff"
  | "sparkle"
  | "moon"
  | "sun"
  | "palette"
  | "layers"
  | "grid"
  | "list"
  | "zap"
  | "filter"
  | "mic"
  | "send"
  | "calendar"
  | "clock"
  | "menu"
  | "more"
  | "sliders"
  | "aim"
  | "swap"
  | "camera"
  | "qq"
  | "code";

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "stroke"> {
  name: IconName;
  size?: number;
  stroke?: number;
}

const paths: Record<IconName, React.ReactNode> = {
search:    <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    plus:      <><path d="M12 5v14M5 12h14"/></>,
    minus:     <><path d="M5 12h14"/></>,
    check:     <><path d="m4 12 5 5L20 6"/></>,
    x:         <><path d="M6 6l12 12M18 6 6 18"/></>,
    chevDown:  <><path d="m6 9 6 6 6-6"/></>,
    chevRight: <><path d="m9 6 6 6-6 6"/></>,
    chevLeft:  <><path d="m15 6-6 6 6 6"/></>,
    chevUp:    <><path d="m6 15 6-6 6 6"/></>,
    arrowRight:<><path d="M5 12h14M13 6l6 6-6 6"/></>,
    settings:  <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
    user:      <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    bell:      <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    mail:      <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    heart:     <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
    star:      <><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>,
    home:      <><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></>,
    folder:    <><path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
    file:      <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></>,
    image:     <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>,
    play:      <><path d="M7 5v14l11-7z" fill="currentColor" stroke="none"/></>,
    pause:     <><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" stroke="none"/></>,
    volume:    <><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M17 8a5 5 0 0 1 0 8M20 5a9 9 0 0 1 0 14"/></>,
    trash:     <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/></>,
    edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></>,
    copy:      <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    download:  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
    upload:    <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></>,
    info:      <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
    alert:     <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></>,
    check2:    <><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></>,
    eye:       <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff:    <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a19 19 0 0 1 5.17-6M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a19 19 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22"/></>,
    sparkle:   <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
    moon:      <><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></>,
    sun:       <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    palette:   <><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 1 0 0 20 3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h4a5 5 0 0 0 5-5 10 10 0 0 0-8-5z"/></>,
    layers:    <><path d="m12 2 10 6-10 6L2 8z"/><path d="m2 17 10 6 10-6M2 12l10 6 10-6"/></>,
    grid:      <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    list:      <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    zap:       <><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></>,
    filter:    <><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></>,
    mic:       <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></>,
    send:      <><path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/></>,
    calendar:  <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    clock:     <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    menu:      <><path d="M3 6h18M3 12h18M3 18h18"/></>,
    more:      <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    sliders:   <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></>,
    aim:       <><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="2"/></>,
    swap:      <><path d="M3 8h18M17 4l4 4-4 4M21 16H3M7 20l-4-4 4-4"/></>,
    camera:    <><path d="M3 7h4l2-3h6l2 3h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></>,
    qq:        <><path d="M12 2c-3 0-5 2.1-5 5 0 1.3.4 2.6.9 3.6-1.8 1-3.4 3-3.4 5.9 0 .8.7 1.5 1.5 1.5 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 .8 0 1.5-.7 1.5-1.5 0-2.9-1.6-4.9-3.4-5.9.5-1 .9-2.3.9-3.6 0-2.9-2-5-5-5z"/><circle cx="10" cy="9" r="0.8" fill="currentColor" stroke="none"/><circle cx="14" cy="9" r="0.8" fill="currentColor" stroke="none"/></>,
    code:      <><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></>,
};

/**
 * `Icon` — stroked line icon set, sized in pixels, inherits `currentColor`.
 *
 * @example
 * <Icon name="plus" size={18} />
 */
export const Icon: React.FC<IconProps> = ({ name, size = 16, stroke = 2, style, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    overflow="visible"
    style={style}
    {...rest}
  >
    {paths[name]}
  </svg>
);

export const ICON_NAMES: IconName[] = ["search", "plus", "minus", "check", "x", "chevDown", "chevRight", "chevLeft", "chevUp", "arrowRight", "settings", "user", "bell", "mail", "heart", "star", "home", "folder", "file", "image", "play", "pause", "volume", "trash", "edit", "copy", "download", "upload", "info", "alert", "check2", "eye", "eyeOff", "sparkle", "moon", "sun", "palette", "layers", "grid", "list", "zap", "filter", "mic", "send", "calendar", "clock", "menu", "more", "sliders", "aim", "swap", "camera", "qq", "code"];
