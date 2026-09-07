import * as React from "react";
import { Select, type MultiSelectProps } from "../src/components/Select";

/** 自适应多选保留 ref、原生属性、主题以及数字 maxTagCount 的公共契约。 */
export function selectResponsiveTypeSmoke() {
  const props: MultiSelectProps<number> = {
    multiple: true,
    maxTagCount: "responsive",
    options: [{ value: 1, label: "外观礼盒" }],
    value: [1],
    onChange: (values: number[]) => { void values; },
  };
  return <>
    <Select {...props} ref={React.createRef<HTMLDivElement>()} className="filter"
      style={{ width: 218 }} data-testid="responsive" aria-label="外观类型" theme="sky"
      searchable allowClear />
    <Select {...props} maxTagCount={2} />
    <Select {...props} maxTagCount={undefined} />
    {/* @ts-expect-error 自适应计数仅接受正式字符串值。 */}
    <Select {...props} maxTagCount="auto" />
  </>;
}
