import React, { useState } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import { HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalSaveInfoCustomer from "./ModalSaveInfoCustomer";

const customerListInit = [
  {
    id: 1,
    name: "Đinh Mạnh Hòa",
    phone: "0912345678",
    email: "hoa@gmail.com",
    birthday: "18/09/2004",
    country: "Việt Nam",
    total: 1000000,
  },
  {
    id: 2,
    name: "Đinh Mạnh Hòa",
    phone: "0912345678",
    email: "hoa@gmail.com",
    birthday: "18/09/2004",
    country: "Việt Nam",
    total: 1000000,
  },
  {
    id: 3,
    name: "Đinh Mạnh Hòa",
    phone: "0912345678",
    email: "hoa@gmail.com",
    birthday: "18/09/2004",
    country: "Việt Nam",
    total: 1000000,
  },
];

const CustomerList = () => {
  const [filter, setFilter] = useState("");
  const [customers, setCustomers] = useState(customerListInit);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      !filter ||
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.phone.includes(filter) ||
      c.email.toLowerCase().includes(filter.toLowerCase())
  );

  const handleEdit = (customer: any) => {
    setEditCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = (customerId: number) => {
    setCustomers(customers.filter((c) => c.id !== customerId));
  };

  const handleSave = (customer: any) => {
    if (customer.id) {
      setCustomers(
        customers.map((c) => (c.id === customer.id ? { ...customer } : c))
      );
    } else {
      setCustomers([
        ...customers,
        { ...customer, id: customers.length + 1, total: 0 },
      ]);
    }
    setShowModal(false);
    setEditCustomer(null);
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
            <TableBase
              data={filteredCustomers}
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
                  render: (val: number) => val.toLocaleString(),
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
