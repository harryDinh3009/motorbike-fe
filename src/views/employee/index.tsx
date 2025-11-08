import React, { useState, useEffect } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import { HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { message } from "antd";
import ModalSaveEmployee from "./ModalSaveEmployee";
import {
  getPageUser,
  saveUser as apiSaveUser,
  deleteUser as apiDeleteUser,
  detailUser,
} from "@/service/business/userMng/userMng.service";
import {
  UserMngListDTO,
  UserMngSaveDTO,
} from "@/service/business/userMng/userMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import { BranchDTO } from "@/service/business/branchMng/branchMng.type";

const roleOptions = [
  { value: "", label: "Chức vụ" },
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "STAFF", label: "Nhân viên" },
];

const statusOptions = [
  { value: "", label: "Trạng thái" },
  { value: "ACTIVE", label: "Đang làm" },
  { value: "INACTIVE", label: "Nghỉ" },
];

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "Đang làm", color: "#27ae60", bg: "#eafbe7" },
  INACTIVE: { label: "Nghỉ", color: "#ff4d4f", bg: "#fff1f0" },
};

const EmployeeList = () => {
  const [filter, setFilter] = useState({ 
    search: "", 
    branch: "", 
    role: "", 
    status: "" 
  });
  const [employees, setEmployees] = useState<UserMngListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<UserMngListDTO | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Chi nhánh" },
  ]);

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await getAllActiveBranches();
        const branches = res.data || [];
        setBranchOptions([
          { value: "", label: "Chi nhánh" },
          ...branches.map((b: BranchDTO) => ({
            value: b.id,
            label: b.name,
          })),
        ]);
      } catch (err) {
        console.error("Failed to load branches:", err);
      }
    };
    loadBranches();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        keyword: filter.search || undefined,
        branchId: filter.branch || undefined,
        role: filter.role || undefined,
        status: filter.status || undefined,
        page: page,
        size: pageSize,
      };
      const res = await getPageUser(params);
      const apiData = res.data as any;

      setEmployees(apiData.data || []);
      setTotal(apiData.totalPages || 0);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Không thể tải danh sách nhân viên";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, pageSize]);

  const handleEdit = async (employee: UserMngListDTO) => {
    setLoading(true);
    setError(null);
    try {
      const res = await detailUser(employee.id);
      setEditEmployee(res.data as any);
      setShowModal(true);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Không thể lấy thông tin nhân viên";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiDeleteUser(employeeId);
      message.success("Xóa nhân viên thành công!");
      fetchEmployees();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Xóa nhân viên thất bại";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (employee: any) => {
    setLoading(true);
    setError(null);
    try {
      const payload: UserMngSaveDTO = {
        id: employee.id,
        username: employee.username,
        fullName: employee.name,
        email: employee.email || undefined,
        password: employee.id ? undefined : employee.password, // Only send password when creating new user
        roleCd: employee.role || undefined,
        genderCd: employee.gender || undefined,
        phoneNumber: employee.phone,
        dateOfBirth: employee.birthday || undefined,
        address: employee.address || undefined,
        branchId: employee.branch || undefined,
        statusCd: employee.status || "ACTIVE",
      };
      await apiSaveUser(payload);
      // message.success(employee.id ? "Cập nhật nhân viên thành công!" : "Tạo mới nhân viên thành công!");
      setShowModal(false);
      setEditEmployee(null);
      fetchEmployees();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || (employee.id ? "Cập nhật nhân viên thất bại" : "Tạo mới nhân viên thất bại");
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
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
                onChange={(val) => {
                  let v: string = "";
                  if (Array.isArray(val)) {
                    v = val[0] || "";
                  } else if (typeof val === "string") {
                    v = val;
                  }
                  setFilter({ ...filter, branch: v });
                }}
              />
              <SelectboxBase
                value={filter.role}
                options={roleOptions}
                style={{ minWidth: 140 }}
                onChange={(val) => {
                  let v: string = "";
                  if (Array.isArray(val)) {
                    v = val[0] || "";
                  } else if (typeof val === "string") {
                    v = val;
                  }
                  setFilter({ ...filter, role: v });
                }}
              />
              <SelectboxBase
                value={filter.status}
                options={statusOptions}
                style={{ minWidth: 140 }}
                onChange={(val) => {
                  let v: string = "";
                  if (Array.isArray(val)) {
                    v = val[0] || "";
                  } else if (typeof val === "string") {
                    v = val;
                  }
                  setFilter({ ...filter, status: v });
                }}
              />
              <ButtonBase
                label="Thêm người dùng"
                className="btn_yellow"
                icon={<PlusOutlined />}
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
            {loading && <LoadingIndicator />}
            {error && (
              <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
            )}
            <TableBase
              data={employees.map((e, idx) => ({
                ...e,
                name: e.fullName,
                phone: e.phoneNumber,
                role: e.roleNm || "",
                branch: e.branchName || e.branchId || "",
                status: e.statusNm || "ACTIVE",
                idx,
              }))}
              columns={[
                {
                  title: "STT",
                  dataIndex: "id",
                  key: "id",
                  width: 60,
                  render: (_: any, __: any, idx: number) =>
                    (page - 1) * pageSize + idx + 1,
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
                  render: (val: string, record: any) => (
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
                      {statusMap[val]?.label || val}
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
                        label=""
                      />
                      <ButtonBase
                        icon={<DeleteOutlined />}
                        className="btn_gray"
                        onClick={() => handleDelete(record.id)}
                        title="Xóa"
                        label=""
                      />
                    </div>
                  ),
                },
              ]}
              pageSize={pageSize}
              paginationType="BE"
              totalPages={total}
              onPageChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
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
