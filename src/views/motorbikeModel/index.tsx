import React, { useState, useEffect } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import ButtonBase from "@/component/common/button/ButtonBase";
import InputBase from "@/component/common/input/InputBase";
import TableBase from "@/component/common/table/TableBase";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalSaveCarModel from "./ModalSaveCarModel";
import { useCarModelList } from "./useCarModelList";
import { CarModelDTO } from "@/service/business/carMng/carModelMng.type";

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

  // Filter state (bỏ brand)
  const [filter, setFilter] = useState({
    keyword: "",
    page: 1,
    size: 10,
  });
  const [filteredModels, setFilteredModels] = useState<CarModelDTO[]>([]);
  const [total, setTotal] = useState(0);

  // Filter logic (bỏ brand)
  useEffect(() => {
    let data = models;
    if (filter.keyword.trim()) {
      const kw = filter.keyword.trim().toLowerCase();
      data = data.filter((m) => m.name?.toLowerCase().includes(kw));
    }
    setTotal(data.length);
    const start = ((filter.page || 1) - 1) * (filter.size || 10);
    setFilteredModels(data.slice(start, start + (filter.size || 10)));
  }, [models, filter]);

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
                  setFilter({ ...filter, keyword: val as string, page: 1 })
                }
              />
              <div style={{ flex: 1 }} />
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
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section" style={{ position: "relative" }}>
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
                  title: "Mô tả",
                  dataIndex: "description",
                  key: "description",
                  render: (val: string) => val || "-",
                },
                {
                  title: "Hành động",
                  key: "actions",
                  width: 120,
                  render: (_: any, record: CarModelDTO) => (
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
                  ),
                },
              ]}
              pageSize={filter.size || 10}
              totalPages={Math.ceil(total / (filter.size || 10))}
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
