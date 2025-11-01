import React, { useState } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import { HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalSaveSurcharge from "./ModalSaveSurcharge";

const statusOptions = [
  { value: "", label: "Trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngừng" },
];

const surchargeListInit = [
  {
    id: 1,
    name: "Phí quá giờ",
    price: "50,000",
    description: "Phụ thu khi trả xe muộn",
    status: "active",
  },
  {
    id: 2,
    name: "Phí giao nhận xe",
    price: "30,000",
    description: "Phụ thu khi giao nhận xe tận nơi",
    status: "active",
  },
  {
    id: 3,
    name: "Phí đi đường dài",
    price: "100,000",
    description: "Phụ thu khi đi ngoài khu vực",
    status: "inactive",
  },
];

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "#27ae60" },
  inactive: { label: "Ngừng", color: "#ff4d4f" },
};

const SurchargeList = () => {
  const [filter, setFilter] = useState({ search: "", status: "" });
  const [surcharges, setSurcharges] = useState(surchargeListInit);
  const [showModal, setShowModal] = useState(false);
  const [editSurcharge, setEditSurcharge] = useState<any>(null);

  const filteredSurcharges = surcharges.filter(
    (s) =>
      (!filter.search ||
        s.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        s.price.includes(filter.search)) &&
      (!filter.status || s.status === filter.status)
  );

  const handleEdit = (surcharge: any) => {
    setEditSurcharge(surcharge);
    setShowModal(true);
  };

  const handleDelete = (surchargeId: number) => {
    setSurcharges(surcharges.filter((s) => s.id !== surchargeId));
  };

  const handleSave = (surcharge: any) => {
    if (surcharge.id) {
      setSurcharges(
        surcharges.map((s) => (s.id === surcharge.id ? { ...surcharge } : s))
      );
    } else {
      setSurcharges([
        ...surcharges,
        { ...surcharge, id: surcharges.length + 1, status: "active" },
      ]);
    }
    setShowModal(false);
    setEditSurcharge(null);
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase
          title="Danh sách phụ thu"
          items={[
            { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
            { label: "Danh sách phụ thu", path: "/surcharge" },
          ]}
        />
        <ContainerBase>
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div className="dp_flex" style={{ gap: 16, alignItems: "center" }}>
              <InputBase
                modelValue={filter.search}
                placeholder="Tìm theo tên phụ thu, đơn giá"
                prefixIcon="search"
                style={{ minWidth: 320, flex: 1 }}
                onChange={(val) =>
                  setFilter({ ...filter, search: val as string })
                }
              />
              <SelectboxBase
                value={filter.status}
                options={statusOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter({
                    ...filter,
                    status: typeof val === "string" ? val : val[0] || "",
                  })
                }
              />
              <ButtonBase
                label="Thêm phụ thu"
                className="btn_primary"
                icon={<PlusOutlined />}
                style={{ minWidth: 160, marginLeft: "auto" }}
                onClick={() => {
                  setEditSurcharge(null);
                  setShowModal(true);
                }}
              />
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section">
            <TableBase
              data={filteredSurcharges}
              columns={[
                {
                  title: "STT",
                  dataIndex: "id",
                  key: "id",
                  width: 60,
                  render: (_: any, __: any, idx: number) => idx + 1,
                },
                {
                  title: "Tên phụ thu",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Đơn giá",
                  dataIndex: "price",
                  key: "price",
                },
                {
                  title: "Mô tả",
                  dataIndex: "description",
                  key: "description",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: 120,
                  render: (val: string) => (
                    <span
                      style={{
                        background: val === "active" ? "#eafbe7" : "#fff1f0",
                        color: statusMap[val]?.color,
                        borderRadius: 8,
                        padding: "2px 12px",
                        fontWeight: 500,
                        fontSize: 14,
                        display: "inline-block",
                        minWidth: 80,
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
                        onClick={() => handleEdit(record)}
                        title="Sửa"
                      />
                      <ButtonBase
                        icon={<DeleteOutlined />}
                        className="btn_gray"
                        onClick={() => handleDelete(record.id)}
                        title="Xóa"
                      />
                    </div>
                  ),
                },
              ]}
              pageSize={5}
            />
          </div>
        </ContainerBase>
        <ModalSaveSurcharge
          open={showModal}
          surcharge={editSurcharge}
          onClose={() => {
            setShowModal(false);
            setEditSurcharge(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default SurchargeList;
