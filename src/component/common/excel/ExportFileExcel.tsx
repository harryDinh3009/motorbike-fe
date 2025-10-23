import React from "react";
import ExcelJS from "exceljs";
import Swal from "sweetalert2";
import { format } from "date-fns";

interface ArrayColor {
  name?: string;
  color?: string;
}

interface ExportFileExcelProps {
  data: Array<{
    sheetName: string;
    header: string[];
    data: any[];
  }>;
  btnName: string;
  fileName: string;
  callData?: boolean;
  arrayColor?: ArrayColor[];
}

const ExportFileExcel: React.FC<ExportFileExcelProps> = ({
  data,
  btnName,
  fileName,
  callData = false,
  arrayColor = [],
}) => {
  const downloadExcel = () => {
    Swal.fire({
      text: "Bạn có chắc muốn tải xuống file excel không ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        executeDownloadExcel();
      }
    });
  };

  const executeDownloadExcel = () => {
    const workbook = new ExcelJS.Workbook();
    let newArr: Record<string, string[]> = {};

    data.forEach((element, index) => {
      newArr[`sheet${index}`] = [];
      element.header.forEach((headerItem) => {
        arrayColor.forEach((item) => {
          if (item?.name?.includes(headerItem)) {
            newArr[`sheet${index}`].push(item.color);
          }
        });
      });
    });

    data.forEach((element, idx) => {
      const sheet = workbook.addWorksheet(element.sheetName);
      const headerRow = sheet.addRow(element.header);

      headerRow.eachCell((cell: any, colNumber: any) => {
        const color = newArr[`sheet${idx}`][colNumber - 1];
        if (color) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: color },
          };
        } else {
          cell.fill = {
            type: "pattern",
            pattern: "none",
          };
        }
      });

      element.data.forEach((el) => {
        sheet.addRow(el);
      });
    });

    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const newFileName = `${format(
        new Date(),
        "yyyyMMddHHmmss"
      )}_${fileName}.xlsx`;
      link.download = newFileName;
      link.click();
      link.remove();
    });
  };

  return (
    <>
      {!callData ? (
        <button
          type="button"
          className="button btn_lg btn_secondary btn_excel_download"
          onClick={downloadExcel}
        >
          {btnName}
        </button>
      ) : (
        <button
          type="button"
          className="button btn_lg btn_secondary btn_excel_download"
        >
          {btnName}
        </button>
      )}
    </>
  );
};

export default ExportFileExcel;
