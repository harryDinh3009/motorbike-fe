import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import { UserMngListDTO } from "@/service/business/userMng/userMng.type";
import { detailUser } from "@/service/business/userMng/userMng.service";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";

interface Props {
  open: boolean;
  employeeId: string | null;
  onClose: () => void;
}

const ModalViewEmployee = ({ open, employeeId, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<UserMngListDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && employeeId) {
      fetchEmployeeDetail();
    } else {
      setEmployee(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employeeId]);

  const fetchEmployeeDetail = async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await detailUser(employeeId);
      console.log("Detail user response:", res); // Debug log
      // Handle response - res is already ApiResponse<UserMngListDTO> from service
      if (res && res.data) {
        setEmployee(res.data);
      } else {
        console.error("Invalid response structure:", res);
        setError("Không thể tải thông tin nhân viên");
      }
    } catch (err: any) {
      console.error("Failed to fetch employee detail:", err);
      setError(err?.response?.data?.message || "Không thể tải thông tin nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<string, { label: string; color: string; bg: string }> =
    {
      ACTIVE: { label: "Đang làm", color: "#27ae60", bg: "#eafbe7" },
      INACTIVE: { label: "Nghỉ", color: "#ff4d4f", bg: "#fff1f0" },
    };


  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Chi tiết nhân viên"
      width={800}
      hideOkButton={true}
      hideCancelButton={false}
    >
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <div style={{ padding: 20, textAlign: "center", color: "#ff4d4f" }}>
          {error}
        </div>
      ) : employee ? (
        <div style={{ padding: "20px 0" }}>
          <div
            style={{
              background: "#fafafa",
              borderRadius: 8,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[
              { label: "Họ tên", value: employee.fullName, bold: true },
              { label: "Tên đăng nhập", value: employee.userName },
              { label: "Số điện thoại", value: employee.phoneNumber || "-" },
              { label: "Email", value: employee.email || "-" },
              {
                label: "Giới tính",
                value: employee.genderNm || "-",
              },
              {
                label: "Chức vụ",
                value: employee.roleNm || "-",
              },
              { label: "Chi nhánh", value: employee.branchName || "-" },
              {
                label: "Trạng thái",
                value: employee.statusNm ? (
                  <span
                    style={{
                      background: statusMap[employee.statusNm]?.bg,
                      color: statusMap[employee.statusNm]?.color,
                      borderRadius: 8,
                      padding: "2px 12px",
                      fontWeight: 500,
                      fontSize: 14,
                      display: "inline-block",
                      minWidth: 80,
                      textAlign: "center",
                    }}
                  >
                    {statusMap[employee.statusNm]?.label || employee.statusNm}
                  </span>
                ) : (
                  "-"
                ),
                isCustom: true,
              },
              { label: "Địa chỉ", value: employee.address || "-" },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  paddingBottom: idx < 9 ? 12 : 0,
                  borderBottom: idx < 9 ? "1px solid #e8e8e8" : "none",
                }}
              >
                <div style={{ minWidth: 150, color: "#666", fontSize: 14, fontWeight: 500 }}>
                  {item.label}:
                </div>
                <div
                  style={{
                    flex: 1,
                    color: "#222",
                    fontSize: 14,
                    fontWeight: item.bold ? 600 : 400,
                  }}
                >
                  {item.isCustom ? item.value : item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
          Không tìm thấy thông tin nhân viên
        </div>
      )}
    </TModal>
  );
};

export default ModalViewEmployee;

