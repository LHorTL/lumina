import type {
  AlertProps,
  AppShellProps,
  AutoCompleteProps,
  AvatarProps,
  BadgeProps,
  ButtonProps,
  CalendarProps,
  CardProps,
  CascaderProps,
  CheckboxProps,
  CollapseProps,
  ColorPickerProps,
  CommandPaletteProps,
  ComponentTheme,
  ContextMenuProps,
  DatePickerProps,
  DateTimePickerProps,
  DividerProps,
  DrawerProps,
  EmptyProps,
  FormItemProps,
  FormProps,
  IconButtonProps,
  IconProps,
  ImageGridProps,
  ImageProps,
  InputNumberProps,
  InputPasswordProps,
  InputProps,
  LayeredImageProps,
  LinkProps,
  ListProps,
  MessageContainerProps,
  ModalProps,
  MultiSelectProps,
  NamedIconProps,
  PaginationProps,
  ParagraphProps,
  PopoverProps,
  ProgressProps,
  RadioGroupProps,
  RadioProps,
  SelectProps,
  SidebarProps,
  SkeletonProps,
  SliderProps,
  SpinProps,
  SplitterProps,
  SpriteImageProps,
  StatusBarItemProps,
  StatusBarProps,
  SurfaceProps,
  SwitchProps,
  TableProProps,
  TableProps,
  TabsProps,
  TagProps,
  TextareaProps,
  TextProps,
  ThemePanelProps,
  ThemeProviderProps,
  TimelineProps,
  TimePickerProps,
  TitleBarProps,
  TitleProps,
  TooltipProps,
  TypographyProps,
  WindowControlsProps,
} from "../src";

/** 判断一个公开 Props 是否暴露统一的可选 theme 契约。 */
type SupportsComponentTheme<T> = T extends { theme?: ComponentTheme } ? true : false;

/** 让任意未接入 theme 的公开组件在 typecheck 阶段直接失败。 */
type AssertThemeCoverage<T extends readonly true[]> = T;

/** 公共 UI Props 的组件主题类型烟雾测试。 */
type ComponentThemeCoverage = AssertThemeCoverage<[
  SupportsComponentTheme<AlertProps>,
  SupportsComponentTheme<AppShellProps>,
  SupportsComponentTheme<AutoCompleteProps>,
  SupportsComponentTheme<AvatarProps>,
  SupportsComponentTheme<BadgeProps>,
  SupportsComponentTheme<ButtonProps>,
  SupportsComponentTheme<CalendarProps>,
  SupportsComponentTheme<CardProps>,
  SupportsComponentTheme<CascaderProps>,
  SupportsComponentTheme<CheckboxProps>,
  SupportsComponentTheme<CollapseProps>,
  SupportsComponentTheme<ColorPickerProps>,
  SupportsComponentTheme<CommandPaletteProps>,
  SupportsComponentTheme<ContextMenuProps>,
  SupportsComponentTheme<DatePickerProps>,
  SupportsComponentTheme<DateTimePickerProps>,
  SupportsComponentTheme<DividerProps>,
  SupportsComponentTheme<DrawerProps>,
  SupportsComponentTheme<EmptyProps>,
  SupportsComponentTheme<FormProps>,
  SupportsComponentTheme<FormItemProps>,
  SupportsComponentTheme<IconProps>,
  SupportsComponentTheme<IconButtonProps>,
  SupportsComponentTheme<ImageProps>,
  SupportsComponentTheme<ImageGridProps>,
  SupportsComponentTheme<InputProps>,
  SupportsComponentTheme<InputPasswordProps>,
  SupportsComponentTheme<InputNumberProps>,
  SupportsComponentTheme<LayeredImageProps>,
  SupportsComponentTheme<LinkProps>,
  SupportsComponentTheme<ListProps>,
  SupportsComponentTheme<MessageContainerProps>,
  SupportsComponentTheme<ModalProps>,
  SupportsComponentTheme<NamedIconProps>,
  SupportsComponentTheme<PaginationProps>,
  SupportsComponentTheme<ParagraphProps>,
  SupportsComponentTheme<PopoverProps>,
  SupportsComponentTheme<ProgressProps>,
  SupportsComponentTheme<RadioProps>,
  SupportsComponentTheme<RadioGroupProps>,
  SupportsComponentTheme<SelectProps>,
  SupportsComponentTheme<SidebarProps>,
  SupportsComponentTheme<SkeletonProps>,
  SupportsComponentTheme<SliderProps>,
  SupportsComponentTheme<SpinProps>,
  SupportsComponentTheme<SplitterProps>,
  SupportsComponentTheme<SpriteImageProps>,
  SupportsComponentTheme<StatusBarProps>,
  SupportsComponentTheme<StatusBarItemProps>,
  SupportsComponentTheme<SurfaceProps>,
  SupportsComponentTheme<SwitchProps>,
  SupportsComponentTheme<TableProps>,
  SupportsComponentTheme<TableProProps>,
  SupportsComponentTheme<TabsProps>,
  SupportsComponentTheme<TagProps>,
  SupportsComponentTheme<TextareaProps>,
  SupportsComponentTheme<TextProps>,
  SupportsComponentTheme<ThemePanelProps>,
  SupportsComponentTheme<TimelineProps>,
  SupportsComponentTheme<TimePickerProps>,
  SupportsComponentTheme<TitleBarProps>,
  SupportsComponentTheme<TitleProps>,
  SupportsComponentTheme<TooltipProps>,
  SupportsComponentTheme<TypographyProps>,
  SupportsComponentTheme<WindowControlsProps>,
]>;

/** 防止类型别名被编辑器当作完全未使用的声明折叠。 */
export type ComponentThemeSmokeResult = ComponentThemeCoverage;

/** ThemeProvider 的稳定作用域控制属性类型烟雾测试。 */
type ThemeProviderScopeControls = ThemeProviderProps extends {
  enabled?: boolean;
  asChild?: boolean;
}
  ? true
  : false;

/** 防止 ThemeProvider 稳定作用域控制属性从公共类型中意外丢失。 */
export type ThemeProviderScopeControlsSmokeResult = AssertThemeCoverage<[
  ThemeProviderScopeControls,
]>;

/** 判断公共 Props 是否持续暴露指定能力键。 */
type SupportsProp<T, Key extends PropertyKey> = Key extends keyof T ? true : false;

/** 截图所需的组件扩展能力类型烟雾测试。 */
type RequestedComponentCapabilityCoverage = AssertThemeCoverage<[
  SupportsProp<TableProProps, "activeRowKey">,
  SupportsProp<TableProProps, "rowClassName">,
  SupportsProp<SplitterProps, "firstPaneClassName">,
  SupportsProp<SplitterProps, "firstPaneStyle">,
  SupportsProp<SplitterProps, "secondPaneClassName">,
  SupportsProp<SplitterProps, "secondPaneStyle">,
  SupportsProp<SplitterProps, "handle">,
  SupportsProp<TabsProps, "tabBarClassName">,
  SupportsProp<TabsProps, "contentClassName">,
  SupportsProp<TabsProps, "fill">,
  SupportsProp<DrawerProps, "bodyClassName">,
  SupportsProp<DrawerProps, "bodyStyle">,
  SupportsProp<DrawerProps, "bodyProps">,
  SupportsProp<DrawerProps, "bodyOverflow">,
  SupportsProp<MultiSelectProps, "maxCount">,
  SupportsProp<MultiSelectProps, "getOptionDisabled">,
]>;

/** 防止新增公共能力在后续重构中静默丢失。 */
export type RequestedComponentCapabilitySmokeResult =
  RequestedComponentCapabilityCoverage;
