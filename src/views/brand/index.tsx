import React, { useState, useEffect } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import {
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ModalSaveBrand from "./ModalSaveBrand";
import {
  searchBrands,
  saveBrand as apiSaveBrand,
  deleteBrand as apiDeleteBrand,
  getBrandDetail,
} from "@/service/business/brandMng/brandMng.service";
import {
  BrandDTO,
  BrandSaveDTO,
} from "@/service/business/brandMng/brandMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import { useAlert } from "@/plugins/global";
import { message } from "antd";
import { canManageBrand } from "@/utils/permission";

const BrandList = () => {
  const [filter, setFilter] = useState<{
    search: string;
  }>({ search: "" });
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState<BrandDTO | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        keyword: filter.search,
        page: page,
        size: pageSize,
      };
      const res = await searchBrands(params);
      const apiData = res.data as any;

      setBrands(apiData.data || []);
      setTotal(apiData.totalRecords || 0);
    } catch (err: any) {
      setError("Không thể tải danh sách hãng xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, pageSize]);

  const handleEdit = async (brand: BrandDTO) => {
    setLoading(true);
    try {
      const res = await getBrandDetail(brand.id);
      setEditBrand(res.data);
      setShowModal(true);
    } catch (err) {
      setError("Không thể lấy thông tin hãng xe");
    } finally {
      setLoading(false);
    }
  };

  const { alert } = useAlert() || {};
  const handleDelete = async (brandId: string) => {
    setLoading(true);
    try {
      await apiDeleteBrand(brandId);
      message.success("Xóa hãng xe thành công");
      fetchBrands();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Xóa hãng xe thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (brand: any) => {
    setLoading(true);
    try {
      const payload: BrandSaveDTO = {
        id: brand.id,
        name: brand.name,
        description: brand.description,
      };
      await apiSaveBrand(payload);
      message.success(brand.id ? "Cập nhật hãng xe thành công" : "Thêm hãng xe thành công");
      setShowModal(false);
      setEditBrand(null);
      fetchBrands();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lưu hãng xe thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase
          title="Danh sách hãng xe"
          items={[
            { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
            { label: "Danh sách hãng xe", path: "/brand" },
          ]}
        />
        <ContainerBase>
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div
              className="dp_flex"
              style={{
                gap: 12,
                alignItems: "flex-end",
                flexWrap: "nowrap",
                overflowX: "auto",
              }}
            >
              <div style={{ minWidth: 200, flex: 1, flexShrink: 0 }}>
                <InputBase
                  modelValue={filter.search}
                  placeholder="Tìm theo tên hãng xe, mô tả"
                  prefixIcon="search"
                  style={{ width: "100%" }}
                  onChange={(val) =>
                    setFilter({ ...filter, search: val as string })
                  }
                />
              </div>
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section">
            {loading && <LoadingIndicator />}
            {error && (
              <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
            )}
            <div
              className="dp_flex"
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <p className="box_title_sm" style={{ marginBottom: 0 }}>
                Danh sách hãng xe
              </p>
              {canManageBrand() && (
                <ButtonBase
                  label="Thêm hãng xe"
                  className="btn_primary"
                  icon={<PlusOutlined />}
                  style={{ minWidth: 140, whiteSpace: "nowrap" }}
                  onClick={() => {
                    setEditBrand(null);
                    setShowModal(true);
                  }}
                />
              )}
            </div>
            <TableBase
              data={brands.map((b, idx) => ({
                ...b,
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
                  title: "Tên hãng xe",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Mô tả",
                  dataIndex: "description",
                  key: "description",
                },
                {
                  title: "Hành động",
                  key: "actions",
                  width: 100,
                  render: (_: any, record: any) => (
                    canManageBrand() && (
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
                    )
                  ),
                },
              ]}
              pageSize={pageSize}
              paginationType="BE"
              totalRecords={total}
              onPageChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
            />
          </div>
        </ContainerBase>
        <ModalSaveBrand
          open={showModal}
          brand={editBrand}
          onClose={() => {
            setShowModal(false);
            setEditBrand(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default BrandList;

