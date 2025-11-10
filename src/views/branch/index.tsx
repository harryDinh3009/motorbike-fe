import React, { useState, useEffect } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import {
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ModalSaveBranch from "./ModalSaveBranch";
import {
  searchBranches,
  saveBranch as apiSaveBranch,
  deleteBranch as apiDeleteBranch,
  getBranchDetail,
} from "@/service/business/branchMng/branchMng.service";
import {
  BranchDTO,
  BranchSaveDTO,
} from "@/service/business/branchMng/branchMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";

const statusOptions = [
  { value: "", label: "Trạng thái" },
  { value: 1, label: "Hoạt động" },
  { value: 0, label: "Ngừng" },
];

const statusMap: Record<number, { label: string; color: string; bg: string }> =
  {
    1: { label: "Hoạt động", color: "#27ae60", bg: "#eafbe7" },
    0: { label: "Ngừng", color: "#ff4d4f", bg: "#fff1f0" },
  };

const BranchList = () => {
  const [filter, setFilter] = useState<{
    search: string;
    status: string | number;
  }>({ search: "", status: 1 }); // Default to active branches
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState<BranchDTO | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        keyword: filter.search,
        status: filter.status === "" ? undefined : Number(filter.status),
        page: page,
        size: pageSize,
      };
      const res = await searchBranches(params);
      const apiData = res.data as any;
      console.log(res);

      setBranches(apiData.data || []);

      setTotal(apiData.totalPages || 0);
    } catch (err: any) {
      setError("Không thể tải danh sách chi nhánh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, pageSize]);

  const handleEdit = async (branch: BranchDTO) => {
    setLoading(true);
    try {
      const res = await getBranchDetail(branch.id);
      setEditBranch(res.data);
      setShowModal(true);
    } catch (err) {
      setError("Không thể lấy thông tin chi nhánh");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (branchId: string) => {
    setLoading(true);
    try {
      await apiDeleteBranch(branchId);
      fetchBranches();
    } catch (err) {
      setError("Xóa chi nhánh thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (branch: any) => {
    setLoading(true);
    try {
      const payload: BranchSaveDTO = {
        id: branch.id,
        name: branch.name,
        phoneNumber: branch.phone || branch.phoneNumber,
        address: branch.address,
        note: branch.note,
        status:
          branch.status === true ||
          branch.status === 1 ||
          branch.status === "active"
            ? 1
            : 0,
      };
      await apiSaveBranch(payload);
      setShowModal(false);
      setEditBranch(null);
      fetchBranches();
    } catch (err) {
      setError("Lưu chi nhánh thất bại");
    } finally {
      setLoading(false);
    }
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
                onChange={(val) => {
                  let v: string | number = "";
                  if (Array.isArray(val)) {
                    v = val[0] || "";
                  } else if (
                    typeof val === "string" ||
                    typeof val === "number"
                  ) {
                    v = val;
                  }
                  setFilter({ ...filter, status: v });
                }}
              />
              <ButtonBase
                label="Thêm chi nhánh"
                className="btn_primary"
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
            {loading && <LoadingIndicator />}
            {error && (
              <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
            )}
            <TableBase
              data={branches.map((b, idx) => ({
                ...b,
                phone: b.phoneNumber,
                statusLabel: statusMap[b.status]?.label,
                statusColor: statusMap[b.status]?.color,
                statusBg: statusMap[b.status]?.bg,
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
                  width: 160,
                  render: (val: number, record: any) => (
                    <span
                      style={{
                        background: record.statusBg,
                        color: record.statusColor,
                        borderRadius: 8,
                        padding: "2px 12px",
                        fontWeight: 500,
                        fontSize: 14,
                        display: "inline-block",
                        minWidth: 80,
                        textAlign: "center",
                      }}
                    >
                      {record.statusLabel}
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
