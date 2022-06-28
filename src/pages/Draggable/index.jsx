/**
 * 画布中的组件元素 - 也是可拖拽的
 */
 import { Component } from "react";
 import { CanvasContext } from "../../store/Context";
 import { debounce, formatStyle } from "../../utils";
 import ContextMenu from "./ContextMenu";
 import {
   isButtonComponent,
   isImgComponent,
   isTextComponent,
 } from "../Cmps/menus";
 // 画布组件
 import TextComponent from "../../components/TextComponent";
 import ButtonComponent from "../../components/ButtonComponent";
 import ImgComponent from "../../components/ImgComponent";
 import classnames from "classnames";
 import styles from "./index.module.less";
 
 // setSelectCmp 选中的组件
 // selected 是否是选中的组件，选中的组件加橙色标记边框
 export default class Draggable extends Component {
   static contextType = CanvasContext;
   constructor(props, context) {
     super(props);
     this.state = { showContextMenu: false };
   }
 
   componentDidMount() {
     document
       .getElementById("root")
       .addEventListener("click", this.setShowContextMenu);
 
     document.onkeydown = this.whichEvent;
 
     // 注册组件
     this.unregisterCmpsEntity = this.context.registerCmpsEntity(
       this.context.getCmp(this.props.index).onlyKey,
       this
     );
   }
 
   componentWillUnmount() {
     document
       .getElementById("root")
       .removeEventListener("click", this.setShowContextMenu);
 
     this.unregisterCmpsEntity();
   }
 
   // del = (e, cmp) => {
   //   e.stopPropagation();
   //   const globalCanvas = this.context;
   //   globalCanvas.deleteSelectedCmp(cmp);
   // };
 
   moveByMouse = (e, newStyle) => {
     e.preventDefault();
 
     this.context.updateSelectedCmpStyle(newStyle, "frequently");
     // debounce(this.context.updateSelectedCmpStyle(newStyle, "frequently"));
   };
 
   whichEvent = (e) => {
     const globalCanvas = this.context;
 
     const selectCmp = globalCanvas.getSelectedCmp();
 
     const newStyle = {};
 
     switch (e.keyCode) {
       // ?会影响输入框的内容删除，因此这里暂时不处理根据删除键删除组件
       // 删除
       // case 8:
       //   this.del(e, selectCmp);
       //   break;
 
       // 左
       case 37:
         newStyle.left = selectCmp.data.style.left - 1;
         this.moveByMouse(e, newStyle);
         break;
 
       // 上
       case 38:
         newStyle.top = selectCmp.data.style.top - 1;
         this.moveByMouse(e, newStyle);
         break;
 
       // 右
       case 39:
         newStyle.left = selectCmp.data.style.left + 1;
         this.moveByMouse(e, newStyle);
         break;
 
       //下
       case 40:
         newStyle.top = selectCmp.data.style.top + 1;
         this.moveByMouse(e, newStyle);
         break;
 
       default:
         break;
     }
   };
 
   onStoreChange = () => {
     this.forceUpdate();
   };
 
   setShowContextMenu = (e) => {
     e.stopPropagation();
     e.preventDefault();
     this.state.showContextMenu && this.setState({ showContextMenu: false });
   };
 
   handleMouseDown = (e, direction) => {
     e.stopPropagation();
     e.preventDefault();
 
     const cmp = this.context.getCmp(this.props.index);
 
     let startX = e.pageX;
     let startY = e.pageY;
 
     const move = (e) => {
       let x = e.pageX;
       let y = e.pageY;
 
       let disX = x - startX;
       let disY = y - startY;
       let newStyle = {};
 
       if (direction) {
         if (direction.indexOf("top") >= 0) {
           disY = 0 - disY;
           newStyle.top = cmp.data.style.top - disY;
         }
 
         if (direction.indexOf("left") >= 0) {
           disX = 0 - disX;
           newStyle.left = cmp.data.style.left - disX;
         }
       }
 
       // 特别频繁改变，加上一个标记，
       debounce(
         this.context.updateSelectedCmpStyle(
           {
             ...newStyle,
             width: cmp.data.style.width + disX,
             height: cmp.data.style.height + disY,
           },
           "frequently"
         )
       );
     };
 
     const up = () => {
       document.removeEventListener("mousemove", move);
       document.removeEventListener("mouseup", up);
       this.context.recordCanvasChangeHistory();
     };
 
     document.addEventListener("mousemove", move);
     document.addEventListener("mouseup", up);
   };
   // 开始拖拽
   handleDragStart = (e) => {
     this.setActive(e);
     let pageX = e.pageX;
     let pageY = e.pageY;
     e.dataTransfer.setData("startPos", JSON.stringify({ pageX, pageY }));
   };
   // 点击组件
   setActive = (e) => {
     e.stopPropagation();
     const cmp = this.context.getCmp(this.props.index);
     // 设置此组件为选中状态
     this.context.setSelectedCmp(cmp);
   };
   // 右键事件触发
   handleContextMenu = (e) => {
     e.preventDefault();
     this.setState({ showContextMenu: true });
   };
 
   handleMouseDownofRotate = (e) => {
     e.stopPropagation();
     e.preventDefault();
 
     const { updateSelectedCmpStyle } = this.context;
 
     let startX = e.pageX;
     let startY = e.pageY;
 
     const move = (e) => {
       let x = e.pageX;
       let y = e.pageY;
 
       let disX = x - startX;
       let disY = y - startY;
 
       const deg = (360 * Math.atan2(disY, disX)) / (2 * Math.PI);
 
       // 特别频繁改变，加上一个标记，
       debounce(
         updateSelectedCmpStyle(
           {
             transform: `rotate(${deg}deg)`,
           },
           "frequently"
         )
       );
     };
 
     const up = () => {
       document.removeEventListener("mousemove", move);
       document.removeEventListener("mouseup", up);
       this.context.recordCanvasChangeHistory();
     };
 
     document.addEventListener("mousemove", move);
     document.addEventListener("mouseup", up);
   };
 
   render() {
     const { index } = this.props;
 
     const globalCanvas = this.context;
     // 当前组件对象数据
     const cmp = globalCanvas.getCmp(this.props.index);
     // 获取选中的组件
     const selectCmp = globalCanvas.getSelectedCmp();
     // 是否是选中
     const selected = selectCmp && selectCmp.onlyKey === cmp.onlyKey;
 
     const { showContextMenu } = this.state;
 
     const { style } = cmp.data;
 
     const top = style.top - 4;
     const left = style.left - 4;
     const width = style.width,
       height = style.height;
 
     return (
       <>
         <div
           id={"cmp" + cmp.onlyKey}
           className={
             styles.main + " " + (selected ? "selected" : styles.unselected)
           }
           style={{
             ...formatStyle(style, true),
             zIndex: index,
             //animationPlayState: "pouse",
           }}
           draggable={true}
           onDragStart={this.handleDragStart}
           onClick={this.setActive}
           onContextMenu={this.handleContextMenu}
         >
           {getComponent(cmp)}
         </div>
         {selected && (
           <ul
             className={styles.stretch}
             style={{ transform: `rotate${style.transform}` }}
           >
             <li
               className={classnames(styles.rotate, "iconfont icon-xuanzhuan")}
               style={{
                 top: top - 20,
                 left: left + width / 2,
               }}
               onMouseDown={this.handleMouseDownofRotate}
             />
             <li
               className={styles.stretchDot}
               style={{ top, left }}
               onMouseDown={(e) => this.handleMouseDown(e, "top left")}
             />
             <li
               className={styles.stretchDot}
               style={{
                 top,
                 left: left + width / 2,
               }}
               onMouseDown={(e) => this.handleMouseDown(e, "top")}
             />
             <li
               className={styles.stretchDot}
               style={{ top, left: left + width + 2 }}
               onMouseDown={(e) => this.handleMouseDown(e, "top right")}
             />
             <li
               style={{
                 top: top + height / 2,
                 left: left + width + 2,
               }}
               onMouseDown={this.handleMouseDown}
             />
             <li
               className={styles.stretchDot}
               style={{
                 top: top + height + 2,
                 left: left + width + 2,
               }}
               onMouseDown={this.handleMouseDown}
             />
             <li
               className={styles.stretchDot}
               style={{
                 top: top + height + 2,
                 left: left + width / 2,
               }}
               onMouseDown={this.handleMouseDown}
             />
             <li
               className={styles.stretchDot}
               style={{
                 top: top + height + 2,
                 left,
               }}
               onMouseDown={(e) => this.handleMouseDown(e, "bottom left")}
             />
             <li
               className={styles.stretchDot}
               style={{
                 top: top + height / 2,
                 left,
               }}
               onMouseDown={(e) => this.handleMouseDown(e, "left")}
             />
           </ul>
         )}
         {showContextMenu && (
           <ContextMenu
             index={index}
             pos={{ top: style.top - 80, left: style.left + 60 }}
             cmp={cmp}
           />
         )}
       </>
     );
   }
 }
 
 export function getComponent(cmp) {
   const { data } = cmp;
   let res = null;
   switch (data.type) {
     case isTextComponent:
       res = <TextComponent {...data} />;
       break;
     case isButtonComponent:
       res = <ButtonComponent {...data} />;
       break;
     case isImgComponent:
       res = <ImgComponent {...data} />;
       break;
     default:
       res = null;
   }
   return res;
 }
 