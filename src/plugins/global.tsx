import React, { createContext, useContext } from "react";
import Swal, { SweetAlertIcon } from "sweetalert2";

const AlertContext = createContext<any>(null);

const alert = (_text: string, _title?: string, callback?: () => void) => {
  Swal.fire({
    title: _title ? _title : "Thông báo",
    html: _text,
    confirmButtonColor: "#5D87FF",
    reverseButtons: true,
    confirmButtonText: "Xác nhận",
  }).then(() => {
    if (callback && typeof callback === "function") {
      callback();
    }
  });
};

const confirm = (
  _text: string,
  _title: string,
  callback: (confirmed: boolean) => void
) => {
  Swal.fire({
    title: _title ? _title : "Xác nhận",
    html: _text,
    confirmButtonColor: "#5D87FF",
    showCancelButton: true,
    cancelButtonColor: "#fff",
    reverseButtons: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Hủy",
  }).then((res) => {
    if (callback && typeof callback === "function") {
      callback(res.isConfirmed);
    }
  });
};

const toast = (_title: string, _icon: SweetAlertIcon) => {
  const swalToast = Swal.mixin({
    customClass: "custom_toast",
    buttonsStyling: false,
    toast: true,
    position: "bottom",
    showConfirmButton: false,
    timer: 3000,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  swalToast.fire({
    title: _title,
  });
};

const AlertProvider: React.FC = ({ children }) => {
  return (
    <AlertContext.Provider value={{ alert, confirm, toast }}>
      {children}
    </AlertContext.Provider>
  );
};

const useAlert = () => {
  return useContext(AlertContext);
};

export { AlertProvider, useAlert };
