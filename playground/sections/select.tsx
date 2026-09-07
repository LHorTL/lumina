import * as React from "react";
import {
  Avatar,
  Button,
  Icon,
  IconButton,
  Select,
  Slider,
  Switch,
  Tag,
  type SelectItem,
  type SelectOption,
  type SelectOptionRenderInfo,
} from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

/** 单行折叠示例包含常见短标签、长标签和两位数折叠计数。 */
const RESPONSIVE_OPTIONS: SelectOption[] = [
  { value: "gift", label: "外观礼盒" },
  { value: "hair", label: "发型" },
  { value: "long", label: "星河入梦·稀有长名称外观礼盒展示测试" },
  ...Array.from({ length: 10 }, (_, index) => ({ value: `item-${index}`, label: `外观 ${index + 1}` })),
];

/** 使用真实容器缩放演示折叠、恢复标签以及搜索输入时的单行布局。 */
const ResponsiveTagsDemo: React.FC = () => {
  const [width, setWidth] = React.useState(218);
  const [values, setValues] = React.useState(["gift", "hair"]);
  const [searchable, setSearchable] = React.useState(true);
  const [allowClear, setAllowClear] = React.useState(true);
  const [visible, setVisible] = React.useState(true);
  return (
    <div style={{ display: "grid", gap: "var(--gap-4)" }}>
      <Row>
        {[190, 218, 300].map((preset) => <Button key={preset} size="sm" onClick={() => setWidth(preset)}>{preset}px</Button>)}
        <span>当前宽度：{width}px</span>
      </Row>
      <Slider aria-label="自适应选择框宽度" min={180} max={480} value={width} onChange={setWidth} />
      <Row>
        <Switch checked={searchable} onChange={setSearchable} label="框内搜索" />
        <Switch checked={allowClear} onChange={setAllowClear} label="允许清空" />
        <Button size="sm" onClick={() => setVisible((current) => !current)}>{visible ? "隐藏选择框" : "显示选择框"}</Button>
      </Row>
      <Row>
        <Button size="sm" onClick={() => setValues([])}>0 项</Button>
        <Button size="sm" onClick={() => setValues(["gift"])}>1 项</Button>
        <Button size="sm" onClick={() => setValues(["gift", "hair"])}>2 项</Button>
        <Button size="sm" onClick={() => setValues(RESPONSIVE_OPTIONS.map((option) => option.value))}>全部 13 项</Button>
        <Button size="sm" onClick={() => setValues(["long", "gift"])}>长标签</Button>
      </Row>
      <div style={{ display: visible ? "block" : "none", width, maxWidth: "100%" }}>
        <Field label="自适应外观类型" hint={`完整选值保留 ${values.length} 项，缩窄或输入长搜索词只改变标签展示。`}>
          <Select multiple maxTagCount="responsive" searchable={searchable} allowClear={allowClear}
            aria-label="自适应外观类型" value={values} onChange={setValues} options={RESPONSIVE_OPTIONS} />
        </Field>
      </div>
    </div>
  );
};

/** 远程搜索示例使用的万宝楼候选数据。 */
const APPEARANCE_CATALOG: SelectOption<string>[] = [
  { value: "成衣_长云黯雪·二·衣", label: "长云黯雪·二·衣", text: "长云黯雪 二 衣", description: "成衣" },
  { value: "披风_雪落无声", label: "雪落无声", text: "雪落无声", description: "披风" },
  { value: "发型_孤鸿影·长发", label: "孤鸿影·长发", text: "孤鸿影 长发", description: "发型" },
  { value: "称号_踏雪寻梅", label: "踏雪寻梅", text: "踏雪寻梅", description: "称号" },
  { value: "成衣_山海同归·衣", label: "山海同归·衣", text: "山海同归 衣", description: "成衣" },
  { value: "称号_风雪故人归", label: "风雪故人归", text: "风雪故人归", description: "称号" },
  { value: "披风_星河入梦·稀有长名称", label: "星河入梦·稀有长名称展示测试", text: "星河入梦 稀有", description: "披风" },
];

/** 模拟由业务层执行的远程搜索；不同延迟用于演示迟到结果保护。 */
const searchAppearanceOptions = (keyword: string): Promise<SelectOption<string>[]> => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const delay = normalizedKeyword.length % 2 === 0 ? 680 : 420;
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const matched = normalizedKeyword
        ? APPEARANCE_CATALOG.filter((option) => {
            const searchableText = `${option.text ?? ""} ${option.description ?? ""}`.toLowerCase();
            return searchableText.includes(normalizedKeyword);
          })
        : APPEARANCE_CATALOG.slice(0, 5);
      resolve(matched);
    }, delay);
  });
};

/** 演示由业务层托管搜索词、防抖、迟到结果和远程候选状态。 */
const RemoteMultiSearchDemo: React.FC = () => {
  const [appearanceValues, setAppearanceValues] = React.useState<string[]>([
    "成衣_长云黯雪·二·衣",
    "发型_孤鸿影·长发",
  ]);
  const [appearanceSearch, setAppearanceSearch] = React.useState("");
  const [appearanceOptions, setAppearanceOptions] = React.useState<SelectOption<string>[]>(
    APPEARANCE_CATALOG.slice(0, 5)
  );
  const [appearanceLoading, setAppearanceLoading] = React.useState(false);
  const latestAppearanceRequestRef = React.useRef(0);

  React.useEffect(() => {
    const requestId = latestAppearanceRequestRef.current + 1;
    latestAppearanceRequestRef.current = requestId;
    setAppearanceLoading(true);
    const debounceTimer = window.setTimeout(() => {
      void searchAppearanceOptions(appearanceSearch).then((nextOptions) => {
        if (requestId !== latestAppearanceRequestRef.current) return;
        setAppearanceOptions(nextOptions);
        setAppearanceLoading(false);
      });
    }, 300);

    return () => {
      window.clearTimeout(debounceTimer);
      if (latestAppearanceRequestRef.current === requestId) {
        latestAppearanceRequestRef.current += 1;
      }
    };
  }, [appearanceSearch]);

  return (
    <Field
      label={`万宝楼外观与称号 (已选 ${appearanceValues.length})`}
      hint="连续输入并选择；远程结果即使暂时为空或加载中，已选标签仍保留原显示名称。"
    >
      <Select
        multiple
        searchable
        clearable
        value={appearanceValues}
        onChange={setAppearanceValues}
        searchValue={appearanceSearch}
        onSearch={setAppearanceSearch}
        options={appearanceOptions}
        loading={appearanceLoading}
        filterOption={false}
        maxTagCount={2}
        maxCount={5}
        placeholder="搜索外观名称或称号..."
        emptyContent={appearanceSearch ? "没有匹配的外观或称号" : "暂无候选项"}
        aria-label="搜索万宝楼外观与称号"
      />
    </Field>
  );
};

/** 套餐复杂选项所需的附加展示信息。 */
interface PlanMeta {
  description: string;
  price: string;
  tone: "accent" | "info" | "success";
  icon: "sparkle" | "user" | "layers";
}

const PLAN_META: Record<string, PlanMeta> = {
  personal: { description: "个人项目与轻量原型", price: "免费", tone: "info", icon: "user" },
  pro: { description: "完整组件库与高级主题能力", price: "¥99/月", tone: "accent", icon: "sparkle" },
  team: { description: "团队权限、审计与共享资产", price: "¥299/月", tone: "success", icon: "layers" },
};

/** 置顶分组示例使用的全部服务选项。 */
const SERVICE_OPTIONS: SelectOption<string>[] = [
  { value: "figma", label: "Figma", icon: "palette", description: "设计与原型" },
  { value: "github", label: "GitHub", icon: "code", description: "代码与协作" },
  { value: "notion", label: "Notion", icon: "file", description: "文档与知识库" },
  { value: "slack", label: "Slack", icon: "mail", description: "团队沟通" },
];

/** 根据业务侧收藏状态生成互斥的置顶分组和常规分组。 */
const createServiceGroups = (favoriteValues: readonly string[]): SelectItem<string>[] => [
  {
    label: "其他服务",
    options: SERVICE_OPTIONS.filter((option) => !favoriteValues.includes(option.value)),
  },
  {
    label: "已收藏",
    pinned: true,
    options: SERVICE_OPTIONS.filter((option) => favoriteValues.includes(option.value)),
  },
];

/** 渲染包含图标、说明和价格的复杂 Select 菜单项。 */
const renderPlanOption = (
  option: SelectOption<string>,
  info: SelectOptionRenderInfo
): React.ReactNode => {
  const meta = PLAN_META[String(option.value)];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBlock: 6 }}>
      <Avatar size="sm" shape="square" alt={String(option.label).slice(0, 1)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 650 }}>
          <span>{option.label}</span>
          {info.selected && <Tag tone="accent">当前</Tag>}
        </div>
        <div style={{ marginTop: 4, color: "var(--fg-muted)", fontSize: 12 }}>{meta.description}</div>
      </div>
      <Tag tone={meta.tone}>{meta.price}</Tag>
    </div>
  );
};

/** 把复杂套餐压缩为适合固定高度触发器的已选内容。 */
const renderPlanSelected = (option: SelectOption<string>): React.ReactNode => {
  const meta = PLAN_META[String(option.value)];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Icon name={meta.icon} size={14} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option.label}</span>
      <Tag tone={meta.tone}>{meta.price}</Tag>
    </span>
  );
};

/** 返回分类限选示例中选项值的类别前缀。 */
const getOptionCategory = (value: string): string => value.split(":")[0];

/** 同一类别已有其他选项时禁用当前候选项。 */
const disableDuplicateCategory = (
  option: SelectOption<string>,
  selectedValues: readonly string[]
): boolean => {
  const category = getOptionCategory(option.value);
  return selectedValues.some(
    (value) => value !== option.value && getOptionCategory(value) === category
  );
};

const SectionSelect: React.FC<SectionCtx> = () => {
  const [lang, setLang] = React.useState("zh");
  const [tags, setTags] = React.useState<string[]>(["design", "ui"]);
  const [categoryValues, setCategoryValues] = React.useState<string[]>(["image:flux"]);
  const [city, setCity] = React.useState<string | undefined>("sh");
  const [aliasValue, setAliasValue] = React.useState<string | undefined>();
  const [framework, setFramework] = React.useState("");
  const [plan, setPlan] = React.useState("pro");
  const [service, setService] = React.useState("github");
  const [favoriteServices, setFavoriteServices] = React.useState<string[]>(["figma", "github"]);
  const [loading, setLoading] = React.useState(false);
  const [asyncOpts, setAsyncOpts] = React.useState<{ value: string; label: string }[]>([]);
  const serviceGroups = React.useMemo(
    () => createServiceGroups(favoriteServices),
    [favoriteServices]
  );

  /** 渲染不触发选中行为的服务收藏操作。 */
  const renderServiceExtra = React.useCallback(
    (option: SelectOption<string>): React.ReactNode => {
      const favorite = favoriteServices.includes(option.value);
      return (
        <IconButton
          size="sm"
          variant="ghost"
          icon={favorite ? "starFilled" : "star"}
          tip={favorite ? `取消收藏 ${option.label}` : `收藏 ${option.label}`}
          aria-pressed={favorite}
          onClick={() => {
            setFavoriteServices((current) =>
              current.includes(option.value)
                ? current.filter((value) => value !== option.value)
                : [...current, option.value]
            );
          }}
        />
      );
    },
    [favoriteServices]
  );
  const itemIcon = (tone: string) => (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: 5,
        background: tone,
        boxShadow: "var(--neu-shadow-subtle)",
      }}
    />
  );
  const triggerLoad = () => {
    setLoading(true);
    setAsyncOpts([]);
    setTimeout(() => {
      setAsyncOpts([
        { value: "a", label: "Apple" },
        { value: "b", label: "Banana" },
        { value: "c", label: "Cherry" },
      ]);
      setLoading(false);
    }, 1000);
  };
  return (
    <DocPage
      whenToUse={
        <>
          <p>从一组选项中选择一个或多个,常见于表单和过滤场景。</p>
          <ul className="doc-usecase-list">
            <li>选项数量 ≥ 4 时优先使用 Select 而非 Radio / Checkbox</li>
            <li>需要搜索过滤时启用 <code>searchable</code></li>
            <li>多选场景使用 <code>multiple</code>,可配合 <code>maxTagCount</code> 折叠</li>
            <li>远程搜索由业务层在 <code>onSearch</code> 中处理防抖和迟到结果，Select 只管理输入与选择交互</li>
            <li>菜单内容复杂时分别使用 <code>optionRender</code> 与 <code>selectedRender</code></li>
            <li>常用或高优先级内容可放入带 <code>pinned</code> 的置顶分组</li>
          </ul>
        </>
      }
      demos={[
        {
          id: "basic",
          title: "单选",
          code: `<Select value={lang} onChange={setLang} options={[
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
]} />`,
          render: () => (
            <Field label="界面语言">
              <Select
                value={lang}
                onChange={setLang}
                options={[
                  { value: "zh", label: "简体中文" },
                  { value: "en", label: "English" },
                  { value: "ja", label: "日本語" },
                  { value: "ko", label: "한국어" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "multi",
          title: "多选",
          description: "multiple + Tag 形式呈现已选项。",
          code: `<Select multiple clearable value={tags} onChange={setTags} options={...} />`,
          render: () => (
            <Field label={`标签 (已选 ${tags.length})`}>
              <Select
                multiple
                clearable
                value={tags}
                onChange={setTags}
                options={[
                  { value: "design", label: "设计" },
                  { value: "ui", label: "UI" },
                  { value: "ux", label: "UX" },
                  { value: "frontend", label: "前端" },
                  { value: "backend", label: "后端" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "responsive-tags",
          title: "单行自适应标签折叠",
          span: 2,
          description: 'maxTagCount="responsive" 按标签、+N、输入框和按钮的实际占位自动增减展示数量，始终单行。长搜索词在原输入框内横向编辑；折叠不改变完整选值。仅多选启用，数字值与未设置时仍保留原来的数量折叠和换行行为。',
          code: `<Select
  multiple searchable allowClear
  maxTagCount="responsive"
  style={{ width: 218 }}
  value={values} onChange={setValues}
  options={options}
/>`,
          render: () => <ResponsiveTagsDemo />,
        },
        {
          id: "remote-multi-search",
          title: "远程搜索多选",
          span: 2,
          description: "searchable 在单选和多选中都复用选择框本体作为输入；多选 Tag 后的空输入会收缩，不单独占行。选中后保持展开和关键词，业务层负责防抖与迟到结果保护。",
          code: `const [value, setValue] = useState<string[]>([]);
const [searchValue, setSearchValue] = useState("");
const [options, setOptions] = useState<SelectOption[]>([]);
const [loading, setLoading] = useState(false);
const latestRequest = useRef(0);

useEffect(() => {
  const requestId = ++latestRequest.current;
  setLoading(true);
  const timer = window.setTimeout(() => {
    void fetchOptions(searchValue).then((nextOptions) => {
      if (requestId !== latestRequest.current) return;
      setOptions(nextOptions);
      setLoading(false);
    });
  }, 300);
  return () => {
    window.clearTimeout(timer);
    if (requestId === latestRequest.current) latestRequest.current += 1;
  };
}, [searchValue]);

<Select
  multiple searchable clearable
  value={value} onChange={setValue}
  searchValue={searchValue} onSearch={setSearchValue}
  options={options} loading={loading}
  filterOption={false}
  maxTagCount={2}
/>`,
          render: () => <RemoteMultiSearchDemo />,
        },
        {
          id: "selection-limit",
          title: "数量上限 / 分类限选",
          description: "maxCount 限制总数；getOptionDisabled 可读取当前选择，实现“一类最多选一个”。",
          code: `<Select
  multiple
  maxCount={2}
  value={values}
  onChange={setValues}
  getOptionDisabled={(option, selectedValues) =>
    hasOtherSelectionInCategory(option, selectedValues)
  }
  options={groupedOptions}
/>`,
          render: () => (
            <Field
              label={`模型槽位 (已选 ${categoryValues.length}/2)`}
              hint="每个类别最多一个模型，总共最多两个。先移除已选项即可解锁同类候选项。"
            >
              <Select
                multiple
                clearable
                maxCount={2}
                value={categoryValues}
                onChange={setCategoryValues}
                getOptionDisabled={disableDuplicateCategory}
                options={[
                  {
                    label: "图像模型",
                    options: [
                      { value: "image:flux", label: "Flux" },
                      { value: "image:gpt-image", label: "GPT Image" },
                    ],
                  },
                  {
                    label: "文本模型",
                    options: [
                      { value: "text:sol", label: "Sol" },
                      { value: "text:terra", label: "Terra" },
                    ],
                  },
                  {
                    label: "语音模型",
                    options: [
                      { value: "audio:realtime", label: "Realtime Voice" },
                    ],
                  },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "search",
          title: "搜索过滤",
          description: "searchable + clearable + 选项 icon/description。icon 支持 IconName 或 ReactNode。",
          code: `<Select searchable clearable
  options={[{ value, label, icon, description }]}
/>`,
          render: () => (
            <Field label="城市">
              <Select
                searchable
                clearable
                value={city}
                onChange={setCity}
                onClear={() => setCity(undefined)}
                placeholder="搜索城市..."
                options={[
                  { value: "bj", label: "北京", icon: "home", description: "中国 · 首都" },
                  { value: "sh", label: "上海", icon: itemIcon("var(--accent)"), description: "中国 · 直辖市" },
                  { value: "tk", label: "东京", icon: itemIcon("var(--success)"), description: "日本" },
                  { value: "ld", label: "伦敦", icon: "home", description: "英国" },
                  { value: "pa", label: "巴黎", icon: "home", description: "法国" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "prop-aliases",
          title: "常用 prop 别名",
          description: "allowClear / showSearch / popupClassName / optionFilterProp 可直接使用。",
          code: `<Select
  allowClear
  showSearch
  popupClassName="my-select-popup"
  optionFilterProp="label"
  value={value}
  onChange={setValue}
  options={options}
/>`,
          render: () => (
            <Field label="别名写法">
              <Select
                allowClear
                showSearch
                popupClassName="demo-select-popup"
                optionFilterProp="label"
                value={aliasValue}
                onChange={setAliasValue}
                placeholder="搜索组件..."
                options={[
                  { value: "modal", label: "Modal 对话框" },
                  { value: "message", label: "Message 消息" },
                  { value: "cascader", label: "Cascader 级联" },
                  { value: "popover", label: "Popover 气泡卡片" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "custom-content",
          title: "复杂选项与独立选中渲染",
          span: 2,
          description: "optionRender 承载多行菜单内容；selectedRender 提供适合固定高度触发器的紧凑版本。listHeight 和 popupStyle 可调整浮层尺寸。",
          code: `<Select
  aria-label="订阅套餐"
  value={plan}
  onChange={setPlan}
  options={plans}
  optionRender={(option, info) => <PlanCard option={option} selected={info.selected} />}
  selectedRender={(option) => <CompactPlan option={option} />}
  listHeight={420}
  popupStyle={{ minWidth: "min(460px, calc(100vw - 16px))" }}
/>`,
          render: () => (
            <Field label="订阅套餐" hint="菜单使用完整信息，选中后只保留名称与价格。">
              <Select
                aria-label="订阅套餐"
                value={plan}
                onChange={setPlan}
                options={[
                  { value: "personal", label: "个人版", text: "个人版 免费 个人项目", ariaLabel: "个人版套餐" },
                  { value: "pro", label: "专业版", text: "专业版 高级主题", ariaLabel: "专业版套餐" },
                  { value: "team", label: "团队版", text: "团队版 权限 审计", ariaLabel: "团队版套餐" },
                ]}
                optionRender={renderPlanOption}
                selectedRender={renderPlanSelected}
                listHeight={420}
                popupStyle={{ minWidth: "min(460px, calc(100vw - 16px))" }}
              />
            </Field>
          ),
        },
        {
          id: "pinned-group",
          title: "置顶分组与额外操作",
          span: 2,
          description: "分组设置 pinned 后会稳定提升到菜单顶部；optionExtraRender 提供不会触发选中的独立尾部区域。收藏仅是业务侧示例。",
          code: `const groups = [
  { label: "其他服务", options: otherOptions },
  { label: "已收藏", pinned: true, options: favoriteOptions },
];

<Select
  value={service}
  onChange={setService}
  options={groups}
  optionExtraRender={(option) => (
    <IconButton icon={isFavorite(option) ? "starFilled" : "star"} />
  )}
/>`,
          render: () => (
            <Field
              label="连接服务"
              hint="“已收藏”虽定义在其他服务之后，仍优先显示；点击星标只会在分组间移动项目，不会改变当前选择。"
            >
              <Select
                searchable
                value={service}
                onChange={setService}
                options={serviceGroups}
                optionExtraRender={renderServiceExtra}
                listHeight={190}
                popupStyle={{ minWidth: 360 }}
              />
            </Field>
          ),
        },
        {
          id: "group",
          title: "分组",
          description: "options 接受 { label, options } 表示分组。",
          code: `options={[
  { label: "前端", options: [...] },
  { label: "后端", options: [...] },
]}`,
          render: () => (
            <Field label="技术栈">
              <Select
                searchable
                value={framework}
                onChange={setFramework}
                placeholder="选择技术栈..."
                options={[
                  {
                    label: "前端",
                    options: [
                      { value: "react", label: "React", icon: "zap" },
                      { value: "vue", label: "Vue", icon: "zap" },
                      { value: "svelte", label: "Svelte", icon: "zap" },
                    ],
                  },
                  {
                    label: "后端",
                    options: [
                      { value: "node", label: "Node.js", icon: "layers" },
                      { value: "deno", label: "Deno", icon: "layers" },
                      { value: "go", label: "Go", icon: "layers", disabled: true },
                    ],
                  },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "async",
          title: "加载态",
          description: "loading 时显示 spinner,emptyContent 自定义空态。",
          code: `<Select searchable loading={loading} options={asyncOpts} />`,
          render: () => (
            <Field
              label={
                <Row>
                  <span>异步加载</span>
                  <Button size="sm" variant="ghost" icon="arrowRight" onClick={triggerLoad}>
                    重新加载
                  </Button>
                </Row>
              }
            >
              <Select
                searchable
                loading={loading}
                options={asyncOpts}
                placeholder="点击重新加载..."
                emptyContent="没有水果了"
              />
            </Field>
          ),
        },
        {
          id: "size",
          title: "尺寸 / 状态",
          code: `<Select size="sm" /> <Select /> <Select size="lg" />
<Select invalid /> <Select disabled />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Row>
                <Select size="sm" defaultValue="1" options={[{ value: "1", label: "Small" }]} />
                <Select defaultValue="1" options={[{ value: "1", label: "Medium" }]} />
                <Select size="lg" defaultValue="1" options={[{ value: "1", label: "Large" }]} />
              </Row>
              <Row>
                <Select invalid placeholder="错误态" options={[{ value: "1", label: "Option" }]} />
                <Select disabled defaultValue="a" options={[{ value: "a", label: "已锁定" }]} />
              </Row>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Select",
          rows: [
            { prop: "options", description: "选项,可含 { label, options } 分组", type: "SelectItem<T>[]", required: true },
            { prop: "value / defaultValue", description: "受控/初始", type: "T | T[]" },
            { prop: "onChange", description: "变更", type: "(value) => void" },
            { prop: "placeholder", description: "空选择时的提示文本", type: "string", default: `"请选择…"` },
            { prop: "multiple", description: "多选", type: "boolean", default: "false" },
            { prop: "maxTagCount", description: "多选标签展示上限；responsive 按可用宽度动态折叠为 +N 并保持单行，搜索词可横向编辑；不改变选值。数字和未设置时保留既有换行行为", type: 'number | "responsive"' },
            { prop: "maxCount", description: "多选允许的最大选择数；达到上限后禁用未选项", type: "number" },
            { prop: "getOptionDisabled", description: "基于候选项和当前选择动态判断禁用状态", type: "(option, selectedValues) => boolean" },
            { prop: "searchable", description: "在选择框本体内启用搜索，单选和多选共用同一交互形态", type: "boolean", default: "false" },
            { prop: "showSearch", description: "searchable 的等价别名", type: "boolean", default: "false" },
            { prop: "searchValue / defaultSearchValue", description: "受控搜索词 / 非受控初始搜索词；多选 searchable 时输入框位于标签同一触发器内", type: "string" },
            { prop: "onSearch", description: "搜索词交互变化回调；多选选中不会清空关键词，关闭时清空并回调空字符串", type: "(value: string) => void" },
            { prop: "filterOption", description: "自定义过滤", type: "(input, option) => boolean" },
            { prop: "optionFilterProp", description: "默认过滤使用的 option 字段", type: `"label" | "value" | "text" | string` },
            { prop: "clearable", description: "显示独立且可访问的清除按钮", type: "boolean", default: "false" },
            { prop: "allowClear", description: "clearable 的等价别名", type: "boolean | { clearIcon? }", default: "false" },
            { prop: "onClear", description: "用户点击清除按钮后触发", type: "() => void" },
            { prop: "open / defaultOpen / onOpenChange", description: "受控或非受控菜单显隐；非受控组件禁用时会关闭", type: "boolean / (open: boolean) => void" },
            { prop: "id / aria-*", description: "转发到实际 combobox 触发节点，便于 Form.Item 关联标签和错误说明", type: "原生属性" },
            { prop: "menuClassName / popupClassName / dropdownClassName", description: "浮层菜单 className 别名", type: "string" },
            { prop: "loading", description: "加载态", type: "boolean", default: "false" },
            { prop: "emptyContent", description: "空态文案", type: "ReactNode" },
            { prop: "optionRender", description: "自定义菜单内完整选项内容，并获得 selected / active / index 状态", type: "(option, info) => ReactNode" },
            { prop: "optionExtraRender", description: "自定义选项尾部的独立内容或操作，不触发选中；info 含 disabled / groupPinned", type: "(option, info) => ReactNode" },
            { prop: "selectedRender", description: "自定义触发器中的紧凑已选内容；单选和多选标签均支持", type: "(option, info) => ReactNode" },
            { prop: "listHeight", description: "菜单选项滚动区域最大高度", type: "number", default: "260" },
            { prop: "popupStyle", description: "Portal 菜单内联样式，可覆盖宽度或高度", type: "CSSProperties" },
            { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
            { prop: "invalid", description: "错误态", type: "boolean", default: "false" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
        {
          title: "SelectOption",
          rows: [
            { prop: "value", description: "值", type: "T", required: true },
            { prop: "label", description: "显示", type: "ReactNode" },
            { prop: "text", description: "复杂 label 的独立搜索文本", type: "string" },
            { prop: "ariaLabel", description: "复杂选项或 optionRender 的独立可访问名称", type: "string" },
            { prop: "icon", description: "前置图标,可传内置图标名或自定义节点", type: "IconName | ReactNode" },
            { prop: "description", description: "次要描述", type: "ReactNode" },
            { prop: "extra", description: "选项尾部的静态独立内容或操作；optionExtraRender 存在时由其覆盖", type: "ReactNode" },
            { prop: "disabled", description: "禁用项", type: "boolean", default: "false" },
          ],
        },
        {
          title: "SelectOptionGroup",
          rows: [
            { prop: "label", description: "分组标题", type: "ReactNode", required: true },
            { prop: "options", description: "分组内选项", type: "SelectOption<T>[]", required: true },
            { prop: "pinned", description: "稳定提升到菜单顶部，其他项目保持原始顺序", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "select",
  group: "表单",
  order: 60,
  label: "Select 下拉",
  eyebrow: "DATA ENTRY",
  title: "Select 下拉选择",
  desc: "下拉选择,支持单/多选、搜索、分组、加载态。",
  Component: SectionSelect,
});
