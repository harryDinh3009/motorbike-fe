import React, { useState, useEffect } from "react";
import { Button, DatePicker, Select, Form, message } from "antd";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import dayjs from "dayjs";
import {
  exportAvailableCarsReport,
  AvailableCarReportRequestDTO,
  getCarTypes,
} from "@/service/business/carMng/carMng.service";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import { getCarModels } from "@/service/business/carMng/carModelMng.service";

const { RangePicker } = DatePicker;

const CarAvailableReport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [branchOptions, setBranchOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [carTypeOptions, setCarTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [modelOptions, setModelOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    // Fetch branches
    getAllActiveBranches().then((res) => {
      setBranchOptions(
        (res.data || []).map((b: any) => ({ label: b.name, value: b.id }))
      );
    });
    // Fetch car types
    getCarTypes().then((res) => {
      setCarTypeOptions(
        (res.data || []).map((t: string) => ({ label: t, value: t }))
      );
    });
    // Fetch car models
    getCarModels().then((res) => {
      setModelOptions(
        (res.data || []).map((m: string) => ({ label: m, value: m }))
      );
    });
  }, []);

  const handleExport = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const params: AvailableCarReportRequestDTO = {
        branchId: values.branchId,
        modelName: values.modelName,
        carType: values.carType,
        startDate: values.dateRange?.[0]
          ? dayjs(values.dateRange[0]).format("YYYY-MM-DD")
          : undefined,
        endDate: values.dateRange?.[1]
          ? dayjs(values.dateRange[1]).format("YYYY-MM-DD")
          : undefined,
      };
      const blob = await exportAvailableCarsReport(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Bao_cao_xe_kha_dung.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      message.success("Xuất báo cáo thành công!");
    } catch (err) {
      // Nếu là lỗi validate thì không gọi API, không báo lỗi chung
      if (typeof err === "object" && err !== null && "errorFields" in err)
        return;
      message.error("Xuất báo cáo thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <ContainerBase id="car-available-report">
          <Form
            form={form}
            layout="vertical"
            initialValues={{}}
            style={{ maxWidth: 600, margin: "0 auto" }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                label="Chi nhánh"
                name="branchId"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
              >
                <Select
                  options={branchOptions}
                  allowClear
                  placeholder="Chọn chi nhánh"
                  showSearch
                />
              </Form.Item>
              <Form.Item
                label="Tên mẫu xe"
                name="modelName"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "Vui lòng chọn mẫu xe" }]}
              >
                <Select
                  options={modelOptions}
                  allowClear
                  placeholder="Chọn mẫu xe"
                  showSearch
                />
              </Form.Item>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                label="Loại xe"
                name="carType"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "Vui lòng chọn loại xe" }]}
              >
                <Select
                  options={carTypeOptions}
                  allowClear
                  placeholder="Chọn loại xe"
                  showSearch
                />
              </Form.Item>
              <Form.Item
                label="Khoảng ngày"
                name="dateRange"
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: "Vui lòng chọn khoảng ngày" },
                ]}
              >
                <RangePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <Button
                type="primary"
                onClick={handleExport}
                loading={loading}
                style={{ minWidth: 200 }}
              >
                Xuất báo cáo PDF
              </Button>
            </div>
          </Form>
        </ContainerBase>
      </div>
    </div>
  );
};

export default CarAvailableReport;
