import React, { useState, useEffect } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import { HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalSaveInfoCustomer from "./ModalSaveInfoCustomer";
import {
  searchCustomers,
  saveCustomer as apiSaveCustomer,
  deleteCustomer as apiDeleteCustomer,
  getCustomerDetail,
} from "@/service/business/customerMng/customerMng.service";
import {
  CustomerDTO,
  CustomerSaveDTO,
} from "@/service/business/customerMng/customerMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import dayjs from "dayjs";

const CustomerList = () => {
  const [filter, setFilter] = useState("");
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<CustomerDTO | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        keyword: filter || undefined,
        page: page,
        size: pageSize,
      };
      const res = await searchCustomers(params);
      const apiData = res.data as any;

      setCustomers(apiData.data || []);
      setTotal(apiData.totalPages || 0);
    } catch (err: any) {
      setError("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, pageSize]);

  const handleEdit = async (customer: CustomerDTO) => {
    setLoading(true);
    try {
      const res = await getCustomerDetail(customer.id);
      setEditCustomer(res.data);
      setShowModal(true);
    } catch (err) {
      setError("Không thể lấy thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      return;
    }
    setLoading(true);
    try {
      await apiDeleteCustomer(customerId);
      fetchCustomers();
    } catch (err) {
      setError("Xóa khách hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (customer: any) => {
    setLoading(true);
    try {
      const payload: CustomerSaveDTO = {
        id: customer.id,
        fullName: customer.name || customer.fullName,
        phoneNumber: customer.phone || customer.phoneNumber,
        email: customer.email,
        dateOfBirth: customer.birthday || customer.dateOfBirth,
        gender: customer.gender,
        country: customer.country,
        address: customer.address,
        citizenId: customer.cccd || customer.citizenId,
        citizenIdImageUrl: customer.cccdImg || customer.citizenIdImageUrl,
        driverLicense: customer.license || customer.driverLicense,
        driverLicenseImageUrl: customer.licenseImg || customer.driverLicenseImageUrl,
        passport: customer.passport,
        passportImageUrl: customer.passportImg || customer.passportImageUrl,
        note: customer.note,
      };
      await apiSaveCustomer(payload);
      setShowModal(false);
      setEditCustomer(null);
      fetchCustomers();
    } catch (err) {
      setError("Lưu khách hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase
          title="Danh sách khách hàng"
          items={[
            { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
            { label: "Danh sách khách hàng", path: "/customer" },
          ]}
        />
        <ContainerBase>
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div className="dp_flex" style={{ gap: 16, alignItems: "center" }}>
              <InputBase
                modelValue={filter}
                placeholder="Tìm theo tên, SĐT, email..."
                prefixIcon="search"
                style={{ minWidth: 320, flex: 1 }}
                onChange={(val) => setFilter(val as string)}
              />
              <ButtonBase
                label="+ Thêm khách hàng"
                className="btn_yellow"
                icon={<PlusOutlined />}
                style={{ minWidth: 180, marginLeft: "auto" }}
                onClick={() => {
                  setEditCustomer(null);
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
              data={customers.map((c, idx) => ({
                ...c,
                name: c.fullName,
                phone: c.phoneNumber,
                birthday: c.dateOfBirth ? dayjs(c.dateOfBirth).format("DD/MM/YYYY") : "",
                total: c.totalSpent || 0,
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
                  title: "Ngày sinh",
                  dataIndex: "birthday",
                  key: "birthday",
                },
                {
                  title: "Quốc gia",
                  dataIndex: "country",
                  key: "country",
                },
                {
                  title: "Tổng tiền",
                  dataIndex: "total",
                  key: "total",
                  render: (val: number) =>
                    val ? val.toLocaleString("vi-VN") : "0",
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
        <ModalSaveInfoCustomer
          open={showModal}
          customer={editCustomer}
          onClose={() => {
            setShowModal(false);
            setEditCustomer(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default CustomerList;
