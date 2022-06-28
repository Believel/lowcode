import { useRef } from "react";
import { getOnlyKey } from "../utils";

/**
 * 组件更新
 *
 * 为了颗粒度细化
 *
 * 目前设置是 增删 组件全部更新
 * 组件更新的话 只更新组件自身
 */

/**
 * 函数命名规则
 * get 获取数据
 * set 设置数据
 * update 更新数据，包括设置数据和组件更新
 */

class Canvas {
  constructor() {
    this.cmpsEntity = new Map(); // 实例
    this.defaultCanvas = {
      style: {
        width: 320,
        height: 568,
        backgroundColor: "#ffffff00",
        backgroundImage: "",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        boxSizing: "content-box",
      },
      // 组件
      cmps: [],
    };
    // 画布属性

    this.canvas = {
      ...this.defaultCanvas,
    };
    // 画布修改历史 - 每一项存储的是this.canvas数据
    this.canvasChangeHistory = [];
    this.canvasIndex = -1;

    // state发生改变，需要执行的动作，如组件更新
    this.listeners = [];
    // 被选中的组件
    this.selectedCmp = null;

    // 画布之外的组件更新，如编辑区域
    this.storeChangeCmps = [];
  }

  getCanvasData = () => {
    return { ...this.canvas };
  };

  goPrevCanvasHistory = () => {
    const index = this.canvasIndex - 1 < 0 ? 0 : this.canvasIndex - 1;

    if (index !== this.canvasIndex && this.canvasChangeHistory[index]) {
      this.canvasIndex = index;
      const lastCanvasHistorry = this.canvasChangeHistory[index];

      this.canvas = lastCanvasHistorry;
      // 更新组件
      this.runListeners();
    }
  };

  goNextCanvasHistory = () => {
    const index =
      this.canvasIndex + 1 > this.canvasChangeHistory.length - 1
        ? this.canvasChangeHistory.length - 1
        : this.canvasIndex + 1;

    if (index !== this.canvasIndex && this.canvasChangeHistory[index]) {
      this.canvasIndex = index;
      const lastCanvasHistorry = this.canvasChangeHistory[index];

      this.canvas = lastCanvasHistorry;

      this.runListeners();
    }
  };
  // 存储画布记录数据
  recordCanvasChangeHistory = () => {
    // 存储的是整个canvas数据
    this.canvasChangeHistory.push(this.canvas);
    // 修改当前画布记录的索引
    this.canvasIndex = this.canvasChangeHistory.length - 1; //2;
  };

  // get canvasStyle
  getCanvasStyle = () => {
    return { ...this.canvas.style };
  };

  // 更新整个画布
  // 记得把选中的组件设置为null，因为画布都更新了，意味着原先选中的组件也已经没有了
  updateCanvas = (canvas) => {
    this.selectedCmp = null;
    this.canvas = { ...canvas };
    this.runListeners();
    this.recordCanvasChangeHistory();
  };
  // 清空画布
  emptyCanvas = () => {
    this.canvas = { ...this.defaultCanvas };
    this.runListeners();
    this.recordCanvasChangeHistory();
  };

  updateCanvasStyle = (data) => {
    const newCanvas = {
      ...this.canvas,
      style: {
        ...this.getCanvasStyle(),
        ...data,
      },
    };

    if (JSON.stringify(newCanvas) === JSON.stringify(this.canvas)) {
      return;
    }

    this.canvas = newCanvas;
    // 更新Content层级
    this.runListeners();
    this.recordCanvasChangeHistory();
  };

  // 订阅与取消订阅
  registerStoreChangeCmps = (_cmp) => {
    this.storeChangeCmps.push(_cmp);
    return () => {
      this.storeChangeCmps = this.storeChangeCmps.filter(
        (cmp) => _cmp.onlyKey !== cmp.onlyKey
      );
    };
  };
  /**
   * 注册组件实例
   * @param {*} key 当前组件的onlyKey
   * @param {*} entity 当前组件的实例  class组件实现的
   * @returns 
   */
  registerCmpsEntity = (key, entity) => {
    this.cmpsEntity.set(key, entity);
    return () => this.cmpsEntity.delete(key);
  };

  forceCmpsUpdate = (..._cmps) => {
    // 更新画布组件
    _cmps.forEach((_cmp) => {
      this.cmpsEntity.get(_cmp.onlyKey).onStoreChange();
    });

    // 更新和画布组件相关的组件，如编辑区域
    this.storeChangeCmps.forEach(({ onStoreChange }) => onStoreChange());
  };

  getCmp = (index) => {
    const cmps = this.getCmps();
    return { ...cmps[index] };
  };

  getCmps = () => {
    return [...this.canvas.cmps];
  };

  setCmps = (_cmps) => {
    this.canvas = {
      ...this.canvas,
      cmps: _cmps,
    };
  };

  // 设置cmps数据，并更新App
  updateCmps = (_cmps) => {
    // 更新 this.canvas 数据
    this.setCmps(_cmps);
    // 更新订阅的组件
    this.runListeners();

    this.recordCanvasChangeHistory();
  };

  addCmp = (_cmp) => {
    this.selectedCmp = {
      ..._cmp,
      onlyKey: getOnlyKey(),
    };
    // 获取画布中的组件集合
    const cmps = this.getCmps();
    // 更新画布中的组件集合
    this.updateCmps([...cmps, this.selectedCmp]);
    //this.recordCanvasChangeHistory();
  };

  updateCmp = (_cmp) => {
    const cmps = this.getCmps();

    for (let i = 0; i < cmps.length; i++) {
      if (cmps[i].onlyKey === _cmp.onlyKey) {
        cmps[i] = _cmp;
        break;
      }
    }
    this.setCmps(cmps);
    this.forceCmpsUpdate(_cmp);

    console.log("画布数据", JSON.stringify(this.canvas)); //sy-log
  };

  /** 选中组件的操作 **/
  // 获取选中的组件
  getSelectedCmp = () => {
    return this.selectedCmp;
  };

  setSelectedCmp = (_cmp) => {
    if (this.selectedCmp === _cmp) {
      return;
    }

    let needForceUpdateCmps = [];

    if (this.selectedCmp) {
      needForceUpdateCmps.push(this.selectedCmp);
    }

    this.selectedCmp = _cmp;

    // 如果selectedCmp为null，证明为取消选中，则这个时候只更新取消选中的组件就行了
    // 否则，下个要选中的组件也要更新

    if (this.selectedCmp) {
      needForceUpdateCmps.push(this.selectedCmp);
    }

    // 更新上个选中的和下个选中的组件
    this.forceCmpsUpdate(...needForceUpdateCmps);
  };

  // 在编辑区域更新组件style、拖拽组件更新组件style
  updateSelectedCmpStyle = (_style, frequently) => {
    let _cmp = this.getSelectedCmp();

    let cmp = {
      ..._cmp,
      data: { ..._cmp.data, style: { ..._cmp.data.style, ..._style } },
    };
    if (JSON.stringify(cmp) !== JSON.stringify(this.selectedCmp)) {
      this.selectedCmp = cmp;
      this.updateCmp(cmp);

      if (!frequently) {
        this.recordCanvasChangeHistory();
      }
    }
  };

  // 在编辑区域更新组件value
  updateSelectedCmpValue = (value) => {
    let _cmp = this.getSelectedCmp();
    let cmp = {
      ..._cmp,
      data: {
        ..._cmp.data,
        value,
      },
    };

    this.selectedCmp = cmp;
    this.updateCmp(cmp);
    this.recordCanvasChangeHistory();
  };

  // 点击组件，右键删除组件
  deleteSelectedCmp = (_cmp) => {
    this.setSelectedCmp(null);

    const cmps = this.getCmps();
    this.updateCmps(cmps.filter((cmp) => cmp.onlyKey !== _cmp.onlyKey));
  };

  // 交换i、j位置的元素，置顶置底
  changeCmpIndex = (i, j = this.getCmps().length - 1) => {
    if (i === j) {
      return;
    }

    let newCmps = this.getCmps();
    let tem = newCmps[i];
    newCmps[i] = newCmps[j];
    newCmps[j] = tem;
    this.updateCmps(newCmps);
  };

  //现在只用到了更新整个App组件
  runListeners = () => {
    this.listeners.forEach((listener) => listener());
  };

  // 订阅 组件更新
  subscribe = (listener) => {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((lis) => lis !== listener);
    };
  };

  // 返回画布数据的增删改查函数
  getCanvas = () => {
    const returnFuncs = [
      "getCanvasData",
      "recordCanvasChangeHistory",
      "goPrevCanvasHistory",
      "goNextCanvasHistory",
      "updateCanvas",
      "emptyCanvas",
      "getCanvasStyle",
      "updateCanvasStyle",
      "registerStoreChangeCmps",
      "registerCmpsEntity",
      "getCmp",
      "getCmps",
      "setCmps",
      "addCmp",
      "getSelectedCmp",
      "setSelectedCmp",
      "updateSelectedCmpStyle",
      "updateSelectedCmpValue",
      "deleteSelectedCmp",
      "changeCmpIndex",
      "subscribe",
    ];
    const obj = {};
    returnFuncs.forEach((func) => {
      obj[func] = this[func];
    });
    return obj;
  };
}

// export const globalCanvas = new Canvas();

// useForm
export function useCanvas(canvas) {
  const canvasRef = useRef();

  if (!canvasRef.current) {
    if (canvas) {
      canvasRef.current = canvas;
    } else {
      const globalCanvas = new Canvas();
      canvasRef.current = globalCanvas.getCanvas();
    }
  }
  return canvasRef.current;
}
