import React, { memo, useRef } from "react";
import JoditEditor from "jodit-react";
import { Jodit } from "jodit"; 

interface FormJoditEditorBaseProps {
  value: string;
  onChange: (newValue: string) => void;
}

const FormJoditEditorBase: React.FC<FormJoditEditorBaseProps> = ({
  value,
  onChange,
}) => {
  const editor = useRef<Jodit | null>(null); 
  const urlFileUpload = `${
    import.meta.env.VITE_API_ENDPOINT
  }/cmn/upload/form-editor`;

  // Custom config upload image
  const config = {
    minHeight: 500,
    uploader: {
      insertImageAsBase64URI: false,
      imagesExtensions: ["jpg", "png", "jpeg", "gif"],
      withCredentials: false,
      format: "json",
      method: "POST",
      url: urlFileUpload,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      prepareData: (formData: FormData) => {
        const file = formData.getAll("files[0]")[0];
        formData.forEach((_, key) => {
          if (key !== "files[0]") formData.delete(key);
        });
        formData.append("file", file as Blob);
        return formData;
      },
      isSuccess: (resp: any) => !resp.error,
      process: (resp: any) => {
        if (resp?.url) {
          const imgElement = editor.current?.createInside.element(
            "img"
          ) as HTMLImageElement;
          imgElement.src = resp.url;
          imgElement.style.maxWidth = "300px";
          editor.current?.selection.insertNode(imgElement);
        }
        return {
          files: [""],
          path: "",
          baseurl: "",
          error: 0,
          msg: "Image uploaded successfully",
        };
      },
    },
  };

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      tabIndex={1}
      onBlur={(newValue) => onChange(newValue)}
    />
  );
};

export default memo(FormJoditEditorBase);
