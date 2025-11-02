import React, { memo } from "react";
import JoditEditor from "jodit-react";
import styles from "./style-view-jodit-editor.module.css";

interface ViewJoditEditorProps {
  value: string;
}

const ViewJoditEditorBase: React.FC<ViewJoditEditorProps> = ({ value }) => {
  return (
    <div style={{ minHeight: "70px", position: "relative" }}>
      <JoditEditor
        value={value}
        tabIndex={-1}
        className={styles.view_editor_jodit}
        config={{
          readonly: true,
          toolbar: false,
          showCharsCounter: false,
          showWordsCounter: false,
          showStatusbar: true,
          showPoweredBy: false,
        }}
      />
    </div>
  );
};

export default memo(ViewJoditEditorBase);
