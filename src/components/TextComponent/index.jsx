import {formatStyle} from "../../utils";
import styles from "./index.module.less";

export default function TextComponent(data) {
  const {style} = data;

  return (
    <div className={styles.main} style={formatStyle(style, false)}>
      {data.value}
    </div>
  );
}
