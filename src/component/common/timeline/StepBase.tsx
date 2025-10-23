// StepBase.tsx
import React from "react";
import { Steps } from "antd";

const { Step } = Steps;

interface StepItem {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepBaseProps {
  steps: StepItem[];
  currentStep?: number;
  direction?: "horizontal" | "vertical";
  completedStepStyle?: React.CSSProperties;
  currentStepStyle?: React.CSSProperties;
  upcomingStepStyle?: React.CSSProperties;
}

const StepBase: React.FC<StepBaseProps> = ({
  steps,
  currentStep = 0,
  direction = "horizontal",
  completedStepStyle,
  currentStepStyle,
  upcomingStepStyle,
}) => {
  return (
    <Steps current={currentStep} direction={direction}>
      {steps.map((step, index) => {
        let stepStyle: React.CSSProperties = upcomingStepStyle || {};
        if (index < currentStep) {
          stepStyle = completedStepStyle || { color: "green" };
        } else if (index === currentStep) {
          stepStyle = currentStepStyle || { color: "blue", fontWeight: "bold" };
        }

        return (
          <Step
            key={index}
            title={step.title}
            description={step.description}
            icon={step.icon}
            style={stepStyle}
          />
        );
      })}
    </Steps>
  );
};

export default StepBase;
