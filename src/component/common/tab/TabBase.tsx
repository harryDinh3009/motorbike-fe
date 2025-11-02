import React from "react";
import { Tabs, TabsProps } from "antd";

interface TabItem {
  label: string;
  key: string;
  content: React.ReactNode;
}

interface TabBaseProps {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  tabBarExtraContent?: React.ReactNode;
  defaultActiveKey?: string;
}

const TabBase: React.FC<TabBaseProps> = ({
  items,
  activeKey,
  onChange,
  tabBarExtraContent,
  defaultActiveKey,
}) => {
  const tabsItems: TabsProps["items"] = items.map((item) => ({
    label: item.label,
    key: item.key,
    children: item.content,
  }));

  return (
    <Tabs
      items={tabsItems}
      activeKey={activeKey}
      onChange={onChange}
      tabBarExtraContent={tabBarExtraContent}
      defaultActiveKey={defaultActiveKey}
    />
  );
};

export default TabBase;
