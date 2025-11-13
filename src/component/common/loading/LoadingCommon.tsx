import styles from "./style-loading.module.css";

const LoadingIndicator = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(72, 72, 72, 0.2)",
      zIndex: 999999999,
    }}
  >
    <div className={styles.boxes}>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
);

export default LoadingIndicator;
