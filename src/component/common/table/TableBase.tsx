import React, { useState } from "react";
import { Table, TableProps, Pagination, Row, Col } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import styles from "./style.module.css";

const rowClassName = (record: any, index: number): string => {
  return index % 2 === 0 ? "even-row" : "odd-row";
};

interface TableBaseProps<T> extends TableProps<T> {
  data: T[];
  pageSize?: number;
  onRowSelect?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  paginationType?: "FE" | "BE";
  totalPages?: number;
  getPage?: (page: number, pageSize: number) => void;
}

const TableBase = <T extends object>({
  data,
  pageSize = 10,
  onRowSelect,
  onPageChange,
  paginationType = "BE",
  totalPages,
  getPage,
  ...props
}: TableBaseProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    const size = newPageSize || currentPageSize;

    if (size !== currentPageSize) {
      setCurrentPageSize(size);
    }

    if (paginationType === "BE") {
      if (onPageChange) {
        onPageChange(page, size);
      }
      if (getPage) {
        getPage(page, size);
      }
    }
  };

  const rowSelection: TableRowSelection<T> = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      onRowSelect && onRowSelect(selectedKeys, selectedRows);
    },
  };

  const paginatedData =
    paginationType === "FE"
      ? data.slice(
          (currentPage - 1) * currentPageSize,
          currentPage * currentPageSize
        )
      : data;

  return (
    <div>
      <Table
        {...props}
        rowSelection={rowSelection}
        dataSource={paginatedData}
        pagination={false}
        rowClassName={rowClassName}
        rowKey={(record) => (record as any).id || record.key}
      />
      <Row justify="end" style={{ marginTop: 25 }}>
        <Col>
          <Pagination
            style={{ display: "flex", alignItems: "center" }}
            simple={true}
            current={currentPage}
            pageSize={currentPageSize}
            total={paginationType === "FE" ? data.length : totalPages}
            onChange={handlePageChange}
            className={styles["ant-pagination-simple-pager"]}
            showSizeChanger
          />
        </Col>
      </Row>
    </div>
  );
};

export default TableBase;
