// TimelineBase.tsx
import React from "react";
import { Timeline } from "antd";
import type { TimelineItemProps } from "antd/lib/timeline";
import styles from "./style.module.css";

interface TimelineItem {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface TimelineBaseProps {
  items: TimelineItem[];
  direction?: "horizontal" | "vertical";
  currentStep?: number;
  completedStepStyle?: React.CSSProperties;
  currentStepStyle?: React.CSSProperties;
  upcomingStepStyle?: React.CSSProperties;
}

const TimelineBase: React.FC<TimelineBaseProps> = ({
  items,
  direction = "horizontal",
  currentStep = 0,
  completedStepStyle,
  currentStepStyle,
  upcomingStepStyle,
}) => {
  return (
    <Timeline mode={direction === "vertical" ? "left" : "alternate"}>
      {items.map((item, index) => {
        let itemStyle: React.CSSProperties = upcomingStepStyle || {};

        if (index < currentStep) {
          itemStyle = completedStepStyle || { color: "gray" };
        } else if (index === currentStep) {
          itemStyle = currentStepStyle || { color: "blue", fontWeight: "bold" };
        }

        return (
          <Timeline.Item
            key={index}
            dot={item.icon}
            style={itemStyle as TimelineItemProps["style"]}
          >
            <h4 className={styles.labelCustom}>{item.title}</h4>
            <div className="mg_t10">{item.description && <p>{item.description}</p>}</div>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default TimelineBase;
