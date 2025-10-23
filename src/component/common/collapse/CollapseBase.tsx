import React from "react";
import { Collapse } from "antd";
import type { CollapseProps } from "antd/es/collapse";
import type { ReactNode } from "react";

const { Panel } = Collapse;

interface CollapsePanelItem {
  header: string;
  key: string;
  content: ReactNode; 
  icon?: ReactNode;
}

interface CollapseBaseProps extends CollapseProps {
  panels: CollapsePanelItem[]; 
}

const CollapseBase: React.FC<CollapseBaseProps> = ({ panels, ...props }) => {
  return (
    <Collapse {...props}>
      {panels.map((panel) => (
        <Panel
          key={panel.key}
          header={
            <div style={{ display: "flex", alignItems: "center" }}>
              {panel.icon && (
                <span style={{ marginRight: 8 }}>{panel.icon}</span>
              )}
              <span>{panel.header}</span>
            </div>
          }
        >
          {panel.content}
        </Panel>
      ))}
    </Collapse>
  );
};

export default CollapseBase;
