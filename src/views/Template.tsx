import { useAppSelector } from "@/app/hook";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import ButtonBase from "@/component/common/button/ButtonBase";
import InputBase from "@/component/common/input/InputBase";
import RadioButtonBase from "@/component/common/input/RadiobuttonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import TFooter from "@/layouts/components/TFooter";
import { handleChange } from "@/utils/formUtils";
import {
  CheckCircleOutlined,
  HomeOutlined,
  LoadingOutlined,
  SmileOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import ModalAddUserTemplate from "./template/ModalAddUserTemplate";
import { useAlert } from "@/plugins/global";
import { TableProps } from "antd";
import TableBase from "@/component/common/table/TableBase";
import THeaderHorizontal from "@/layouts/components/horizontalMenu/THeaderHorizontal";
import TimelineBase from "@/component/common/timeline/TimelineBase";
import StepBase from "@/component/common/timeline/StepBase";
import ColorBase from "@/component/common/colorpicker/ColorBase";
import FormJoditEditorBase from "@/component/common/formeditor/FormJoditEditorBase";
import ViewJoditEditorBase from "@/component/common/formeditor/ViewJoditEditorBase";
import AvatarBase from "@/component/common/image/AvatarBase";
import ImageBase from "@/component/common/image/ImageBase";
import CollapseBase from "@/component/common/collapse/CollapseBase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee, faHome } from "@fortawesome/free-solid-svg-icons";
import BarChartBase from "@/component/common/chart/BarChartBase";
import ColumnChartBase from "@/component/common/chart/ColumnChartBase";
import LineChartBase from "@/component/common/chart/LineChartBase";
import { ChartOptions } from "chart.js";
import PieChartBase from "@/component/common/chart/PieChartBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import RateBase from "@/component/common/rate/RateBase";
import { Button } from "jodit/esm/modules";
import TabBase from "@/component/common/tab/TabBase";

type UserModel = {
  code: string;
  name: string;
  phoneNumber: string;
  bank: string;
  datePicker: string;
  gender: string;
  address: string;
};

interface UserType {
  id: number;
  name: string;
  age: number;
  address: string;
}

const Template = () => {
  const pageTitle = "Template UI";
  const breadcrumbItems = [
    { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
    { label: "User Profile", path: "/user", icon: <UserOutlined /> },
    { label: "Template", path: "/template" },
  ] as any;

  const links = [
    { id: 1, href: "#section1", text: "1. Form Control Search" },
    { id: 2, href: "#section2", text: "2. Form Control Add / Update" },
    { id: 3, href: "#section3", text: "3. Button Base" },
    { id: 4, href: "#section4", text: "4. Alert - SweetAlert" },
    { id: 5, href: "#section5", text: "5. Font Size" },
    { id: 6, href: "#section6", text: "6. Table Antd - Table Row" },
    { id: 7, href: "#section7", text: "7. Timeline" },
    { id: 8, href: "#section8", text: "8. Color Picker" },
    { id: 9, href: "#section9", text: "9. Form Jodit Editor" },
    { id: 10, href: "#section10", text: "10. Image - Avatar" },
    { id: 11, href: "#section11", text: "11. Collapse" },
    { id: 12, href: "#section12", text: "12. Chart" },
    { id: 13, href: "#section13", text: "13. Excel" },
    { id: 14, href: "#section14", text: "14. Rate" },
    { id: 15, href: "#section15", text: "15. Tab" },
    { id: 16, href: "#section16", text: "16. Date Picker" },
  ];

  // Form Control
  const [codeFund, setCodeFund] = useState("");
  const [nameFund, setNameFund] = useState("");
  const [nameUser, setNameUser] = useState("");

  const handleSearch = () => {
    let filter = {
      codeFund: codeFund,
      nameFund: nameFund,
      nameUser: nameUser,
    };
    console.log(filter);
  };

  const clearSearch = () => {
    setCodeFund("");
    setNameFund("");
    setNameUser("");
  };

  const [user, setUser] = useState<UserModel>({
    code: "",
    name: "",
    phoneNumber: "",
    bank: "",
    datePicker: "",
    gender: "0",
    address: "",
  });

  const [listGender, setListGender] = useState([
    { value: "0", label: "Nam" },
    { value: "1", label: "Nữ" },
  ]);
  const [listBank, setListBank] = useState([
    { value: "", label: "Lựa chọn" },
    { value: "43453445", label: "Vietcombank" },
    { value: "564576567", label: "Techcombank" },
  ]);

  const handleDateChange = (dateString: string | null) => {
    setUser((prevUser) => ({
      ...prevUser,
      datePicker: dateString || "",
    }));
  };

  const isFormValid = useAppSelector((state) => state.common.check);

  const submitForm = () => {
    if (isFormValid) {
      alert("Bạn chưa nhập đủ thông tin");
      return;
    }
    console.log(user);
  };

  const clearForm = () => {
    setUser({
      code: "",
      name: "",
      phoneNumber: "",
      datePicker: "",
      bank: "",
      gender: "0",
      address: "",
    });
  };

  const [isOpenModalAddUser, setIsOpenModalAddUser] = useState(false);

  const openModalAddUser = () => {
    setIsOpenModalAddUser(true);
  };

  const handleCancelModalAddUser = () => {
    setIsOpenModalAddUser(false);
  };

  const { alert, confirm, toast } = useAlert();

  const handleAlert = () => {
    alert("Đây là một thông báo đơn giản.");
  };

  const handleConfirm = () => {
    confirm("Bạn có chắc chắn muốn tiếp tục?", "", (confirmed: any) => {
      if (confirmed) {
        alert("Bạn đã xác nhận!");
      } else {
        alert("Bạn đã hủy thao tác.");
      }
    });
  };

  const handleToast = () => {
    toast("Đây là thông báo nhanh !", "success");
  };

  const data: UserType[] = [
    { id: 1, name: "John Doe", age: 32, address: "New York No. 1 Lake Park" },
    { id: 2, name: "Jane Smith", age: 28, address: "London No. 1 Lake Park" },
    { id: 3, name: "Sam Green", age: 45, address: "Sidney No. 1 Lake Park" },
    { id: 4, name: "Michael Brown", age: 23, address: "San Francisco" },
    { id: 5, name: "Emma Wilson", age: 37, address: "Los Angeles" },
    { id: 6, name: "Chris Johnson", age: 29, address: "Houston" },
    { id: 7, name: "Olivia Davis", age: 26, address: "Miami" },
    { id: 8, name: "Sophia Moore", age: 31, address: "Chicago" },
    { id: 9, name: "James Lee", age: 34, address: "Dallas" },
    { id: 10, name: "Ella White", age: 27, address: "Seattle" },
    { id: 11, name: "Mason Brown", age: 41, address: "Austin" },
  ];

  const columns: TableProps<UserType>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: UserType, b: UserType) => a.name.localeCompare(b.name),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      sorter: (a: UserType, b: UserType) => a.age - b.age,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  const handleRowSelect = (
    selectedRowKeys: React.Key[],
    selectedRows: UserType[]
  ) => {
    console.log("Selected Row Keys:", selectedRowKeys);
    console.log("Selected Rows:", selectedRows);
  };

  const [listTableRow, setListTableRow] = useState([
    {
      id: 1,
      studentNo: "PH26123",
      studentName: "Nguyễn Công Thắng",
      listSubject: [
        { id: 1, code: "734646", name: "Môn Toán", score: 1, scoreInput: 0 },
        { id: 2, code: "746345", name: "Môn A", score: 2, scoreInput: 0 },
        { id: 3, code: "856445", name: "Môn B", score: 3, scoreInput: 0 },
        { id: 4, code: "445645", name: "Môn C", score: 4, scoreInput: 0 },
      ],
      average: 8.5,
    },
    {
      id: 2,
      studentNo: "PH26192",
      studentName: "Mai Đình Huy",
      listSubject: [
        { id: 5, code: "734646", name: "Môn Toán", score: 5, scoreInput: 0 },
        { id: 6, code: "746345", name: "Môn A", score: 6, scoreInput: 0 },
        { id: 7, code: "856445", name: "Môn B", score: 7, scoreInput: 0 },
        { id: 8, code: "445675", name: "Môn C", score: 8, scoreInput: 0 },
        { id: 9, code: "847676", name: "Môn Sử", score: 9, scoreInput: 0 },
        { id: 10, code: "657678", name: "Môn Địa", score: 10, scoreInput: 0 },
      ],
      average: 9.5,
    },
  ]);

  const handleChangeScoreInput =
    (studentId: number, subjectId: number) => (value: number) => {
      setListTableRow((prevRows) =>
        prevRows.map((std) =>
          std.id === studentId
            ? {
                ...std,
                listSubject: std.listSubject.map((sbjt) =>
                  sbjt.id === subjectId ? { ...sbjt, scoreInput: value } : sbjt
                ),
              }
            : std
        )
      );
    };

  const timelineItemsVertical = [
    {
      title: "Step 1",
      description: "This is the description for step 1.",
      icon: <UserOutlined />,
    },
    {
      title: "Step 2",
      description: "This is the description for step 2.",
      icon: <CheckCircleOutlined />,
    },
    { title: "Step 3", description: "This is the description for step 3." },
    { title: "Step 4", description: "This is the description for step 4." },
  ];

  const timelineItemsHorizontal = [
    {
      title: "Step 1",
      description: "User registration",
      icon: <UserOutlined />,
    },
    {
      title: "Step 2",
      description: "Verification",
      icon: <CheckCircleOutlined />,
    },
    { title: "Step 3", description: "Processing", icon: <LoadingOutlined /> },
    { title: "Step 4", description: "Approval", icon: <SmileOutlined /> },
    { title: "Step 5", description: "Completion", icon: <StarOutlined /> },
  ];

  const steps = [
    {
      title: "Step 1",
      description: "User registration",
      icon: <UserOutlined />,
    },
    {
      title: "Step 2",
      description: "Verification",
      icon: <CheckCircleOutlined />,
    },
    { title: "Step 3", description: "Processing", icon: <LoadingOutlined /> },
    { title: "Step 4", description: "Approval", icon: <SmileOutlined /> },
    { title: "Step 5", description: "Completion", icon: <StarOutlined /> },
  ];

  const [color, setColor] = useState<string>("#1890ff");

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  const [editorContent, setEditorContent] = useState<string>("");

  const handleEditorChange = (newValue: string) => {
    setEditorContent(newValue);
  };

  const [content] = useState<string>(
    "<p>This is read-only content in Jodit Editor.</p>"
  );

  const avatarSrc =
    "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.30808-1/463965610_549211944357166_4282236269668681560_n.jpg?stp=dst-jpg_s200x200&_nc_cat=108&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=3ApByQSimFgQ7kNvgF71RZb&_nc_zt=24&_nc_ht=scontent.fhan2-3.fna&_nc_gid=AdU2JeC72UsLW00jdEm7IeN&oh=00_AYBhCDheyC_IObRE2Gpw1cZSbTE-THBtl8M7WJPQGuMh8Q&oe=672C3A0F";
  const imageUrl =
    "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.30808-1/463965610_549211944357166_4282236269668681560_n.jpg?stp=dst-jpg_s200x200&_nc_cat=108&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=3ApByQSimFgQ7kNvgF71RZb&_nc_zt=24&_nc_ht=scontent.fhan2-3.fna&_nc_gid=AdU2JeC72UsLW00jdEm7IeN&oh=00_AYBhCDheyC_IObRE2Gpw1cZSbTE-THBtl8M7WJPQGuMh8Q&oe=672C3A0F";

  const panelData = [
    {
      header: "Panel 1",
      key: "1",
      content: <div>This is the content for Panel 1</div>,
      icon: <FontAwesomeIcon icon={faCoffee} size="1x" />,
    },
    {
      header: "Panel 2",
      key: "2",
      content: <div>This is the content for Panel 2</div>,
      icon: <FontAwesomeIcon icon={faHome} size="1x" />,
    },
    {
      header: "Panel 3",
      key: "3",
      content: <div>This is the content for Panel 3</div>,
    },
  ];

  const dataBarChart = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Sales (in USD)",
        data: [300, 500, 400, 600, 700, 800, 900],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Expenses (in USD)",
        data: [200, 300, 250, 400, 450, 500, 600],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const optionsBarChart = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Sales and Expenses",
      },
    },
  };

  const chartDataColumn = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Sales",
        data: [65, 59, 80, 81, 56],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Expenses",
        data: [28, 48, 40, 19, 86],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const chartOptionsColumn = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const dataLineChart = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Sales",
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "Revenue",
        data: [28, 48, 40, 19, 86, 27, 90],
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
    ],
  };

  const optionsLineChart = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartDataPie = {
    labels: ["Red", "Blue", "Yellow"],
    datasets: [
      {
        label: "My Dataset",
        data: [300, 50, 100],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
      },
    ],
  };

  const chartOptionsPie: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Pie Chart Example",
      },
    },
  };

  const [rating, setRating] = useState(3);

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const items = [
    { label: "Tab 1", key: "1", content: <div>Content of Tab 1</div> },
    { label: "Tab 2", key: "2", content: <div>Content of Tab 2</div> },
    { label: "Tab 3", key: "3", content: <div>Content of Tab 3</div> },
  ];

  return (
    <div className="page_wrap">
      <header>
        <THeaderHorizontal />
      </header>
      <main>
        <div className="content_wrap">
          <div id="content" className="grid_content">
            <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />
            <ContainerBase>
              <div className="box_section">
                <p className="box_title_sm">Mục lục Template Base</p>{" "}
              </div>
              <nav>
                {links.map((link) => (
                  <React.Fragment key={link.id}>
                    <a className="font_16 font_nightblue" href={link.href}>
                      {link.text}
                    </a>
                    <br />
                  </React.Fragment>
                ))}
              </nav>
            </ContainerBase>
            <ContainerBase id="section1">
              <div className="box_section">
                <p className="box_title_sm">1. Form Control Search</p>{" "}
              </div>
              <div className="box_section">
                <div className="search_box col_3">
                  <ul>
                    <li>
                      <p className="ta_c">Mã quỹ</p>
                      <InputBase
                        modelValue={codeFund}
                        placeholder="Hãy nhập mã quỹ"
                        onChange={(value) => setCodeFund(value as string)}
                      />
                    </li>
                    <li>
                      <p className="ta_c">Tên quỹ</p>
                      <InputBase
                        modelValue={nameFund}
                        type="text"
                        onChange={(value) => setNameFund(value as string)}
                      />
                    </li>
                    <li>
                      <p className="ta_c">Tên người dùng</p>
                      <InputBase
                        modelValue={nameUser}
                        type="text"
                        onChange={(value) => setNameUser(value as string)}
                      />
                    </li>
                  </ul>
                  <ul>
                    <li>
                      <p className="ta_c">Search 1</p>
                      <InputBase type="text" />
                    </li>
                  </ul>
                  <div className="dp_flex btn_group btn_end">
                    <ButtonBase
                      label="Tìm kiếm"
                      className="btn_primary icon_search"
                      onClick={handleSearch}
                    />
                    <ButtonBase
                      label="Làm mới"
                      className="btn_lightgray icon_reset"
                      onClick={clearSearch}
                    />
                  </div>
                </div>
              </div>
            </ContainerBase>
            <ContainerBase id="section2">
              <div className="box_section">
                <p className="box_title_sm">2. Form Control Add / Update</p>{" "}
              </div>
              <div className="box_section mg_b15">
                <p className="box_title_xs">Form Add / Update toàn màn hình</p>{" "}
              </div>
              <div className="box_section">
                <table className="tbl_row tbl_border">
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "auto" }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th scope="row">
                        <p className="required">Mã người dùng</p>
                      </th>
                      <td colSpan={3}>
                        <InputBase
                          id="userCode"
                          required={true}
                          modelValue={user.code}
                          placeholder="Hãy nhập mã người dùng"
                          onChange={handleChange(setUser, "code")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <p className="required">Tên người dùng</p>
                      </th>
                      <td colSpan={3}>
                        <InputBase
                          id="userName"
                          required={true}
                          modelValue={user.name}
                          placeholder="Hãy nhập tên người dùng"
                          onChange={handleChange(setUser, "name")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <p className="required">Số điện thoại</p>
                      </th>
                      <td colSpan={3}>
                        <InputBase
                          id="phoneNumber"
                          required={true}
                          modelValue={user.phoneNumber}
                          placeholder="Hãy nhập số điện thoại"
                          onChange={handleChange(setUser, "phoneNumber")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <p className="required">Ngân hàng</p>
                      </th>
                      <td colSpan={3}>
                        <SelectboxBase
                          id="bankSelect"
                          options={listBank}
                          required={true}
                          multiSelect={false}
                          defaultValue={user.bank}
                          onChange={handleChange(setUser, "bank")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <p className="required">Giới tính</p>
                      </th>
                      <td colSpan={3}>
                        <RadioButtonBase
                          id="gender"
                          options={listGender}
                          required={true}
                          onChange={handleChange(setUser, "gender")}
                          defaultValue={user.gender}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <p className="required">Ngày tốt nghiệp</p>
                      </th>
                      <td colSpan={3}>
                        <DatePickerBase
                          id="datePickerUser"
                          required={true}
                          value={user.datePicker}
                          onChange={handleChange(setUser, "datePicker")}
                          placeholder="Ngày tốt nghiệp"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <p className="required">Địa chỉ</p>
                      </th>
                      <td colSpan={3}>
                        <TextAreaBase
                          id="address"
                          placeholder="Hãy nhập địa chỉ"
                          required={true}
                          onChange={handleChange(setUser, "address")}
                          defaultValue={user.address}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="dp_flex btn_group btn_end mg_t25">
                  <ButtonBase
                    label="Thêm mới"
                    className="btn_primary"
                    onClick={submitForm}
                  />
                  <ButtonBase
                    label="Mục lục"
                    className="btn_lightgray"
                    onClick={clearForm}
                  />
                </div>
              </div>
              <div className="box_section mg_b15">
                <p className="box_title_xs">Form Add / Update trong Modal</p>{" "}
              </div>
              <div className="box_section">
                <ButtonBase
                  label="Thêm mới"
                  className="btn_primary"
                  onClick={openModalAddUser}
                />
                <ModalAddUserTemplate
                  isOpen={isOpenModalAddUser}
                  handleCancel={handleCancelModalAddUser}
                />
              </div>
            </ContainerBase>
            <ContainerBase id="section3">
              <div className="box_section">
                <p className="box_title_sm">3. Button Base</p>{" "}
              </div>
              <div className="box_section">
                <ButtonBase label="Thêm mới" className="btn_primary" /> : Button
                primary key
              </div>
              <div className="box_section mg_t10">
                <ButtonBase
                  label="Tìm kiếm"
                  className="btn_primary icon_search"
                />{" "}
                : Button primary key icon
              </div>
              <div className="box_section mg_t10">
                <ButtonBase label="Lưu tạm thời" className="btn_secondary" /> :
                Button secondary
              </div>
              <div className="box_section mg_t10">
                <ButtonBase
                  label="Làm mới"
                  className="btn_lightgray icon_reset"
                />{" "}
                : Button lightgray
              </div>
              <div className="box_section mg_t10">
                <ButtonBase label="Xóa" className="btn_gray" /> : Button gray
              </div>
            </ContainerBase>
            <ContainerBase id="section4">
              <div className="box_section">
                <p className="box_title_sm">4. Alert - SweetAlert</p>{" "}
              </div>
              <div className="box_section">
                <ButtonBase
                  label="Alert"
                  className="btn_primary"
                  onClick={handleAlert}
                />
                <ButtonBase
                  label="Alert Confirm"
                  className="btn_primary"
                  onClick={handleConfirm}
                />
                <ButtonBase
                  label="Toast"
                  className="btn_primary"
                  onClick={handleToast}
                />
              </div>
            </ContainerBase>
            <ContainerBase id="section5">
              <div className="box_section">
                <p className="box_title_sm">5. Font size</p>{" "}
              </div>
              <div className="box_section">
                <p className="font_12">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
                <p className="font_13">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
                <p className="font_14">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
                <p className="font_15">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
                <p className="font_16">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
                <p className="font_17">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
                <p className="font_18">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
                <p className="font_19">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
                <p className="font_20">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, ..."
                </p>
                <hr />
              </div>
            </ContainerBase>
            <ContainerBase id="section6">
              <div className="box_section">
                <p className="box_title_sm">6. Table Antd - Table Row</p>{" "}
              </div>
              <div className="box_section mg_b15">
                <p className="box_title_xs">
                  Table Antd Pagination Backend (Server){" "}
                </p>{" "}
              </div>
              <div className="box_section">
                <TableBase
                  data={data}
                  columns={columns}
                  pageSize={5}
                  onRowSelect={handleRowSelect}
                />
              </div>
              <div className="box_section mg_t25 mg_b15">
                <p className="box_title_xs">
                  Table Antd Pagination Frontend (Client){" "}
                </p>{" "}
              </div>
              <div className="box_section">
                <TableBase
                  data={data}
                  columns={columns}
                  pageSize={5}
                  onRowSelect={handleRowSelect}
                />
              </div>
              <div className="box_section mg_t25 mg_b15">
                <p className="box_title_xs">Table Row</p>{" "}
              </div>
              <div className="box_section">
                <table className="tbl tbl_col tbl_border">
                  <caption></caption>
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="row" className="ta_c">
                        Mã sinh viên
                      </th>
                      <th scope="row" className="ta_c">
                        Tên sinh viên
                      </th>
                      <th scope="row" className="ta_c">
                        Mã môn học
                      </th>
                      <th scope="row" className="ta_c">
                        Tên môn học
                      </th>
                      <th scope="row" className="ta_c">
                        Điểm
                      </th>{" "}
                      <th scope="row" className="ta_c">
                        Điểm nhập
                      </th>{" "}
                      <th scope="row" className="ta_c">
                        Điểm trung bình
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {listTableRow.length > 0 ? (
                      listTableRow.map((std) =>
                        std.listSubject.map((sbjt, indexSbjt) => (
                          <tr>
                            {indexSbjt === 0 && (
                              <td
                                className="ta_c"
                                rowSpan={std.listSubject.length}
                              >
                                {std.studentNo}
                              </td>
                            )}
                            {indexSbjt === 0 && (
                              <td
                                className="ta_c"
                                rowSpan={std.listSubject.length}
                              >
                                {std.studentName}
                              </td>
                            )}
                            <td className="ta_c">{sbjt.code}</td>
                            <td className="ta_c">{sbjt.name}</td>
                            <td className="ta_c">{sbjt.score}</td>
                            <td className="ta_c">
                              <InputBase
                                type="number"
                                min={0}
                                max={10}
                                value={sbjt.scoreInput}
                                onChange={handleChangeScoreInput(
                                  std.id,
                                  sbjt.id
                                )}
                              />
                            </td>
                            {indexSbjt === 0 && (
                              <td
                                className="ta_c"
                                rowSpan={std.listSubject.length}
                              >
                                {std.average}
                              </td>
                            )}
                          </tr>
                        ))
                      )
                    ) : (
                      <tr>
                        <td colSpan={5}>No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ContainerBase>
            <ContainerBase id="section7">
              {" "}
              <div className="box_section">
                <p className="box_title_sm">7. Timeline</p>{" "}
              </div>
              <div className="box_section">
                <p className="box_title_md">Timeline ngang</p>{" "}
              </div>
              <div className="box_section mg_t30 mg_b30">
                <StepBase
                  steps={steps}
                  currentStep={2}
                  direction="horizontal"
                  completedStepStyle={{ color: "green" }}
                  currentStepStyle={{ color: "blue", fontWeight: "bold" }}
                  upcomingStepStyle={{ color: "lightgray" }}
                />{" "}
              </div>
              <div className="box_section">
                <p className="box_title_md">Timeline dọc</p>{" "}
              </div>
              <div className="box_section mg_t25">
                <TimelineBase
                  items={timelineItemsHorizontal}
                  direction="horizontal"
                  currentStep={2}
                  completedStepStyle={{ color: "green" }}
                  currentStepStyle={{ color: "blue", fontWeight: "bold" }}
                  upcomingStepStyle={{ color: "lightgray" }}
                />
                <TimelineBase
                  items={timelineItemsVertical}
                  direction="vertical"
                  currentStep={2}
                  completedStepStyle={{ color: "green" }}
                  currentStepStyle={{ color: "blue", fontWeight: "bold" }}
                  upcomingStepStyle={{ color: "lightgray" }}
                />
              </div>
            </ContainerBase>
            <ContainerBase id="section8">
              <div className="box_section">
                <p className="box_title_sm">8. Color Picker</p>
              </div>
              <div className="box_section">
                <p className="mg_b10">Select a Color</p>
                <ColorBase value={color} onChange={handleColorChange} />
                <p className="mg_t10">
                  Selected Color: <span style={{ color }}>{color}</span>
                </p>
              </div>
            </ContainerBase>

            <ContainerBase id="section9">
              <div className="box_section">
                <p className="box_title_sm">9. Form Jodit Editor</p>
              </div>
              <div className="box_section">
                <p className="box_title_md mg_b15">Form Editor</p>
                <FormJoditEditorBase
                  value={editorContent}
                  onChange={handleEditorChange}
                />
              </div>
              <div className="box_section mg_t20">
                <p className="box_title_md mg_b15">View Editor</p>
                <ViewJoditEditorBase value={content} />
              </div>
            </ContainerBase>

            <ContainerBase id="section10">
              <div className="box_section">
                <p className="box_title_sm">10. Image - Avatar</p>
              </div>
              <div className="mg_b20 bg_t20">
                <AvatarBase src={avatarSrc} size={100} alt="User Avatar" />
              </div>{" "}
              <div className="mg_b20 bg_t20">
                <ImageBase
                  src={imageUrl}
                  width={300}
                  height={200}
                  alt="Featured"
                />
              </div>
            </ContainerBase>

            <ContainerBase id="section11">
              <div className="box_section">
                <p className="box_title_sm">11. Collapse</p>
              </div>
              <div className="box_section">
                <CollapseBase
                  panels={panelData}
                  defaultActiveKey={["1"]}
                  accordion
                />
              </div>
            </ContainerBase>

            <ContainerBase id="section12">
              <div className="box_section">
                <p className="box_title_sm">12. Chart</p>
              </div>
              <div className="box_section">
                <p className="box_title_md mg_b20">Bar Chart</p>
                <BarChartBase
                  data={dataBarChart}
                  options={optionsBarChart}
                  width={800}
                  height={400}
                  isDownload={true}
                />
              </div>
              <div className="box_section mg_t40">
                <p className="box_title_md mg_b20">Column Chart</p>
                <ColumnChartBase
                  data={chartDataColumn}
                  options={chartOptionsColumn}
                  width={800}
                  height={400}
                  isDownload={true}
                />
              </div>
              <div className="box_section mg_t40">
                <p className="box_title_md mg_b20">Line Chart</p>
                <LineChartBase
                  data={dataLineChart}
                  options={optionsLineChart}
                  width={800}
                  height={400}
                  isDownload={true}
                />
              </div>
              <div className="box_section mg_t40">
                <p className="box_title_md mg_b20">Pie Chart</p>
                <PieChartBase
                  data={chartDataPie}
                  options={chartOptionsPie}
                  width={500}
                  height={500}
                  isDownload={true}
                />
              </div>
            </ContainerBase>
            <ContainerBase id="section13">
              <div className="box_section">
                <p className="box_title_sm">13. Excel</p>
              </div>
            </ContainerBase>
            <ContainerBase id="section14">
              <div className="box_section">
                <p className="box_title_sm">14. Rate</p>
              </div>
              <div className="box_section">
                <RateBase
                  value={rating}
                  onChange={handleRatingChange}
                  allowHalf={true}
                />
              </div>
            </ContainerBase>
            <ContainerBase id="section15">
              <div className="box_section">
                <p className="box_title_sm">15. Tab</p>
              </div>
              <div className="box_section">
                <TabBase
                  items={items}
                  activeKey={activeKey}
                  onChange={handleTabChange}
                  tabBarExtraContent={null}
                />
              </div>
            </ContainerBase>
            <ContainerBase id="section16">
              <div className="box_section">
                <p className="box_title_sm">16. Date Picker</p>
              </div>
            </ContainerBase>
          </div>
        </div>
      </main>
      <footer>
        <TFooter />
      </footer>
    </div>
  );
};

export default Template;
