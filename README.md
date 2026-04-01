# work-flow

学习工作流

业务流程模型和符号

基本：云泉代表开始/结束，方块代表任务，菱形代表分支任务。

每一张 bpmn 图，背后其实都是一长串XML格式的代码。

后端工作流引擎直接吃进这段代码，然后根据代码执行业务流程。

---

bpmn 图本质上是一串 xml 代码，我们需要一个工具再网页上把它翻译成图形。

viewer（查看器）：后端传给你 xml，bpmn-js 负责把它在网页上渲染成一张 流程图，走到哪里标红。

modeler（建模器）：它提供了一个画板和左侧工具栏，让你可以在网页上拖拽画图。画完之后， bpmn-js 会帮你把图形自动生成那串 XML 代码。

---

BpmnModeler：

- bpmn-js 的核心建模器 (Modeler)
- 绘图面板
- 左侧工具栏
- 另外还有 Viewer（仅查看）和 NavigatedViewer（支持拖拽缩放的查看器）等模式

---

引入核心样式文件

diagram-js.css 是基础画布和元素的样式

import 'bpmn-js/dist/assets/diagram-js.css';

---

BPMN 2.0 规范中各种图标（如开始节点、任务节点、网关等）的字体图标样式。

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

---

在前端开发中，只要看到 bpmn-js ，通常都需要配套引入这两个 CSS。不引入的话，你的画布或者节点图标就会变成错乱的黑块。

---

bpmn-js 并不是像普通的画板那样“从零创建一个白板”， 它必须先读取一份合法的 XML 数据才能开始工作 。

所以我们需要给一份初始化的 xml 模版字符串代码。

---

实例化与渲染 （核心4步）

```jsx
// 1. 实例化 BPMN Modeler
modelerRef.current = new BpmnModeler({
  container: containerRef.current,
  keyboard: { bindTo: document } // 开启快捷键
});

// 2. 导入 BPMN XML 数据
modelerRef.current.importXML(emptyBpmn).then(() => {
  // 3. 图形渲染成功后的回调
  // 通过 get('模块名') 获取模块，这里获取 canvas 模块来进行自适应缩放
  const canvas = modelerRef.current.get('canvas');
  canvas.zoom('fit-viewport');
});

// 4. 组件卸载时的清理工作
modelerRef.current.destroy();
```

跟用 canvas 类似，但记得用完 destroy 销毁。

---

最后一步：导出XML

```jsx
// 将当前画布上的图形，重新序列化为 bpmn 2.0 格式的 xml 字符串
// 然后打印到控制台查看
const {xml} = modelerRef.current.saveXML({format: true});
console.log(xml);
```

这是前后端交互最核心的一步：

- 前端不管怎么拖拽、画图，最终都是调用 **saveXML()** 把图变成一串 XML 字符串，然后通过 HTTP 请求发送给后端。
- 后端的 工作流引擎（如 flowable） 拿到这段 XML 就能知道流程是怎么走的了。

---