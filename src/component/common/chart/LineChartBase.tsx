import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  ChartOptions,
  PointElement,
} from "chart.js";
import { Dropdown, Menu } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  Title,
  Tooltip,
  PointElement,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale
);

interface LineChartBaseProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }[];
  };
  options?: ChartOptions;
  width?: number;
  height?: number;
  isDownload?: boolean;
}

const LineChartBase: React.FC<LineChartBaseProps> = ({
  data,
  options,
  width = 600,
  height = 400,
  isDownload = false,
}) => {
  const chartRef = React.useRef<any>(null);

  const downloadChart = (format: string) => {
    const chart = chartRef.current;
    if (!chart) return;

    const canvas = chart.canvas;
    let link = document.createElement("a");
    link.download = `chart.${format}`;

    if (format === "png") {
      link.href = canvas.toDataURL("image/png");
    } else if (format === "jpeg") {
      link.href = canvas.toDataURL("image/jpeg");
    }

    link.click();
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => downloadChart("png")}>
        <span style={{ cursor: "pointer", color: "#1890ff" }}>
          Download PNG
        </span>
      </Menu.Item>
      <Menu.Item key="2" onClick={() => downloadChart("jpeg")}>
        <span style={{ cursor: "pointer", color: "#1890ff" }}>
          Download JPEG
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {isDownload && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 10,
            width: `${width}px`,
          }}
        >
          <Dropdown overlay={menu} placement="bottomRight" arrow>
            <FontAwesomeIcon icon={faBars} style={{ cursor: "pointer" }} />
          </Dropdown>
        </div>
      )}
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: "relative",
        }}
      >
        <Line
          ref={chartRef}
          data={data}
          options={{ ...options }}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            position: "relative",
          }}
        />
      </div>
    </>
  );
};

export default LineChartBase;
