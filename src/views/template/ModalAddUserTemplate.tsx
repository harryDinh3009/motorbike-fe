import { useAppSelector } from "@/app/hook";
import ButtonBase from "@/component/common/button/ButtonBase";
import InputBase from "@/component/common/input/InputBase";
import RadioButtonBase from "@/component/common/input/RadiobuttonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import TModal from "@/component/common/modal/TModal";
import { useAlert } from "@/plugins/global";
import { handleChange } from "@/utils/formUtils";
import { useState } from "react";

interface ModalAddUserTemplateProps {
  isOpen: boolean;
  handleCancel: () => void;
}

type UserModel = {
  code: string;
  name: string;
  phoneNumber: string;
  bank: string;
  gender: string;
  address: string;
};

const ModalAddUserTemplate: React.FC<ModalAddUserTemplateProps> = ({
  isOpen,
  handleCancel,
}) => {
  const { alert, confirm, toast } = useAlert();
  const [user, setUser] = useState<UserModel>({
    code: "",
    name: "",
    phoneNumber: "",
    bank: "",
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

  const isFormValid = useAppSelector((state) => state.common.check);

  const saveData = () => {
    if (isFormValid) {
      alert("Bạn chưa nhập đủ thông tin");
      return;
    }
    console.log(user);
  };

  return (
    <>
      <TModal
        title="Add User"
        visible={isOpen}
        width={650}
        onCancel={handleCancel}
        footer={false}
        onOk={saveData}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="box_section">
          <table className="tbl_row tbl_border">
            <colgroup>
              <col style={{ width: "27%" }} />
              <col style={{ width: "auto" }} />
            </colgroup>
            <tbody>
              <tr>
                <th scope="row">
                  <p className="required">Mã người dùng</p>
                </th>
                <td colSpan={3}>
                  <InputBase
                    id="userCodeModal"
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
                    id="userNameModal"
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
                    id="phoneNumberModal"
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
                    id="bankSelectModal"
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
                    id="genderModal"
                    options={listGender}
                    required={true}
                    onChange={handleChange(setUser, "gender")}
                    defaultValue={user.gender}
                  />
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <p className="required">Địa chỉ</p>
                </th>
                <td colSpan={3}>
                  <TextAreaBase
                    id="addressModal"
                    placeholder="Hãy nhập địa chỉ"
                    required={true}
                    onChange={handleChange(setUser, "address")}
                    defaultValue={user.address}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </TModal>
    </>
  );
};

export default ModalAddUserTemplate;
