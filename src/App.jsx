import { useLayoutEffect } from "react";
import { CanvasContext } from "./store/Context";
import Cmps from "./pages/Cmps";
import Content from "./pages/Content";
import Edit from "./pages/Edit";
import { useForceUpdate } from "./hooks";
import { useCanvas } from "./store/globalCanvas";
import styles from './App.module.less'

export default function App() {
  const forceUpdate = useForceUpdate();

  // 所有组件
  const globalCanvas = useCanvas();

  useLayoutEffect(() => {
    // 订阅组件更新
    const unsubscribe = globalCanvas.subscribe(() => {
      forceUpdate();
    });
    return () => {
      unsubscribe();
    };
  }, [globalCanvas, forceUpdate]);
  return (
    <div id="app" className={styles.main}>
      <CanvasContext.Provider value={globalCanvas}>
        <Cmps />
        <Content />
        <Edit />
      </CanvasContext.Provider>
    </div>
  );
}
