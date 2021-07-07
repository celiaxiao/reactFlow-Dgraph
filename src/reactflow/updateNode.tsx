// import Form from "./add-todo-form";
import AddNode from "./AddNode";
import "./updateNode.css";
import DisplayElements from "./DisplayElements";
import { useEffect, useState } from "react";
import * as dgraph from "dgraph-js-http";
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  Node,
  FlowElement,
  removeElements
} from "react-flow-renderer";
import { DgraphNodesToFlowElements, } from "../Util/typeUtil"
import { fetchTodos, save } from "../model";
import { query, queryName } from "../Util/DqlUtil";
import DirectedEdge from "./DirectedEdge"
import DeletableNode from "./DeletableNode"
import * as customType from "../Util/typeUtil"
const UpdateNode = () => {

  const [elements, setElements] = useState<FlowElement[]>([]);
  //get Dgraph client
  const clientStub = new dgraph.DgraphClientStub("http://127.0.0.1:8080/");
  const Dgraph: dgraph.DgraphClient = new dgraph.DgraphClient(clientStub);
  //load the data for initialization

  const onChanges: any[] = [];

  const inform = () => {
    onChanges.forEach((cb) => cb());
  };

  //helper method, call fetchTodos when web app loaded
  const loadFromDgraph = async () => {
    let txn: dgraph.Txn = Dgraph.newTxn();
    const res = await fetchTodos(txn, query) || { data: "" };
    const ele: customType.DgraphNode[] = res.data[queryName] || []
    console.log(ele);
    // console.log(onElementsRemove)
    // console.log(DgraphNodesToFlowElements(ele, RemoveElementById) as FlowElement[])
    setElements(DgraphNodesToFlowElements(ele, RemoveElementById) as FlowElement[]);
  };

  //first time load from db
  useEffect(() => {
    // const txn = Dgraph.newTxn();
    loadFromDgraph()
  }, []);

  useEffect(() => {
    //Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
    // 冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，
    // 不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。
    // 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
    elements.forEach(Object.freeze);
    Object.freeze(elements);
    inform();
  }, [elements]);

  //method to submit all progess to Dgraph
  const submitToDgraph = async () => {
    const txn = Dgraph.newTxn();
    let p = JSON.stringify(customType.FlowElementsToDgraphNodes(elements))
    await save(txn, JSON.parse(p));
    //reload
    await loadFromDgraph()
  }

  //add a temp element, need submit to Dgraph and received the generated uid
  const onAdd: (ele: Node) => void = (ele: Node) => {
    //random id with timestamp
    const getNodeId = () => `randomnode_${+new Date()}`;
    const newNode = {
      id: getNodeId(),
      data: { label: ele.data, onRemove: RemoveElementById },
      position: {
        x: ele.position.x,
        y: ele.position.y,
      },
      type: 'deletableNode'
    };
    setElements((els) => els.concat(newNode));
  }

  const onConnect = (params: Edge<any> | Connection) => setElements((els) => addEdge(params, els));

  const onElementsRemove = (elementsToRemove: FlowElement[]) => {
    setElements((els) => removeElements(elementsToRemove, els));
  }

  const RemoveElementById = (id: string) => {
    // let eleToRemove = customType.getFlowElementById(id, elements)
    console.log(elements)
    console.log(id)
    console.log()
    setElements(elements.filter((el) => (el.id !== id && (el as Edge).source !== id && (el as Edge).target !== id)));

  }
  const nodeTypes = {
    deletableNode: DeletableNode,
  };
  const edgeTypes = {
    directedEdge: DirectedEdge
  }
  return (
    <div style={{ width: '1000px', height: '700px' }}>
      <ReactFlow
        elements={elements}
        defaultZoom={1.5}
        minZoom={0.2}
        maxZoom={4}
        onConnect={onConnect}
        onElementsRemove={onElementsRemove}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
      >
      </ReactFlow>

      <div className="updatenode__controls">
        <button onClick={submitToDgraph}>Save</button>
        {/* form to show input */}
        <div className="display_node">
          <AddNode onAdd={onAdd} />
          {/* form to show list of node value */}
          {elements.length > 0 ? (
            <DisplayElements elements={elements} onDelete={RemoveElementById} />
          ) : (
            "No Node To Show"
          )}
        </div>

      </div>
    </div>
  );
};

export default UpdateNode;
