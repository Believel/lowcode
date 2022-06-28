import { useEffect, useRef, useState, useContext } from "react";
import Draggable from "../Draggable";
import { CanvasContext } from "../../store/Context";
import styles from "./index.module.less";
import { formatStyle } from "../../utils";
import Header from "../Header";

function Content(props) {
  // 所有组件
  const globalCanvas = useContext(CanvasContext);

  // 获取画布属性
  const canvasStyle = globalCanvas.getCanvasStyle();

  const cmps = globalCanvas.getCmps();

  // 画布的位置，
  const [canvasPos, setCanvasPos] = useState(null);

  const canvasRef = useRef();

  // console.log("cmps", cmps, JSON.stringify(globalCanvas.getCanvasData())); //sy-log

  useEffect(() => {
    // 记录画布的位置，因为最终记录的位置是基于画布计算出来的相对位置
    const canvasPos = canvasRef.current.getBoundingClientRect();
    setCanvasPos(canvasPos);

    // 取消选中
    const cancelSelect = (e) => {
      if (
        ["canvas", "root", "app", "content", "editCmp"].indexOf(e.target.id) >
        -1
      ) {
        globalCanvas.setSelectedCmp(null);
      }
    };
    document.getElementById("root").addEventListener("click", cancelSelect);
  }, [globalCanvas]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 新增的组件
    let addingCmp = e.dataTransfer.getData("add-component");
    // 拖拽新增的组件
    if (addingCmp) {
      // 拖拽进来新增的组件
      addingCmp = JSON.parse(addingCmp);
      // 计算拖拽元素的 top 和 left 值
      const top = e.pageY - canvasPos.top - 15;
      const left = e.pageX - canvasPos.left - 40;
      let resData = {
        ...addingCmp,
        data: {
          ...addingCmp.data,
          style: {
            ...addingCmp.data.style,
            top,
            left,
          },
        },
      };
      globalCanvas.addCmp(resData);
    } else {
      // 拖拽画布内的组件
      let startPos = e.dataTransfer.getData("startPos");
      startPos = JSON.parse(startPos);
      // 得到拖拽之后距离差
      let disX = e.pageX - startPos.pageX;
      let disY = e.pageY - startPos.pageY;

      // 获取当前选中的组件的最新信息
      const selectedCmp = globalCanvas.getSelectedCmp();
      // 重新设置组件元素信息
      const top = selectedCmp.data.style.top + disY;
      const left = selectedCmp.data.style.left + disX;
      // 更新组件信息
      globalCanvas.updateSelectedCmpStyle({ top, left });
    }
  };

  return (
    <div id="content" className={styles.main}>
      <Header />
      <div
        className={styles.canvas}
        id="canvas"
        style={{
          ...formatStyle(canvasStyle),
          backgroundImage: `url(${canvasStyle.backgroundImage})`,
        }}
        ref={canvasRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        // 点击画布非组件区域的时候，取消选中的组件
      >
        {canvasRef.current &&
          cmps.map((cmp, index) => {
            return cmp.data ? (
              <Draggable index={index} key={cmp.onlyKey} />
            ) : null;
          })}
      </div>
    </div>
  );
}
export default Content;
