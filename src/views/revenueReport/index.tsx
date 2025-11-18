import React, { useState, useEffect } from "react";
import { Button, Form, Select, DatePicker, message } from "antd";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import dayjs from "dayjs";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import {
  exportMonthlyRevenueReport,
  MonthlyRevenueReportRequestDTO,
} from "@/service/business/contractMng/contractMng.service";

const { Option } = Select;

const RevenueReport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [branchOptions, setBranchOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    getAllActiveBranches().then((res) => {
      setBranchOptions(
        (res.data || []).map((b: any) => ({ label: b.name, value: b.id }))
      );
    });
  }, []);

  const handleExport = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const params: MonthlyRevenueReportRequestDTO = {
        year: values.year.year(),
        branchId: values.branchId,
      };
      const blob = await exportMonthlyRevenueReport(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_Cao_Doanh_Thu_${params.year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success("Xuất báo cáo thành công!");
    } catch (err) {
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
        <ContainerBase id="revenue-report">
          <Form
            form={form}
            layout="vertical"
            initialValues={{}}
            style={{ maxWidth: 500, margin: "0 auto" }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <Form.Item
                label="Năm"
                name="year"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "Vui lòng chọn năm" }]}
              >
                <DatePicker
                  picker="year"
                  style={{ width: "100%" }}
                  placeholder="Chọn năm"
                />
              </Form.Item>
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

export default RevenueReport;
