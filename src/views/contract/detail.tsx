import React from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import {
  HomeOutlined,
  CheckCircleTwoTone,
  ClockCircleTwoTone,
} from "@ant-design/icons";
import { Table } from "antd";
import ButtonBase from "@/component/common/button/ButtonBase";
import {
  EditOutlined,
  CarOutlined,
  RollbackOutlined,
  DollarOutlined,
  FileDoneOutlined,
  MoreOutlined,
} from "@ant-design/icons";

// Nếu có TableBase thì import TableBase từ "@/component/common/table/TableBase"
// import TableBase from "@/component/common/table/TableBase";

// Dữ liệu mẫu
const contract = {
  code: "HD000123",
  status: "Đã đặt",
  statusColor: "#FFF6D8",
  statusTextColor: "#E6A100",
  source: "Facebook",
  bookingDate: "10/10/2025 17:00",
  startDate: "13/10/2025 17:00",
  endDate: "15/10/2025 18:00",
  branchRent: "Chi nhánh 1",
  branchReturn: "Chi nhánh 2",
  deliveryAddress: "Tổ 1, Phương Thiện, Hà Giang",
  receiveAddress: "Tổ 5,  Phương Thiện, Hà Giang",
  note: "Khách hàng yêu cầu giao xe tại khách sạn",
  customer: {
    name: "Đinh Mạnh Hòa",
    phone: "0901234567",
    email: "-",
    country: "Việt Nam",
    id: "001204020439",
  },
  carList: [
    {
      type: "Xe số",
      name: "Honda Wave Alpha",
      plate: "33R4-00005",
      priceDay: 200000,
      priceHour: 20000,
      total: 420000,
    },
    {
      type: "Xe số",
      name: "Honda Wave Alpha",
      plate: "33R4-00006",
      priceDay: 200000,
      priceHour: 20000,
      total: 420000,
    },
    {
      type: "Xe số",
      name: "Yamaha PG-1",
      plate: "33R4-00007",
      priceDay: 200000,
      priceHour: 20000,
      total: 420000,
    },
  ],
  totalCar: 1260000,
  rentDuration: "2 ngày 1 giờ",
};

const pageTitle = "Chi tiết hợp đồng thuê xe";
const breadcrumbItems = [
  { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
  { label: "Quản lý hợp đồng", path: "/contract" },
  { label: "Chi tiết hợp đồng", path: "/contract/detail" },
];

// Dữ liệu mẫu bổ sung
const surchargeList = [
  {
    desc: "Phí trả xe tại khu vực khác",
    amount: 2000000,
    note: "Khách hàng yêu cầu giao xe tại khách sạn",
  },
];
const totalSurcharge = 2000000;

const paymentInfo = {
  car: 1260000,
  surcharge: 2200000,
  total: 3360000,
  paid: 3000000,
  remain: 360000,
  staff: {
    name: "Nguyễn Văn Demo",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
};

const paymentHistory = [
  {
    code: "TT000558",
    method: "Chuyển khoản NH",
    amount: 500000,
    date: "13/10/2025 14:50",
    staff: "Demo",
    note: "Đặt cọc",
  },
  {
    code: "TT000559",
    method: "Tiền mặt",
    amount: 1000000,
    date: "15/10/2025 16:10",
    staff: "Demo",
    note: "_",
  },
];

// Table columns
const carColumns = [
  {
    title: "STT",
    dataIndex: "stt",
    key: "stt",
    width: 60,
    align: "center" as const,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  {
    title: "Loại xe",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Xe",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Biển số xe",
    dataIndex: "plate",
    key: "plate",
  },
  {
    title: "Giá/ngày",
    dataIndex: "priceDay",
    key: "priceDay",
    align: "right" as const,
    render: (val: number) => val.toLocaleString(),
  },
  {
    title: "Giá/giờ",
    dataIndex: "priceHour",
    key: "priceHour",
    align: "right" as const,
    render: (val: number) => val.toLocaleString(),
  },
  {
    title: "Tiền thuê",
    dataIndex: "total",
    key: "total",
    align: "right" as const,
    render: (val: number) => <b>{val.toLocaleString()}</b>,
  },
];

const surchargeColumns = [
  {
    title: "STT",
    dataIndex: "stt",
    key: "stt",
    width: 60,
    align: "center" as const,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  {
    title: "Lý do thu",
    dataIndex: "desc",
    key: "desc",
  },
  {
    title: "Số tiền",
    dataIndex: "amount",
    key: "amount",
    align: "right" as const,
    render: (val: number) => val.toLocaleString() + "đ",
  },
  {
    title: "Ghi chú",
    dataIndex: "note",
    key: "note",
  },
];

const paymentHistoryColumns = [
  {
    title: "Mã TT",
    dataIndex: "code",
    key: "code",
  },
  {
    title: "Phương thức",
    dataIndex: "method",
    key: "method",
  },
  {
    title: "Số tiền",
    dataIndex: "amount",
    key: "amount",
    align: "right" as const,
    render: (val: number) => val.toLocaleString() + "đ",
  },
  {
    title: "Ngày thanh toán",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Nhân viên",
    dataIndex: "staff",
    key: "staff",
  },
  {
    title: "Ghi chú",
    dataIndex: "note",
    key: "note",
  },
];

const statusIcon =
  contract.status === "Đã đặt" ? (
    <CheckCircleTwoTone twoToneColor="#52c41a" style={{ marginRight: 6 }} />
  ) : (
    <ClockCircleTwoTone twoToneColor="#faad14" style={{ marginRight: 6 }} />
  );

const ContractDetailComponent = () => {
  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />

        {/* Dải button thao tác */}
        <div
          className="dp_flex"
          style={{
            justifyContent: "flex-end",
            gap: 12,
            marginBottom: 20,
            width: "100%",
          }}
        >
          <ButtonBase
            label="Chỉnh sửa"
            className="btn_primary"
            icon={<EditOutlined />}
            onClick={() => {}}
          />
          <ButtonBase
            label="Giao xe"
            className="btn_primary"
            icon={<CarOutlined />}
            onClick={() => {}}
          />
          <ButtonBase
            label="Trả xe"
            className="btn_primary"
            icon={<RollbackOutlined />}
            onClick={() => {}}
          />
          <ButtonBase
            label="Thanh toán"
            className="btn_primary"
            icon={<DollarOutlined />}
            onClick={() => {}}
          />
          <ButtonBase
            label="Đóng HĐ"
            className="btn_primary"
            icon={<FileDoneOutlined />}
            onClick={() => {}}
          />
          <ButtonBase
            label="Khác"
            className="btn_lightgray"
            icon={<MoreOutlined />}
            onClick={() => {}}
          />
        </div>

        <div
          className="dp_flex"
          style={{
            gap: 24,
            alignItems: "stretch",
            marginBottom: 24,
            width: "100%",
          }}
        >
          {/* Thông tin hợp đồng */}
          <ContainerBase
            style={{
              flex: 2,
              minWidth: 420,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="box_section"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p
                className="box_title_sm"
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <HomeOutlined style={{ color: "#1677ff", marginRight: 8 }} />
                Thông tin hợp đồng
              </p>
              <div className="dp_flex" style={{ gap: 32, flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <table
                    className="tbl_row tbl_border"
                    style={{
                      width: "100%",
                      background: "#fafbfc",
                      height: "100%",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ width: 120, color: "#888" }}>
                          Mã hợp đồng
                        </td>
                        <td style={{ fontWeight: 500 }}>{contract.code}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Nguồn</td>
                        <td>{contract.source}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Ngày thuê</td>
                        <td>{contract.startDate}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Chi nhánh thuê</td>
                        <td>{contract.branchRent}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Địa điểm giao xe</td>
                        <td>{contract.deliveryAddress}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Ghi chú</td>
                        <td>{contract.note}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ flex: 1 }}>
                  <table
                    className="tbl_row tbl_border"
                    style={{
                      width: "100%",
                      background: "#fafbfc",
                      height: "100%",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ width: 120, color: "#888" }}>
                          Trạng thái
                        </td>
                        <td>
                          <span
                            style={{
                              background: contract.statusColor,
                              color: contract.statusTextColor,
                              borderRadius: 8,
                              padding: "2px 12px",
                              fontWeight: 500,
                              fontSize: 14,
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {statusIcon}
                            {contract.status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Ngày đặt</td>
                        <td>{contract.bookingDate}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Ngày trả</td>
                        <td>{contract.endDate}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Chi nhánh trả</td>
                        <td>{contract.branchReturn}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}>Địa điểm trả xe</td>
                        <td>{contract.receiveAddress}</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#888" }}></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ContainerBase>

          {/* Thông tin khách hàng */}
          <ContainerBase>
            <div
              className="box_section"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minWidth: 380,
              }}
            >
              <p
                className="box_title_sm"
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  role="img"
                  aria-label="user"
                  style={{ color: "#1677ff", marginRight: 8 }}
                >
                  👤
                </span>
                Khách hàng
              </p>
              <table
                className="tbl_row tbl_border"
                style={{
                  width: "100%",
                  background: "#fafbfc",
                  height: "100%",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ width: 110, color: "#888" }}>Họ tên</td>
                    <td style={{ fontWeight: 500 }}>
                      {contract.customer.name}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "#888" }}>Số điện thoại</td>
                    <td>{contract.customer.phone}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#888" }}>Email</td>
                    <td>{contract.customer.email}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#888" }}>Quốc gia</td>
                    <td>{contract.customer.country}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#888" }}>Căn cước công dân</td>
                    <td>{contract.customer.id}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ContainerBase>
        </div>

        {/* Danh sách xe */}
        <ContainerBase>
          <div className="box_section">
            <div
              className="dp_flex"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                width: "100%",
              }}
            >
              <p
                className="box_title_sm"
                style={{
                  marginBottom: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  role="img"
                  aria-label="car"
                  style={{ color: "#1677ff", marginRight: 8 }}
                >
                  🏍️
                </span>
                Danh sách xe
              </p>
              <span
                style={{
                  color: "#1677ff",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Thời gian thuê: {contract.rentDuration}
              </span>
            </div>
            {/* Nếu có TableBase thì thay Table bằng TableBase */}
            <Table
              columns={carColumns}
              dataSource={contract.carList}
              pagination={false}
              rowKey={(r, idx) => idx.toString()}
              style={{ marginTop: 8 }}
              footer={() => (
                <div style={{ textAlign: "right", fontWeight: 500 }}>
                  Tổng tiền thuê xe:{" "}
                  <span style={{ fontWeight: "bold", color: "#1677ff" }}>
                    {contract.totalCar.toLocaleString()}đ
                  </span>
                </div>
              )}
              bordered
              className="contract-table"
            />
          </div>
        </ContainerBase>

        {/* Danh sách phụ thu */}
        <ContainerBase>
          <div className="box_section">
            <p
              className="box_title_sm"
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="money"
                style={{ color: "#faad14", marginRight: 8 }}
              >
                💸
              </span>
              Danh sách phụ thu
            </p>
            <Table
              columns={surchargeColumns}
              dataSource={surchargeList}
              pagination={false}
              rowKey={(_, idx) => idx.toString()}
              style={{ marginTop: 8 }}
              footer={() => (
                <div style={{ textAlign: "right", fontWeight: 500 }}>
                  Tổng tiền phụ thu:{" "}
                  <span style={{ fontWeight: "bold", color: "#faad14" }}>
                    {totalSurcharge.toLocaleString()}đ
                  </span>
                </div>
              )}
              bordered
              className="contract-table"
            />
          </div>
        </ContainerBase>

        {/* Thông tin thanh toán */}
        <ContainerBase>
          <div className="box_section">
            <p
              className="box_title_sm"
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="payment"
                style={{ color: "#52c41a", marginRight: 8 }}
              >
                💳
              </span>
              Thông tin thanh toán
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 32,
                marginBottom: 8,
                background: "#f6ffed",
                borderRadius: 8,
                padding: 16,
                border: "1px solid #b7eb8f",
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Tiền thuê xe:</span>
                  <span>{paymentInfo.car.toLocaleString()} đ</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Tiền phụ thu:</span>
                  <span>{paymentInfo.surcharge.toLocaleString()} đ</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>
                    <b>Tổng tiền:</b>
                  </span>
                  <span>
                    <b>{paymentInfo.total.toLocaleString()} đ</b>
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Đã thanh toán:</span>
                  <span>
                    {paymentInfo.paid.toLocaleString()} đ
                    <img
                      src={paymentInfo.staff.avatar}
                      alt="staff"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginLeft: 8,
                        verticalAlign: "middle",
                        border: "1px solid #eee",
                      }}
                    />
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "#1677ff", fontWeight: 500 }}>
                    Phải thu khách:
                  </span>
                  <span style={{ color: "#1677ff", fontWeight: 600 }}>
                    {paymentInfo.remain.toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ContainerBase>

        {/* Lịch sử thanh toán */}
        <ContainerBase>
          <div className="box_section">
            <p
              className="box_title_sm"
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="history"
                style={{ color: "#4096ff", marginRight: 8 }}
              >
                📜
              </span>
              Lịch sử thanh toán
            </p>
            <Table
              columns={paymentHistoryColumns}
              dataSource={paymentHistory}
              pagination={false}
              rowKey={(_, idx) => idx.toString()}
              style={{ marginTop: 8 }}
              bordered
              className="contract-table"
            />
          </div>
        </ContainerBase>
      </div>
    </div>
  );
};

export default ContractDetailComponent;
