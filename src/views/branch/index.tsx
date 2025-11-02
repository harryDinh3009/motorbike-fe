import React, { useState } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import { HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalSaveBranch from "./ModalSaveBranch";

const statusOptions = [
  { value: "", label: "Trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngừng" },
];

const branchListInit = [
  {
    id: 1,
    name: "Chi nhánh trung tâm",
    address: "123 Xuân Thuỷ, Cầu Giấy",
    phone: "024.3456.7890",
    status: "active",
  },
  {
    id: 2,
    name: "Chi nhánh Đống Đa",
    address: "456 Thái Hà, Đống Đa",
    phone: "024.3567.8901",
    status: "active",
  },
  {
    id: 3,
    name: "Chi nhánh Quận 1",
    address: "789 Nguyễn Huệ, Q1",
    phone: "028.3678.9012",
    status: "inactive",
  },
];

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "#27ae60" },
  inactive: { label: "Ngừng", color: "#ff4d4f" },
};

const BranchList = () => {
  const [filter, setFilter] = useState({ search: "", status: "" });
  const [branches, setBranches] = useState(branchListInit);
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState<any>(null);

  const filteredBranches = branches.filter(
    (b) =>
      (!filter.search ||
        b.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        b.phone.includes(filter.search)) &&
      (!filter.status || b.status === filter.status)
  );

  const handleEdit = (branch: any) => {
    setEditBranch(branch);
    setShowModal(true);
  };

  const handleDelete = (branchId: number) => {
    setBranches(branches.filter((b) => b.id !== branchId));
  };

  const handleSave = (branch: any) => {
    if (branch.id) {
      setBranches(
        branches.map((b) => (b.id === branch.id ? { ...branch } : b))
      );
    } else {
      setBranches([
        ...branches,
        { ...branch, id: branches.length + 1, status: "active" },
      ]);
    }
    setShowModal(false);
    setEditBranch(null);
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase
          title="Danh sách chi nhánh"
          items={[
            { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
            { label: "Danh sách chi nhánh", path: "/branch" },
          ]}
        />
        <ContainerBase>
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div className="dp_flex" style={{ gap: 16, alignItems: "center" }}>
              <InputBase
                modelValue={filter.search}
                placeholder="Tìm theo tên chi nhánh , số điện thoại"
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
                label="Thêm chi nhánh"
                className="btn_yellow"
                icon={<PlusOutlined />}
                style={{ minWidth: 160, marginLeft: "auto" }}
                onClick={() => {
                  setEditBranch(null);
                  setShowModal(true);
                }}
              />
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section">
            <TableBase
              data={filteredBranches}
              columns={[
                {
                  title: "STT",
                  dataIndex: "id",
                  key: "id",
                  width: 60,
                  render: (_: any, __: any, idx: number) => idx + 1,
                },
                {
                  title: "Tên chi nhánh",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Địa chỉ",
                  dataIndex: "address",
                  key: "address",
                },
                {
                  title: "Số điện thoại",
                  dataIndex: "phone",
                  key: "phone",
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
        <ModalSaveBranch
          open={showModal}
          branch={editBranch}
          onClose={() => {
            setShowModal(false);
            setEditBranch(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default BranchList;
