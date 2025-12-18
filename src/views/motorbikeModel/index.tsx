import React, { useState, useEffect } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import ButtonBase from "@/component/common/button/ButtonBase";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import TableBase from "@/component/common/table/TableBase";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalSaveCarModel from "./ModalSaveCarModel";
import { useCarModelList } from "./useCarModelList";
import { CarModelDTO } from "@/service/business/carMng/carModelMng.type";
import { getAllBrands } from "@/service/business/brandMng/brandMng.service";
import { BrandDTO } from "@/service/business/brandMng/brandMng.type";
import { canManageCarModel } from "@/utils/permission";

const CarModelList = () => {
  const {
    models,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchModels,
  } = useCarModelList();
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<CarModelDTO | null>(null);
  // Thêm state để xác định modal ở chế độ xem chi tiết hay chỉnh sửa/thêm
  const [viewOnly, setViewOnly] = useState(false);

  // Filter state
  const [filter, setFilter] = useState({
    keyword: "",
    brandId: "",
    page: 1,
    size: 10,
  });
  const [filteredModels, setFilteredModels] = useState<CarModelDTO[]>([]);
  const [total, setTotal] = useState(0);

  // Brand options state
  const [brandOptions, setBrandOptions] = useState([
    { value: "", label: "Tất cả hãng xe" },
  ]);

  // Search trigger state
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Load brands on mount
  useEffect(() => {
    getAllBrands().then((res) => {
      setBrandOptions([
        { value: "", label: "Tất cả hãng xe" },
        ...(res.data || []).map((b: BrandDTO) => ({
          value: b.id,
          label: b.name,
        })),
      ]);
    });
  }, []);

  // Filter logic - chỉ filter khi có searchTrigger
  useEffect(() => {
    let data = models;
    if (filter.keyword.trim()) {
      const kw = filter.keyword.trim().toLowerCase();
      data = data.filter((m) => m.name?.toLowerCase().includes(kw));
    }
    if (filter.brandId) {
      data = data.filter((m) => m.brandId === filter.brandId);
    }
    setTotal(data.length);
    const start = ((filter.page || 1) - 1) * (filter.size || 10);
    setFilteredModels(data.slice(start, start + (filter.size || 10)));
  }, [models, searchTrigger]); // Chỉ phụ thuộc vào models và searchTrigger

  // Function để trigger search
  const handleSearch = () => {
    setSearchTrigger(prev => prev + 1);
    setFilter(prev => ({ ...prev, page: 1 })); // Reset về trang đầu
  };

  // Function để reset filter
  const handleReset = () => {
    setFilter({
      keyword: "",
      brandId: "",
      page: 1,
      size: 10,
    });
    setSearchTrigger(prev => prev + 1);
  };

  // Reload when modal close
  const handleSaved = async (data: any) => {
    if (editingModel) {
      await handleUpdate(editingModel.id, data);
    } else {
      await handleCreate(data);
    }
    setShowModal(false);
    setEditingModel(null);
  };

  // Table pagination
  const handleTableChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({
      ...prev,
      page,
      size: pageSize,
    }));
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase
          title="Danh sách mẫu xe"
          items={[
            {
              label: "Dashboard",
              path: "/",
              icon: <i className="fa fa-home" />,
            },
            { label: "Quản lý mẫu xe", path: "/motorbike-model" },
          ]}
        />
        <ContainerBase>
          <div
            className="box_section"
            style={{ paddingBottom: 0, position: "relative" }}
          >
            <div
              className="dp_flex"
              style={{ gap: 16, alignItems: "center", flexWrap: "wrap" }}
            >
              <InputBase
                modelValue={filter.keyword}
                placeholder="Tìm theo tên mẫu xe"
                prefixIcon="search"
                style={{ minWidth: 320, flex: 1 }}
                onChange={(val) =>
                  setFilter({ ...filter, keyword: val as string })
                }
              />
              <SelectboxBase
                value={filter.brandId}
                options={brandOptions}
                placeholder="Chọn hãng xe"
                style={{ minWidth: 200 }}
                onChange={(val) =>
                  setFilter({ ...filter, brandId: val as string })
                }
              />
              <ButtonBase
                label="Tìm kiếm"
                className="btn_primary"
                onClick={handleSearch}
                style={{
                  minWidth: 100,
                  borderRadius: 6,
                  fontWeight: 500,
                  fontSize: 14,
                  height: 40,
                }}
              />
              <ButtonBase
                label="Reset"
                className="btn_lightgray"
                onClick={handleReset}
                style={{
                  minWidth: 80,
                  borderRadius: 6,
                  fontWeight: 500,
                  fontSize: 14,
                  height: 40,
                }}
              />
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section" style={{ position: "relative" }}>
            <div
              className="dp_flex"
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <p className="box_title_sm" style={{ marginBottom: 0 }}>
                Danh sách mẫu xe
              </p>
              {canManageCarModel() && (
                <ButtonBase
                  label="Thêm mẫu xe"
                  className="btn_primary"
                  icon={<PlusOutlined />}
                  style={{
                    minWidth: 140,
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 15,
                    height: 40,
                  }}
                  onClick={() => {
                    setEditingModel(null);
                    setViewOnly(false);
                    setShowModal(true);
                  }}
                />
              )}
            </div>
            {/* Thống kê */}
            <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: "#000", textAlign: "right" }}>
              Có {total} mẫu xe {(filter.keyword || filter.brandId) && searchTrigger > 0 ? "(đã lọc)" : ""}
            </div>
            <TableBase
              data={filteredModels}
              columns={[
                {
                  title: "STT",
                  dataIndex: "id",
                  key: "id",
                  width: 60,
                  render: (_: any, __: any, idx: number) =>
                    (filter.page - 1) * (filter.size || 10) + idx + 1,
                },
                {
                  title: "Tên mẫu xe",
                  dataIndex: "name",
                  key: "name",
                  render: (val: string, record: CarModelDTO) => (
                    <span
                      style={{
                        color: "#1677ff",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => {
                        setEditingModel(record);
                        setViewOnly(true);
                        setShowModal(true);
                      }}
                    >
                      {val || "-"}
                    </span>
                  ),
                },
                {
                  title: "Hãng xe",
                  dataIndex: "brandName",
                  key: "brandName",
                  render: (val: string) => val || "-",
                },
                {
                  title: "Giá ngày mặc định",
                  dataIndex: "baseDailyPrice",
                  key: "baseDailyPrice",
                  render: (val: number) => val ? `${val.toLocaleString()} VND` : "-",
                },
                {
                  title: "Giá giờ mặc định",
                  dataIndex: "baseHourlyPrice",
                  key: "baseHourlyPrice",
                  render: (val: number) => val ? `${val.toLocaleString()} VND` : "-",
                },
                {
                  title: "Hành động",
                  key: "actions",
                  width: 120,
                  render: (_: any, record: CarModelDTO) => (
                    canManageCarModel() && (
                      <div className="dp_flex" style={{ gap: 8 }}>
                        <ButtonBase
                          label=""
                          icon={<EditOutlined />}
                          className="btn_gray"
                          onClick={() => {
                            setEditingModel(record);
                            setViewOnly(false);
                            setShowModal(true);
                          }}
                          title="Sửa"
                        />
                        <ButtonBase
                          label=""
                          icon={<DeleteOutlined />}
                          className="btn_gray"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn xóa mẫu xe này?"
                              )
                            ) {
                              handleDelete(record.id);
                            }
                          }}
                          title="Xóa"
                        />
                      </div>
                    )
                  ),
                },
              ]}
              pageSize={filter.size || 10}
              totalRecords={total}
              onPageChange={handleTableChange}
              loading={loading}
            />
          </div>
        </ContainerBase>
        <ModalSaveCarModel
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingModel(null);
            setViewOnly(false);
          }}
          model={editingModel}
          onSave={handleSaved}
          viewOnly={viewOnly}
        />
      </div>
    </div>
  );
};

export default CarModelList;
