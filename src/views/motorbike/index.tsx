import React, { useState } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import { HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, FileExcelOutlined, ImportOutlined } from "@ant-design/icons";
import ModalSaveMotorbike from "./ModalSaveMotorbike";

const branchOptions = [
  { value: "", label: "Chi nhánh" },
  { value: "1", label: "Chi nhánh 1" },
  { value: "2", label: "Chi nhánh 2" },
];
const modelOptions = [
  { value: "", label: "Mẫu xe" },
  { value: "Honda Wave Alpha", label: "Honda Wave Alpha" },
  { value: "Yamaha Sirius", label: "Yamaha Sirius" },
  { value: "Yamaha PG-1", label: "Yamaha PG-1" },
  { value: "Honda XR150", label: "Honda XR150" },
  { value: "Honda Winner 150", label: "Honda Winner 150" },
];
const typeOptions = [
  { value: "", label: "Loại xe" },
  { value: "Xe số", label: "Xe số" },
  { value: "Xe ga", label: "Xe ga" },
  { value: "Xe cào cào", label: "Xe cào cào" },
  { value: "Xe tay côn", label: "Xe tay côn" },
];
const statusOptions = [
  { value: "", label: "Trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "not_ready", label: "Không sẵn sàng" },
  { value: "lost", label: "Bị mất" },
  { value: "broken", label: "Hỏng hóc" },
];
const conditionOptions = [
  { value: "", label: "Tình trạng xe" },
  { value: "Nguyên vẹn", label: "Nguyên vẹn" },
  { value: "Hỏng hóc", label: "Hỏng hóc" },
];

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Hoạt động", color: "#27ae60", bg: "#eafbe7" },
  not_ready: { label: "Không sẵn sàng", color: "#f5a623", bg: "#fffbe6" },
  lost: { label: "Bị mất", color: "#ff4d4f", bg: "#fff1f0" },
  broken: { label: "Hỏng hóc", color: "#ff4d4f", bg: "#fff1f0" },
};

const motorbikeListInit = [
  {
    id: 1,
    model: "Honda Wave Alpha",
    license: "34E-06869",
    type: "Xe số",
    branch: "Chi nhánh 1",
    priceDay: "120,000",
    priceHour: "120,000",
    condition: "Nguyên vẹn",
    status: "active",
  },
  {
    id: 2,
    model: "Yamaha Sirius",
    license: "34E-06869",
    type: "Xe số",
    branch: "Chi nhánh 1",
    priceDay: "120,000",
    priceHour: "130,000",
    condition: "Nguyên vẹn",
    status: "active",
  },
  {
    id: 3,
    model: "Yamaha PG-1",
    license: "34E-06869",
    type: "Xe ga",
    branch: "Chi nhánh 1",
    priceDay: "120,000",
    priceHour: "140,000",
    condition: "Nguyên vẹn",
    status: "not_ready",
  },
  {
    id: 4,
    model: "Honda XR150",
    license: "34E-06869",
    type: "Xe cào cào",
    branch: "Chi nhánh 1",
    priceDay: "120,000",
    priceHour: "120,000",
    condition: "Hỏng hóc",
    status: "lost",
  },
  {
    id: 5,
    model: "Honda Winner 150",
    license: "34E-06869",
    type: "Xe tay côn",
    branch: "Chi nhánh 1",
    priceDay: "120,000",
    priceHour: "120,000",
    condition: "Hỏng hóc",
    status: "lost",
  },
  {
    id: 6,
    model: "Honda Wave Alpha",
    license: "34E-06869",
    type: "Xe số",
    branch: "Chi nhánh 1",
    priceDay: "120,000",
    priceHour: "120,000",
    condition: "Nguyên vẹn",
    status: "active",
  },
  {
    id: 7,
    model: "Yamaha Sirius",
    license: "34E-06869",
    type: "Xe số",
    branch: "Chi nhánh 2",
    priceDay: "120,000",
    priceHour: "120,000",
    condition: "Nguyên vẹn",
    status: "not_ready",
  },
  {
    id: 8,
    model: "Yamaha PG-1",
    license: "34E-06869",
    type: "Xe ga",
    branch: "Chi nhánh 2",
    priceDay: "120,000",
    priceHour: "140,000",
    condition: "Nguyên vẹn",
    status: "lost",
  },
  {
    id: 9,
    model: "Honda Wave Alpha",
    license: "34E-06869",
    type: "Xe số",
    branch: "Chi nhánh 2",
    priceDay: "120,000",
    priceHour: "120,000",
    condition: "Nguyên vẹn",
    status: "active",
  },
  {
    id: 10,
    model: "Yamaha Sirius",
    license: "34E-06869",
    type: "Xe số",
    branch: "Chi nhánh 2",
    priceDay: "120,000",
    priceHour: "120,000",
    condition: "Nguyên vẹn",
    status: "not_ready",
  },
];

const MotorbikeList = () => {
  const [filter, setFilter] = useState({
    search: "",
    branch: "",
    model: "",
    type: "",
    condition: "",
    status: "",
  });
  const [motorbikes, setMotorbikes] = useState(motorbikeListInit);

  // Thêm state cho modal
  const [showModal, setShowModal] = useState(false);
  const [editMotorbike, setEditMotorbike] = useState<any>(null);

  const filteredMotorbikes = motorbikes.filter((m) =>
    (!filter.search ||
      m.model.toLowerCase().includes(filter.search.toLowerCase()) ||
      m.license.toLowerCase().includes(filter.search.toLowerCase())) &&
    (!filter.branch || m.branch === branchOptions.find(b => b.value === filter.branch)?.label) &&
    (!filter.model || m.model === filter.model) &&
    (!filter.type || m.type === filter.type) &&
    (!filter.condition || m.condition === filter.condition) &&
    (!filter.status || m.status === filter.status)
  );

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase
          title="Danh sách xe"
          items={[
            { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
            { label: "Danh sách xe", path: "/motorbike" },
          ]}
        />
        <ContainerBase>
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div className="dp_flex" style={{ gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <InputBase
                modelValue={filter.search}
                placeholder="Tìm theo tên xe, biển số"
                prefixIcon="search"
                style={{ minWidth: 320, flex: 1 }}
                onChange={val => setFilter({ ...filter, search: val as string })}
              />
              <SelectboxBase
                value={filter.branch}
                options={branchOptions}
                style={{ minWidth: 140 }}
                onChange={val => setFilter({ ...filter, branch: typeof val === "string" ? val : val[0] || "" })}
              />
              <SelectboxBase
                value={filter.model}
                options={modelOptions}
                style={{ minWidth: 140 }}
                onChange={val => setFilter({ ...filter, model: typeof val === "string" ? val : val[0] || "" })}
              />
              <SelectboxBase
                value={filter.type}
                options={typeOptions}
                style={{ minWidth: 140 }}
                onChange={val => setFilter({ ...filter, type: typeof val === "string" ? val : val[0] || "" })}
              />
              <SelectboxBase
                value={filter.condition}
                options={conditionOptions}
                style={{ minWidth: 140 }}
                onChange={val => setFilter({ ...filter, condition: typeof val === "string" ? val : val[0] || "" })}
              />
              <SelectboxBase
                value={filter.status}
                options={statusOptions}
                style={{ minWidth: 140 }}
                onChange={val => setFilter({ ...filter, status: typeof val === "string" ? val : val[0] || "" })}
              />
              <ButtonBase
                label="Xuất Excel"
                className="btn_yellow"
                icon={<FileExcelOutlined />}
                style={{ minWidth: 140 }}
                onClick={() => {}}
              />
              <ButtonBase
                label="Nhập Excel"
                className="btn_yellow"
                icon={<ImportOutlined />}
                style={{ minWidth: 140 }}
                onClick={() => {}}
              />
              <ButtonBase
                label="Thêm xe"
                className="btn_primary"
                icon={<PlusOutlined />}
                style={{ minWidth: 140 }}
                onClick={() => {
                  setEditMotorbike(null);
                  setShowModal(true);
                }}
              />
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section">
            <TableBase
              data={filteredMotorbikes}
              columns={[
                {
                  title: "STT",
                  dataIndex: "id",
                  key: "id",
                  width: 60,
                  render: (_: any, __: any, idx: number) => idx + 1,
                },
                { title: "Mẫu xe", dataIndex: "model", key: "model" },
                { title: "Biển số", dataIndex: "license", key: "license" },
                { title: "Loại xe", dataIndex: "type", key: "type" },
                { title: "Chi nhánh sở hữu", dataIndex: "branch", key: "branch" },
                { title: "Giá ngày (Đ)", dataIndex: "priceDay", key: "priceDay" },
                { title: "Giá giờ (Đ)", dataIndex: "priceHour", key: "priceHour" },
                { title: "Tình trạng xe", dataIndex: "condition", key: "condition" },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: 120,
                  render: (val: string) => (
                    <span
                      style={{
                        background: statusMap[val]?.bg,
                        color: statusMap[val]?.color,
                        borderRadius: 8,
                        padding: "2px 12px",
                        fontWeight: 500,
                        fontSize: 14,
                        display: "inline-block",
                        minWidth: 100,
                        textAlign: "center",
                      }}
                    >
                      {statusMap[val]?.label}
                    </span>
                  ),
                },
                {
                  title: "Hành động",
                  key: "actions",
                  width: 100,
                  render: (_: any, record: any) => (
                    <div className="dp_flex" style={{ gap: 8 }}>
                      <ButtonBase
                        icon={<EditOutlined />}
                        className="btn_gray"
                        onClick={() => {}}
                        title="Sửa"
                      />
                      <ButtonBase
                        icon={<DeleteOutlined />}
                        className="btn_gray"
                        onClick={() => {}}
                        title="Xóa"
                      />
                    </div>
                  ),
                },
              ]}
              pageSize={10}
            />
          </div>
        </ContainerBase>
        <ModalSaveMotorbike
          open={showModal}
          motorbike={editMotorbike}
          onClose={() => {
            setShowModal(false);
            setEditMotorbike(null);
          }}
          onSave={(motorbike) => {
            setMotorbikes([
              ...motorbikes,
              { ...motorbike, id: motorbikes.length + 1, status: "active" },
            ]);
            setShowModal(false);
            setEditMotorbike(null);
          }}
        />
      </div>
    </div>
  );
};

export default MotorbikeList;
