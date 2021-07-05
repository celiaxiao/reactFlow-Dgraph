// import Form from "./add-todo-form";
import AddNode from "./AddNode";
import "./updateNode.css";
import DisplayElements from "./DisplayElements";
import { useEffect, useState } from "react";
import * as dgraph from "dgraph-js-http";
import ReactFlow, {
  isNode
} from "react-flow-renderer";
import { convert, createDgraphEdge, createDgraphNode, deleteDgraphElement, deleteDgraphEdge, getRFElementById, deleteDgraphElementById } from "../Util/typeUtil"
import { fetchTodos, save, destroy } from "../model";
import { query, queryName } from "../Util/DqlUtil";
import DirectedEdge from "./DirectedEdge"
import { DeletableNode } from "./DeletableNode"
const UpdateNode = () => {

  const [elements, setElements] = useState([]);
  //get Dgraph client
  const clientStub = new dgraph.DgraphClientStub("http://127.0.0.1:8080/");
  const Dgraph = new dgraph.DgraphClient(clientStub);
  //load the data for initialization
  useEffect(() => {
    const txn = Dgraph.newTxn();
    fetchTodos(txn, query).then((res) => setElements(convert(res.data[queryName])));
  }, []);

  const onChanges = [];

  const inform = () => {
    onChanges.forEach((cb) => cb());
  };

  useEffect(() => {
    const txn = Dgraph.newTxn();
    elements.forEach(Object.freeze);
    Object.freeze(elements);
    inform();
    return () => {
      txn.discard();
    }
  }, [elements]);

  //helper method, call fetchTodos 当web app loaded
  const fetchAndInform = async () => {
    let txn = Dgraph.newTxn();
    const res = await fetchTodos(txn, query);
    const ele = res.data[queryName] || []
    console.log(ele);
    let temp = [];
    console.log(onRemove)
    for (let i = 0; i < ele.length; i++) {
      console.log("data is like: ", { label: ele[i]["ReactFlowElement.data"], "onRemove": onRemove })
      //add node
      const addedNode = {
        id: ele[i]["uid"],
        data: { label: ele[i]["ReactFlowElement.data"], "onRemove": onRemove },
        position: ele[i]["ReactFlowElement.position"],
        type: 'deletableNode',
      };
      temp.push(addedNode);
      //add edge if exists
      if (ele[i]["ReactFlowElement.connectTo"]) {
        const addedEdge = {
          id:
            ele[i]["uid"] +
            (ele[i]["ReactFlowElement.connectTo"]["uid"]),
          source: ele[i]["uid"],
          target: ele[i]["ReactFlowElement.connectTo"]["uid"],
          arrowHeadType: "arrow",
        };
        temp.push(addedEdge);
      }
    }
    setElements(temp)
    //setElements(convert(ele, onRemove));
    //console.log(convert(ele, onRemove));
    //Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
    // 冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，
    // 不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。
    // 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
  };

  //create new to-do items in Dgraph
  //创建transaction 与 mutation
  const onAdd = async ({ data, position }) => {

    const txn = Dgraph.newTxn();
    console.log(data)
    //abstraction needed
    const p = createDgraphNode({ data, position })
    console.log(p)
    await save(txn, p)

    fetchAndInform();

  };
  ////called when user connects two nodes
  const onConnect = async (params) => {
    let sourceDg = getRFElementById(params.source, elements)
    let targetDg = getRFElementById(params.target, elements)
    console.log(sourceDg)
    const txn = Dgraph.newTxn();
    try {
      const p = createDgraphEdge(sourceDg, targetDg);
      await save(txn, p)
      console.log(elements)
    }
    catch (error) {
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };
  const onRemove = async (id) => {
    let p = deleteDgraphElementById(id)
    const txn = Dgraph.newTxn();
    console.log("deleteDgraphElementById", p)
    try {
      await destroy(txn, p)
    } catch (error) {
      alert("Database write failed!");
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };

  const onDestroy = async (ele) => {
    const txn = Dgraph.newTxn();
    try {
      let p;
      if (isNode(ele)) {
        p = deleteDgraphElement(ele);
      } else {
        p = deleteDgraphEdge(ele);

      }
      console.log(p)
      await destroy(txn, p)

    } catch (error) {
      alert("Database write failed!");
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };
  const nodeTypes = {
    deletableNode: DeletableNode,
  };
  return (

    <ReactFlow
      elements={elements}
      defaultZoom={1.5}
      minZoom={0.2}
      maxZoom={4}
      onConnect={onConnect}
      onElementsRemove={onDestroy}
      edgeTypes={DirectedEdge}
      nodeTypes={nodeTypes}
    >
      <div className="updatenode__controls">
        {/* form to show input */}
        <div className="display_node">
          {<AddNode onAdd={onAdd} />}
          {/* form to show list of node value */}
          {elements.length > 0 ? (
            <DisplayElements elements={elements} onDelete={onDestroy} />
          ) : (
            "No Node To Show"
          )}
        </div>
      </div>
    </ReactFlow>

  );
};

export default UpdateNode;
