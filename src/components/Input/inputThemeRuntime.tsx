import * as React from "react";
import type { ComponentThemeName } from "../Theme/componentThemeTypes";

/** 复合输入组件告诉 Input 基础实现应按哪个公共组件解析主题。 */
export interface InputThemeIdentity {
  component: Extract<
    ComponentThemeName,
    "Input" | "InputPassword" | "InputNumber" | "AutoComplete"
  >;
  cssPrefix: string | string[];
}

const InputThemeIdentityContext = React.createContext<InputThemeIdentity | null>(null);

/** 在不增加 DOM 包装的前提下切换 Input 的组件主题身份。 */
export function InputThemeIdentityProvider({
  value,
  children,
}: {
  value: InputThemeIdentity;
  children?: React.ReactNode;
}) {
  return (
    <InputThemeIdentityContext.Provider value={value}>
      {children}
    </InputThemeIdentityContext.Provider>
  );
}

/** 读取当前复合输入组件提供的主题身份。 */
export function useInputThemeIdentity(): InputThemeIdentity | null {
  return React.useContext(InputThemeIdentityContext);
}
