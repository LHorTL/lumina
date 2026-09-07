import * as React from "react";
import { Select, type MultiSelectProps } from "@fangxinyan/lumina";
import { Select as SubpathSelect } from "@fangxinyan/lumina/Select";

/** 验证正式根出口和 Select 子路径声明都包含自适应 API 与原生属性。 */
export function selectPackageTypeSmoke() {
  const props: MultiSelectProps<string> = {
    multiple: true,
    options: [{ value: "gift", label: "外观礼盒" }],
    maxTagCount: "responsive",
    value: ["gift"],
  };
  return <>
    <Select {...props} ref={React.createRef<HTMLDivElement>()} searchable allowClear
      style={{ width: 218 }} className="filter" data-check="select" aria-label="外观类型" theme="sky" />
    <SubpathSelect {...props} maxTagCount={2} />
    <SubpathSelect {...props} maxTagCount="responsive" />
    {/* @ts-expect-error 正式产物不接受未声明的字符串模式。 */}
    <SubpathSelect {...props} maxTagCount="auto" />
  </>;
}
