import React, { useState } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import { HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalSaveEmployee from "./ModalSaveEmployee";

const branchOptions = [
  { value: "", label: "Chi nhánh" },
  { value: "center", label: "Chi nhánh trung tâm" },
  { value: "dongda", label: "Chi nhánh Đống Đa" },
];
const roleOptions = [
  { value: "", label: "Chức vụ" },
  { value: "manager", label: "Quản lý" },
  { value: "staff", label: "Nhân viên" },
];
const statusOptions = [
  { value: "", label: "Trạng thái" },
  { value: "active", label: "Đang làm" },
  { value: "inactive", label: "Nghỉ" },
];

const employeeListInit = [
  {
    id: 1,
    name: "Đinh Mạnh Hòa",
    phone: "0912345678",
    email: "an.nguyen@company.com",
    branch: "Chi nhánh trung tâm",
    role: "Quản lý",
    status: "active",
  },
  {
    id: 2,
    name: "Đinh Mạnh Hòa",
    phone: "0912345678",
    email: "an.nguyen@company.com",
    branch: "Chi nhánh trung tâm",
    role: "Quản lý",
    status: "active",
  },
  {
    id: 3,
    name: "Đinh Mạnh Hòa",
    phone: "0912345678",
    email: "an.nguyen@company.com",
    branch: "Chi nhánh trung tâm",
    role: "Quản lý",
    status: "active",
  },
];

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Đang làm", color: "#27ae60", bg: "#eafbe7" },
  inactive: { label: "Nghỉ", color: "#ff4d4f", bg: "#fff1f0" },
};

const EmployeeList = () => {
  const [filter, setFilter] = useState({ search: "", branch: "", role: "", status: "" });
  const [employees, setEmployees] = useState(employeeListInit);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);

  const filteredEmployees = employees.filter(
    (e) =>
      (!filter.search ||
        e.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        e.phone.includes(filter.search) ||
        e.email.toLowerCase().includes(filter.search.toLowerCase())) &&
      (!filter.branch || e.branch === branchOptions.find(b => b.value === filter.branch)?.label) &&
      (!filter.role || e.role === roleOptions.find(r => r.value === filter.role)?.label) &&
      (!filter.status || (filter.status === "active" ? e.status === "active" : e.status === "inactive"))
  );

  const handleEdit = (employee: any) => {
    setEditEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = (employeeId: number) => {
    setEmployees(employees.filter((e) => e.id !== employeeId));
  };

  const handleSave = (employee: any) => {
    if (employee.id) {
      setEmployees(
        employees.map((e) => (e.id === employee.id ? { ...employee } : e))
      );
    } else {
      setEmployees([
        ...employees,
        { ...employee, id: employees.length + 1, status: "active" },
      ]);
    }
    setShowModal(false);
    setEditEmployee(null);
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase
          title="Nhân viên"
          items={[
            { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
            { label: "Nhân viên", path: "/employee" },
          ]}
        />
        <ContainerBase>
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div className="dp_flex" style={{ gap: 16, alignItems: "center" }}>
              <InputBase
                modelValue={filter.search}
                placeholder="Tìm theo tên, SĐT, email..."
                prefixIcon="search"
                style={{ minWidth: 320, flex: 1 }}
                onChange={(val) => setFilter({ ...filter, search: val as string })}
              />
              <SelectboxBase
                value={filter.branch}
                options={branchOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter({ ...filter, branch: typeof val === "string" ? val : val[0] || "" })
                }
              />
              <SelectboxBase
                value={filter.role}
                options={roleOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter({ ...filter, role: typeof val === "string" ? val : val[0] || "" })
                }
              />
              <SelectboxBase
                value={filter.status}
                options={statusOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter({ ...filter, status: typeof val === "string" ? val : val[0] || "" })
                }
              />
              <ButtonBase
                label="+ Thêm người dùng"
                className="btn_yellow"
                style={{ minWidth: 180, marginLeft: "auto" }}
                onClick={() => {
                  setEditEmployee(null);
                  setShowModal(true);
                }}
              />
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section">
            <TableBase
              data={filteredEmployees}
              columns={[
                {
                  title: "STT",
                  dataIndex: "id",
                  key: "id",
                  width: 60,
                  render: (_: any, __: any, idx: number) => idx + 1,
                },
                {
                  title: "Họ tên",
                  dataIndex: "name",
                  key: "name",
                  render: (val: string) => <b>{val}</b>,
                },
                {
                  title: "Số điện thoại",
                  dataIndex: "phone",
                  key: "phone",
                },
                {
                  title: "Email",
                  dataIndex: "email",
                  key: "email",
                },
                {
                  title: "Chức vụ",
                  dataIndex: "role",
                  key: "role",
                },
                {
                  title: "Chi nhánh",
                  dataIndex: "branch",
                  key: "branch",
                },
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
        <ModalSaveEmployee
          open={showModal}
          employee={editEmployee}
          onClose={() => {
            setShowModal(false);
            setEditEmployee(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default EmployeeList;
