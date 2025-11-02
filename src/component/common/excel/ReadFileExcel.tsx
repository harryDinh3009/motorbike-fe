import React, { useRef, useState } from "react";
import ExcelJS from "exceljs";

interface ReadFileExcelProps {
  modelValue: Array<{
    name: string;
    headers: string[];
    rows: Array<Record<string, any>>;
    data: Array<Record<string, any>>;
  }>;
  label: string;
  id: string;
  name: string;
  onUpdate: (sheets: any) => void;
  onCallFunction: (sheets: any) => void;
}

const ReadFileExcel: React.FC<ReadFileExcelProps> = ({
  modelValue,
  label,
  id,
  name,
  onUpdate,
  onCallFunction,
}) => {
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    setFileName(file.name);

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      await readExcelData(data);
    };

    reader.readAsArrayBuffer(file);
  };

  const readExcelData = async (data: Uint8Array) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);

    const sheets: Array<{
      name: string;
      headers: string[];
      rows: Array<Record<string, any>>;
      data: Array<Record<string, any>>;
    }> = [];

    workbook.eachSheet((sheet) => {
      const sheetData = {
        name: sheet.name,
        headers: [],
        rows: [],
        data: [],
      };

      const headerRow = sheet.getRow(1);
      headerRow.eachCell((cell) => {
        sheetData.headers.push(cell.value);
      });

      sheet.eachRow((row, rowIndex) => {
        if (rowIndex > 1) {
          const rowData: Record<string, any> = {};
          row.eachCell((cell, colNumber) => {
            rowData[sheetData.headers[colNumber - 1]] = cell.value;
          });
          sheetData.rows.push(rowData);
        }
      });

      sheetData.data = sheetData.rows;
      sheets.push(sheetData);
    });

    onUpdate(sheets);
    onCallFunction(sheets);
  };

  return (
    <div className="attach_filebox">
      <div className="top">
        <form>
          <button type="button">
            <input
              ref={inputFileRef}
              type="file"
              id={id}
              name={name}
              onChange={onChange}
              hidden
              accept=".xlsx, .xls"
            />
            <label className="btn_white" htmlFor={id}>
              {label}
            </label>
          </button>
          <label htmlFor={id}>{fileName}</label>
        </form>
      </div>
    </div>
  );
};

export default ReadFileExcel;
