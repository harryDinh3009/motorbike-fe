import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import { CustomerDTO } from "@/service/business/customerMng/customerMng.type";
import { getCustomerDetail } from "@/service/business/customerMng/customerMng.service";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import { formatDateDMY } from "@/utils/common";

interface Props {
  open: boolean;
  customerId: string | null;
  onClose: () => void;
}

const ModalViewCustomer = ({ open, customerId, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerDetail();
    } else {
      setCustomer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerId]);

  const fetchCustomerDetail = async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerDetail(customerId);
      console.log("Detail customer response:", res); // Debug log
      if (res && res.data) {
        setCustomer(res.data);
      } else {
        console.error("Invalid response structure:", res);
        setError("Không thể tải thông tin khách hàng");
      }
    } catch (err: any) {
      console.error("Failed to fetch customer detail:", err);
      setError(err?.response?.data?.message || "Không thể tải thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const genderMap: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Chi tiết khách hàng"
      width={900}
      hideOkButton={true}
      hideCancelButton={false}
    >
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <div style={{ padding: 20, textAlign: "center", color: "#ff4d4f" }}>
          {error}
        </div>
      ) : customer ? (
        <div style={{ padding: "20px 0" }}>
          {/* Thông tin cơ bản */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1677ff" }}>
              Thông tin cơ bản
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 32px",
              }}
            >
              {[
                { label: "Họ tên", value: customer.fullName, bold: true },
                { label: "Số điện thoại", value: customer.phoneNumber },
                { label: "Email", value: customer.email || "-" },
                {
                  label: "Ngày sinh",
                  value: customer.dateOfBirth ? formatDateDMY(customer.dateOfBirth) : "-",
                },
                {
                  label: "Giới tính",
                  value: customer.gender ? (genderMap[customer.gender] || customer.gender) : "-",
                },
                { label: "Quốc gia", value: customer.country || "-" },
                { label: "Địa chỉ", value: customer.address || "-" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    paddingBottom: idx < 7 ? 12 : 0,
                    borderBottom: idx < 7 ? "1px solid #e8e8e8" : "none",
                  }}
                >
                  <div style={{ minWidth: 120, color: "#666", fontSize: 14, fontWeight: 500 }}>
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
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Giấy tờ tùy thân */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1677ff" }}>
              Giấy tờ tùy thân
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 32px",
              }}
            >
              {[
                { label: "Căn cước/CCCD/CMND", value: customer.citizenId || "-" },
                { label: "Giấy phép lái xe", value: customer.driverLicense || "-" },
                { label: "Hộ chiếu", value: customer.passport || "-" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    paddingBottom: idx < 2 ? 12 : 0,
                    borderBottom: idx < 2 ? "1px solid #e8e8e8" : "none",
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
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Ảnh giấy tờ */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* CCCD mặt trước */}
                {customer.citizenIdFrontImageUrl && (
                  <div>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 14, fontWeight: 500 }}>
                      Căn cước/CCCD/CMND (Mặt trước):
                    </div>
                    <img
                      src={customer.citizenIdFrontImageUrl}
                      alt="CCCD mặt trước"
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        height: "auto",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  </div>
                )}
                {/* CCCD mặt sau */}
                {customer.citizenIdBackImageUrl && (
                  <div>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 14, fontWeight: 500 }}>
                      Căn cước/CCCD/CMND (Mặt sau):
                    </div>
                    <img
                      src={customer.citizenIdBackImageUrl}
                      alt="CCCD mặt sau"
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        height: "auto",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  </div>
                )}
                {/* Giấy phép lái xe */}
                {customer.driverLicenseImageUrl && (
                  <div>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 14, fontWeight: 500 }}>
                      Giấy phép lái xe:
                    </div>
                    <img
                      src={customer.driverLicenseImageUrl}
                      alt="Giấy phép lái xe"
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        height: "auto",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  </div>
                )}
                {/* Hộ chiếu */}
                {customer.passportImageUrl && (
                  <div>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 14, fontWeight: 500 }}>
                      Hộ chiếu:
                    </div>
                    <img
                      src={customer.passportImageUrl}
                      alt="Hộ chiếu"
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        height: "auto",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {customer.note && (
            <div
              style={{
                background: "#fafafa",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#1677ff" }}>
                Ghi chú
              </div>
              <div
                style={{
                  color: "#222",
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {customer.note}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
          Không tìm thấy thông tin khách hàng
        </div>
      )}
    </TModal>
  );
};

export default ModalViewCustomer;

