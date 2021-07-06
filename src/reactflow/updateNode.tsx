// import Form from "./add-todo-form";
import AddNode from "./AddNode";
import "./updateNode.css";
import DisplayElements from "./DisplayElements";
import { useEffect, useState } from "react";
import * as dgraph from "dgraph-js-http";
import ReactFlow, {
  Connection,
  Edge,
  FlowElement,
  isNode,
  removeElements
} from "react-flow-renderer";
import { convert, createDgraphEdge, createDgraphNode, deleteDgraphElement, deleteDgraphEdge, getDGElementById, deleteDgraphElementById } from "../Util/typeUtil"
import { fetchTodos, save, destroy } from "../model";
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

  //helper method, call fetchTodos 当web app loaded
  const fetchAndInform = async () => {
    let txn: dgraph.Txn = Dgraph.newTxn();
    const res = await fetchTodos(txn, query) || { data: "" };
    const ele: customType.DgraphNode[] = res.data[queryName] || []
    console.log(ele);
    console.log(onRemove)
    setElements(convert(ele, onRemove) as FlowElement[]);
    console.log(convert(ele, onRemove));
  };

  useEffect(() => {
    // const txn = Dgraph.newTxn();
    fetchAndInform()
  }, []);

  useEffect(() => {
    const txn = Dgraph.newTxn();
    //Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
    // 冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，
    // 不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。
    // 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
    elements.forEach(Object.freeze);
    Object.freeze(elements);
    inform();
    return () => {
      txn.discard();
    }
  }, [elements]);


  //create new to-do items in Dgraph
  //创建transaction 与 mutation
  const onAdd = async ({ data, position }: { data: customType.Data, position: customType.Position }) => {

    const txn = Dgraph.newTxn();
    console.log(data)
    //abstraction needed
    const p = JSON.stringify(createDgraphNode({ id: '', data, position }))
    console.log(p)
    await save(txn, JSON.parse(p))

    fetchAndInform();

  };
  ////called when user connects two nodes
  const onConnect = async (params: Edge | Connection) => {
    let sourceDg = getDGElementById(params.source!, elements)
    let targetDg = getDGElementById(params.target!, elements)
    console.log(sourceDg)
    if (sourceDg && targetDg) {
      const txn = Dgraph.newTxn();
      try {
        const p = JSON.stringify(createDgraphEdge(sourceDg, targetDg));
        await save(txn, JSON.parse(p))
        console.log(elements)
      }
      catch (error) {
        console.error("Network error", error);
      } finally {
        fetchAndInform();
      }
    }

  };
  const onRemove = async (id: string) => {
    let p = JSON.stringify(deleteDgraphElementById(id))
    const txn = Dgraph.newTxn();
    console.log("deleteDgraphElementById", p)
    try {

      await destroy(txn, JSON.parse(p))
    } catch (error) {
      alert("Database write failed!");
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };

  const onDestroy = async (ele: FlowElement) => {
    const txn = Dgraph.newTxn();
    try {
      let p;
      if (isNode(ele)) {
        p = deleteDgraphElement(ele);
      } else {
        p = deleteDgraphEdge(ele);

      }
      p = JSON.stringify(p)
      console.log(p)
      await destroy(txn, JSON.parse(p))

    } catch (error) {
      alert("Database write failed!");
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };
  //TODO: implements ReactFlow's on ElemeentsRemove
  const onElementsRemove = (elementsToRemove: FlowElement[]) => { }

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
    </div>
  );
};

export default UpdateNode;
