import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Contract type definition
interface InvoiceItem {
  id: number;
  desc: string;
  amount: number;
}

interface Contract {
  id: number;
  code: string;
  source: string;
  customer: string;
  car: string;
  startDate: string;
  endDate: string;
  branchRent: string;
  branchReturn: string;
  total: number;
  paid: number;
  remain: number;
  status: string;
  extraFee: number;
  invoice: InvoiceItem[];
}

// Dummy data mới cho hợp đồng
const contractListInit = [
  {
    id: 1,
    code: "HD001",
    source: "Walk-in",
    customer: "Nguyễn Văn A",
    car: "Vision 110 (33R4-00005)",
    startDate: "01/10/2025",
    endDate: "03/10/2025",
    branchRent: "CN1",
    branchReturn: "CN1",
    total: 400000,
    paid: 400000,
    remain: 0,
    status: "done",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 2,
    code: "HD002",
    source: "Facebook",
    customer: "Lê Thị B",
    car: "Sirius (30Z3-22221); Wave RS (30H2-11110)",
    startDate: "02/10/2025",
    endDate: "04/10/2025",
    branchRent: "CN1",
    branchReturn: "CN2",
    total: 750000,
    paid: 500000,
    remain: 250000,
    status: "return",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 3,
    code: "HD003",
    source: "Hotline",
    customer: "Phạm Minh C",
    car: "Air Blade (29B1-88888)",
    startDate: "03/10/2025",
    endDate: "05/10/2025",
    branchRent: "CN3",
    branchReturn: "CN3",
    total: 500000,
    paid: 0,
    remain: 500000,
    status: "done",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 4,
    code: "HD004",
    source: "Hotline",
    customer: "Trần Quốc D",
    car: "SH Mode (59B2-23456)",
    startDate: "04/10/2025",
    endDate: "05/10/2025",
    branchRent: "CN2",
    branchReturn: "CN2",
    total: 400000,
    paid: 400000,
    remain: 0,
    status: "done",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 5,
    code: "HD005",
    source: "Walk-in",
    customer: "Vũ Anh E",
    car: "Wave Alpha (36A1-12345)",
    startDate: "04/10/2025",
    endDate: "05/10/2025",
    branchRent: "CN3",
    branchReturn: "CN3",
    total: 200000,
    paid: 0,
    remain: 200000,
    status: "renting",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 6,
    code: "HD006",
    source: "Facebook",
    customer: "Nguyễn Thu F",
    car: "Vision 110 (33R4-00006)",
    startDate: "05/10/2025",
    endDate: "07/10/2025",
    branchRent: "CN1",
    branchReturn: "CN1",
    total: 400000,
    paid: 200000,
    remain: 200000,
    status: "return",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 7,
    code: "HD007",
    source: "Hotline",
    customer: "Lâm Hải G",
    car: "Exciter 150 (59C2-77777)",
    startDate: "05/10/2025",
    endDate: "07/10/2025",
    branchRent: "CN2",
    branchReturn: "CN2",
    total: 700000,
    paid: 700000,
    remain: 0,
    status: "done",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 8,
    code: "HD008",
    source: "Zalo",
    customer: "Đặng Thị H",
    car: "Air Blade (29B1-88889)",
    startDate: "06/10/2025",
    endDate: "07/10/2025",
    branchRent: "CN1",
    branchReturn: "CN1",
    total: 250000,
    paid: 0,
    remain: 250000,
    status: "renting",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 9,
    code: "HD009",
    source: "Hotline",
    customer: "Nguyễn Đức I",
    car: "Lead 125 (30E1-09090); Vision (33R4-00009)",
    startDate: "06/10/2025",
    endDate: "07/10/2025",
    branchRent: "CN3",
    branchReturn: "CN3",
    total: 700000,
    paid: 700000,
    remain: 0,
    status: "done",
    extraFee: 0,
    invoice: [],
  },
  {
    id: 10,
    code: "HD010",
    source: "Walk-in",
    customer: "Phan Mỹ K",
    car: "Wave Alpha (36B1-45678)",
    startDate: "07/10/2025",
    endDate: "08/10/2025",
    branchRent: "CN3",
    branchReturn: "CN3",
    total: 200000,
    paid: 0,
    remain: 200000,
    status: "cancelled",
    extraFee: 0,
    invoice: [],
  },
];

const statusMap: Record<string, string> = {
  done: "Hoàn thành",
  return: "Đã trả xe",
  renting: "Đã nhận xe",
  cancelled: "Đã huỷ",
};

const ContractComponent = () => {
  const pageTitle = "Quản lý hợp đồng";
  const breadcrumbItems = [
    { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
    { label: "Quản lý hợp đồng", path: "/contract" },
  ];

  const navigate = useNavigate();

  // State filter
  const [filter, setFilter] = useState({ customer: "", car: "", status: "" });
  // State contract list
  const [contractList, setContractList] =
    useState<Contract[]>(contractListInit);

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
                onClick={() => navigate("/contract/create")}
                style={{ marginLeft: "auto" }}
              />
            </div>
            <TableBase
              data={filteredContracts}
              columns={[
                {
                  title: "Mã hợp đồng",
                  dataIndex: "code",
                  key: "code",
                  width: "7%",
                },
                {
                  title: "Nguồn",
                  dataIndex: "source",
                  key: "source",
                  width: "7%",
                },
                {
                  title: "Khách hàng",
                  dataIndex: "customer",
                  key: "customer",
                  width: "10%",
                },
                {
                  title: "Xe thuê",
                  dataIndex: "car",
                  key: "car",
                  width: "13%",
                },
                {
                  title: "Ngày thuê",
                  dataIndex: "startDate",
                  key: "startDate",
                  width: "8%",
                },
                {
                  title: "Ngày trả",
                  dataIndex: "endDate",
                  key: "endDate",
                  width: "8%",
                },
                {
                  title: "Chi nhánh thuê",
                  dataIndex: "branchRent",
                  key: "branchRent",
                  width: "7%",
                },
                {
                  title: "Chi nhánh trả",
                  dataIndex: "branchReturn",
                  key: "branchReturn",
                  width: "7%",
                },
                {
                  title: "Tổng tiền",
                  dataIndex: "total",
                  key: "total",
                  width: "8%",
                  render: (val: number) => val.toLocaleString(),
                },
                {
                  title: "Đã trả",
                  dataIndex: "paid",
                  key: "paid",
                  width: "8%",
                  render: (val: number) => val.toLocaleString(),
                },
                {
                  title: "Còn lại",
                  dataIndex: "remain",
                  key: "remain",
                  width: "8%",
                  render: (val: number) => val.toLocaleString(),
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: "8%",
                  render: (val: string) => (
                    <span className={`contract-status ${val}`}>
                      {statusMap[val] || val}
                    </span>
                  ),
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: "12%",
                  render: (_: any, record: any) => (
                    <div className="dp_flex btn_group">
                      <ButtonBase
                        label="Xem"
                        className="btn_gray mg_r10"
                        onClick={() => {
                          // Điều hướng sang trang chi tiết hợp đồng
                          navigate(`/contract/detail/${record.id}`);
                        }}
                      />
                      <ButtonBase
                        label="In"
                        className="btn_gray mg_r10"
                        onClick={() => {
                          /* handle print */
                        }}
                      />
                      {record.status !== "cancelled" && (
                        <>
                          <ButtonBase
                            label="Chỉnh sửa"
                            className="btn_gray mg_r10"
                            onClick={() => {
                              /* handle edit if needed */
                            }}
                          />
                          <ButtonBase
                            label="Hủy"
                            className="btn_gray mg_r10"
                            onClick={() => {
                              /* handle cancel */
                            }}
                          />
                          <ButtonBase
                            label="Thanh toán"
                            className="btn_gray"
                            onClick={() => {
                              /* handle payment */
                            }}
                          />
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
              pageSize={10}
            />
          </div>
        </ContainerBase>
      </div>
    </div>
  );
};

export default ContractComponent;
