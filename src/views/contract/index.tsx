import React, { useState } from "react";
import ModalSaveContract from "./modal/ModalSaveContract";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import { HomeOutlined, CarOutlined } from "@ant-design/icons";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";

// Dummy data
const customers = [
  { value: "1", label: "Nguyễn Văn A" },
  { value: "2", label: "Trần Thị B" },
  { value: "3", label: "Lê Văn C" },
];
const cars = [
  { value: "1", label: "Toyota Camry" },
  { value: "2", label: "Honda CRV" },
  { value: "3", label: "Kia Morning" },
];
const statusList = [
  { value: "new", label: "Mới tạo" },
  { value: "renting", label: "Đang thuê" },
  { value: "finished", label: "Đã kết thúc" },
  { value: "cancelled", label: "Đã hủy" },
];

const contractListInit = [
  {
    id: 1,
    customer: "Nguyễn Văn A",
    car: "Toyota Camry",
    startDate: "2025-10-20",
    endDate: "2025-10-22",
    pricePerDay: 500000,
    extraFee: 0,
    status: "new",
    total: 1000000,
    invoice: [{ id: 1, desc: "Tiền thuê xe", amount: 1000000 }],
  },
  {
    id: 2,
    customer: "Trần Thị B",
    car: "Honda CRV",
    startDate: "2025-11-01",
    endDate: "2025-11-05",
    pricePerDay: 700000,
    extraFee: 50000,
    status: "renting",
    total: 2950000,
    invoice: [
      { id: 1, desc: "Tiền thuê xe", amount: 2800000 },
      { id: 2, desc: "Phụ phí", amount: 150000 },
    ],
  },
  {
    id: 3,
    customer: "Lê Văn C",
    car: "Kia Morning",
    startDate: "2025-09-15",
    endDate: "2025-09-18",
    pricePerDay: 400000,
    extraFee: 0,
    status: "finished",
    total: 1200000,
    invoice: [{ id: 1, desc: "Tiền thuê xe", amount: 1200000 }],
  },
  {
    id: 4,
    customer: "Nguyễn Văn A",
    car: "Honda CRV",
    startDate: "2025-08-10",
    endDate: "2025-08-12",
    pricePerDay: 700000,
    extraFee: 100000,
    status: "cancelled",
    total: 1500000,
    invoice: [
      { id: 1, desc: "Tiền thuê xe", amount: 1400000 },
      { id: 2, desc: "Phụ phí", amount: 100000 },
    ],
  },
  {
    id: 5,
    customer: "Trần Thị B",
    car: "Toyota Camry",
    startDate: "2025-12-01",
    endDate: "2025-12-03",
    pricePerDay: 500000,
    extraFee: 0,
    status: "new",
    total: 1000000,
    invoice: [{ id: 1, desc: "Tiền thuê xe", amount: 1000000 }],
  },
];

const ContractComponent = () => {
  const pageTitle = "Quản lý hợp đồng";
  const breadcrumbItems = [
    { label: "Home", path: "/", icon: <HomeOutlined /> },
    { label: "Quản lý hợp đồng", path: "/contract" },
  ];

  // State filter
  const [filter, setFilter] = useState({ customer: "", car: "", status: "" });
  // State contract list
  const [contractList, setContractList] = useState(contractListInit);
  // State create contract
  const [form, setForm] = useState({
    customer: "",
    car: "",
    startDate: "",
    endDate: "",
    pricePerDay: 0,
    extraFee: 0,
  });
  // Modal state
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editContract, setEditContract] = useState<any>(null);

  // Filter contracts
  const filteredContracts = contractList.filter((c) => {
    return (
      (!filter.customer ||
        c.customer ===
          customers.find((cu) => cu.value === filter.customer)?.label) &&
      (!filter.car ||
        c.car === cars.find((ca) => ca.value === filter.car)?.label) &&
      (!filter.status || c.status === filter.status)
    );
  });

  // Tính tổng tiền thuê
  const calcTotal = () => {
    if (!form.startDate || !form.endDate || !form.pricePerDay) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return days * form.pricePerDay + (form.extraFee || 0);
  };

  // Mở modal thêm hợp đồng
  const handleOpenAddContract = () => {
    setEditContract(null);
    setIsOpenModal(true);
  };

  // Mở modal chỉnh sửa hợp đồng
  const handleOpenEditContract = (contract: any) => {
    setEditContract(contract);
    setIsOpenModal(true);
  };

  // Lưu hợp đồng (thêm hoặc sửa)
  const handleSaveContract = (data: any) => {
    if (editContract) {
      // Sửa
      setContractList((prev) =>
        prev.map((c) => (c.id === editContract.id ? { ...c, ...data } : c))
      );
    } else {
      // Thêm
      const total = (() => {
        if (!data.startDate || !data.endDate || !data.pricePerDay) return 0;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const days = Math.max(
          1,
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        );
        return days * data.pricePerDay + (data.extraFee || 0);
      })();
      const newContract = {
        ...data,
        id: contractList.length + 1,
        customer:
          customers.find((cu) => cu.value === data.customer)?.label || "",
        car: cars.find((ca) => ca.value === data.car)?.label || "",
        status: "new",
        total,
        invoice: [
          { id: 1, desc: "Tiền thuê xe", amount: total - (data.extraFee || 0) },
          ...(data.extraFee
            ? [{ id: 2, desc: "Phụ phí", amount: data.extraFee }]
            : []),
        ],
      };
      setContractList([...contractList, newContract]);
    }
    setIsOpenModal(false);
  };

  // Thêm phụ phí cho hợp đồng
  const handleAddExtraFee = (id: number) => {
    const fee = prompt("Nhập số tiền phụ phí");
    const feeNum = Number(fee);
    if (!feeNum || feeNum <= 0) return;
    setContractList((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              extraFee: (c.extraFee || 0) + feeNum,
              total: (c.total || 0) + feeNum,
              invoice: [
                ...c.invoice,
                { id: c.invoice.length + 1, desc: "Phụ phí", amount: feeNum },
              ],
            }
          : c
      )
    );
  };

  // Đổi trạng thái hợp đồng
  const handleChangeStatus = (id: number, newStatus: string) => {
    setContractList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />
        {/* Bộ lọc hợp đồng - layout chuẩn Template Form Control Search */}
        <ContainerBase>
          <div className="box_section">
            <p className="box_title_sm">Bộ lọc hợp đồng</p>
            <div className="box_section">
              <div className="search_box col_3">
                <ul>
                  <li>
                    <p className="ta_c">Khách hàng</p>
                    <SelectboxBase
                      value={filter.customer}
                      options={[
                        { value: "", label: "Khách hàng" },
                        ...customers,
                      ]}
                      onChange={(val: string | string[]) =>
                        setFilter({
                          ...filter,
                          customer:
                            typeof val === "string" ? val : val[0] || "",
                        })
                      }
                    />
                  </li>
                  <li>
                    <p className="ta_c">Xe</p>
                    <SelectboxBase
                      value={filter.car}
                      options={[{ value: "", label: "Xe" }, ...cars]}
                      onChange={(val: string | string[]) =>
                        setFilter({
                          ...filter,
                          car: typeof val === "string" ? val : val[0] || "",
                        })
                      }
                    />
                  </li>
                  <li>
                    <p className="ta_c">Trạng thái</p>
                    <SelectboxBase
                      value={filter.status}
                      options={[
                        { value: "", label: "Trạng thái" },
                        ...statusList,
                      ]}
                      onChange={(val: string | string[]) =>
                        setFilter({
                          ...filter,
                          status: typeof val === "string" ? val : val[0] || "",
                        })
                      }
                    />
                  </li>
                </ul>
                <div className="dp_flex btn_group btn_end">
                  <ButtonBase
                    label="Tìm kiếm"
                    className="btn_primary icon_search"
                    onClick={() => {}}
                  />
                  <ButtonBase
                    label="Làm mới"
                    className="btn_lightgray icon_reset"
                    onClick={() =>
                      setFilter({ customer: "", car: "", status: "" })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </ContainerBase>

        {/* Danh sách hợp đồng - chuẩn Template */}
        <ContainerBase>
          <div className="box_section">
            <div
              className="dp_flex dp_space_between mg_b15"
              style={{ alignItems: "center" }}
            >
              <p className="box_title_sm" style={{ marginBottom: 0 }}>
                Danh sách hợp đồng
              </p>
              <ButtonBase
                label="Thêm hợp đồng"
                className="btn_primary"
                onClick={handleOpenAddContract}
                style={{ marginLeft: "auto" }}
              />
            </div>
            <TableBase
              data={filteredContracts}
              columns={[
                { title: "ID", dataIndex: "id", key: "id", width: "6%" },
                {
                  title: "Khách hàng",
                  dataIndex: "customer",
                  key: "customer",
                  width: "12%",
                },
                { title: "Xe", dataIndex: "car", key: "car", width: "12%" },
                {
                  title: "Ngày thuê",
                  dataIndex: "startDate",
                  key: "startDate",
                  width: "10%",
                },
                {
                  title: "Ngày trả",
                  dataIndex: "endDate",
                  key: "endDate",
                  width: "10%",
                },
                {
                  title: "Giá/ngày",
                  dataIndex: "pricePerDay",
                  key: "pricePerDay",
                  width: "10%",
                  render: (val: number) => `${val.toLocaleString()}₫`,
                },
                {
                  title: "Phụ phí",
                  dataIndex: "extraFee",
                  key: "extraFee",
                  width: "8%",
                  render: (val: number) => `${val?.toLocaleString()}₫`,
                },
                {
                  title: "Tổng tiền",
                  dataIndex: "total",
                  key: "total",
                  width: "10%",
                  render: (val: number) => `${val?.toLocaleString()}₫`,
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: "10%",
                  render: (val: string, record: any) => (
                    <SelectboxBase
                      value={val}
                      options={statusList}
                      onChange={(newVal: string | string[]) =>
                        handleChangeStatus(
                          record.id,
                          typeof newVal === "string" ? newVal : newVal[0] || ""
                        )
                      }
                      disabled={record.status !== "new"}
                    />
                  ),
                },
                {
                  title: "Invoice",
                  dataIndex: "invoice",
                  key: "invoice",
                  width: "12%",
                  render: (val: any[]) => (
                    <ul className="font_13">
                      {val.map((inv) => (
                        <li key={inv.id}>
                          {inv.desc}: {inv.amount.toLocaleString()}₫
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: "10%",
                  render: (_: any, record: any) => (
                    <div className="dp_flex btn_group">
                      <ButtonBase
                        label="Chỉnh sửa"
                        className="btn_gray mg_r10"
                        onClick={() => handleOpenEditContract(record)}
                      />
                      <ButtonBase
                        label="Thêm phụ phí"
                        className="btn_gray"
                        disabled={record.status !== "new"}
                        onClick={() => handleAddExtraFee(record.id)}
                      />
                    </div>
                  ),
                },
              ]}
              pageSize={5}
            />
          </div>
        </ContainerBase>

        {/* Modal add/edit hợp đồng */}
        <ModalSaveContract
          open={isOpenModal}
          onClose={() => setIsOpenModal(false)}
          onSave={handleSaveContract}
          contract={editContract}
          customers={customers}
          cars={cars}
        />
      </div>
    </div>
  );
};

export default ContractComponent;
