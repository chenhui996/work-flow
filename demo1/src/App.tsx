import { useEffect, useRef } from 'react';
// 引入 bpmn-js 的核心建模器 (Modeler)，它包含了绘图面板和左侧工具栏 (Palette)
// 另外还有 Viewer（仅查看）和 NavigatedViewer（支持拖拽缩放的查看器）等模式
import BpmnModeler from 'bpmn-js/lib/Modeler';
// 引入核心样式文件
// diagram-js.css 是基础画布和元素的样式
import 'bpmn-js/dist/assets/diagram-js.css';
// bpmn.css 包含了 BPMN 2.0 规范中各种图标（如开始节点、任务节点、网关等）的字体图标样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import './App.css';

// 这是一个最基础的、合法的 BPMN 2.0 XML 模板
// 它包含了一个空的流程 (Process) 和一个开始节点 (StartEvent)
// bpmn-js 需要解析这种 XML 格式的数据来生成画布上的图形
const emptyBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

function App() {
  // 用于挂载 bpmn-js 画布的 DOM 容器
  const containerRef = useRef<HTMLDivElement>(null);
  // 保存 BpmnModeler 的实例，方便后续调用 API（如导出、缩放等）
  const modelerRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      // 1. 实例化 BPMN Modeler
      // 将其挂载到我们准备好的 DOM 节点上
      modelerRef.current = new BpmnModeler({
        container: containerRef.current,
        // 绑定键盘事件，开启诸如 Ctrl+Z 撤销、Ctrl+Y 重做等快捷键功能
        keyboard: { bindTo: document }
      });

      // 2. 导入 BPMN XML 数据
      // importXML 是一个异步方法，它会解析 XML 并将其渲染为图形
      modelerRef.current.importXML(emptyBpmn).then(() => {
        // 3. 图形渲染成功后的回调
        // 获取画布 (canvas) 模块，bpmn-js 的功能被拆分成了多个模块，可以通过 get('模块名') 获取
        const canvas = modelerRef.current.get('canvas');
        // 调用画布的 zoom 方法，'fit-viewport' 表示自动缩放和平移以适应当前视口大小
        canvas.zoom('fit-viewport');
      }).catch((err: any) => {
        // 解析或渲染失败时的错误处理
        console.error('BPMN 渲染失败', err);
      });
    }

    // 4. 组件卸载时的清理工作
    // 销毁实例，释放内存，防止内存泄漏
    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
    };
  }, []);

  // 导出 XML 的处理函数
  const handleExport = async () => {
    if (modelerRef.current) {
      try {
        // 调用 saveXML 方法，将当前画布上的图形重新序列化为 BPMN 2.0 标准的 XML 字符串
        // format: true 表示输出格式化（带缩进）的 XML 代码
        const { xml } = await modelerRef.current.saveXML({ format: true });
        
        // 在实际业务中，这个 XML 字符串通常会被发送给后端（如 Java 的 Camunda/Flowable 引擎）进行保存和执行
        // 这里我们简单地用 alert 展示出来
        alert(xml);
      } catch (err) {
        console.error('导出失败', err);
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>BPMN.js Workflow Editor</h1>
        <button onClick={handleExport} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          导出 XML
        </button>
      </header>
      <div className="canvas-container" ref={containerRef}></div>
    </div>
  );
}

export default App;
