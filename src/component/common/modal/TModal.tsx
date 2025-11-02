import React, { useState } from "react";
import { Modal, Button } from "antd";

interface TModalProps {
  title?: string;
  visible: boolean;
  onCancel: () => void;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  children: React.ReactNode;
  width?: number;
  footer?: React.ReactNode | null;
  loading?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  centered?: boolean;
  okButtonProps?: React.ComponentProps<typeof Button>;
  cancelButtonProps?: React.ComponentProps<typeof Button>;
  keyboard?: boolean;
  hideOkButton?: boolean;
  hideCancelButton?: boolean;
}

const TModal: React.FC<TModalProps> = ({
  title,
  visible,
  onCancel,
  onOk,
  okText = "Xác nhận",
  cancelText = "Hủy",
  children,
  width = 550,
  footer,
  loading = false,
  maskClosable = true,
  closable = true,
  centered = false,
  okButtonProps,
  cancelButtonProps,
  keyboard = true,
  hideOkButton = false,
  hideCancelButton = false,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText={okText}
      cancelText={cancelText}
      width={width}
      footer={
        footer ? (
          footer
        ) : (
          <>
            {!hideCancelButton && (
              <Button {...cancelButtonProps} onClick={onCancel}>
                {cancelText}
              </Button>
            )}
            {!hideOkButton && (
              <Button
                type="primary"
                loading={loading}
                onClick={onOk}
                {...okButtonProps}
              >
                {okText}
              </Button>
            )}
          </>
        )
      }
      maskClosable={maskClosable}
      closable={closable}
      centered={centered}
      keyboard={keyboard}
    >
      {children}
    </Modal>
  );
};

export default TModal;
