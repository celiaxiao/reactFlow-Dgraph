import { useEffect, useState } from "react";
import * as dgraph from "dgraph-js-http";
import ReactFlow, {
  updateEdge,
} from "react-flow-renderer";
// import Form from "./add-todo-form";
import AddNode from "./AddNode";
import "./updateNode.css";
import DisplayElements from "./DisplayElements";
import { convert, convertDgraph } from "./Util/typeUtil"
import { fetchTodos, save, destroy } from "./model";
import { query, queryName } from "./Util/DqlUtil"
const UpdateNode = () => {
  //control whether to show add node form

  const [elements, setElements] = useState([]);
  const clientStub = new dgraph.DgraphClientStub("http://localhost:8080");
  const Dgraph = new dgraph.DgraphClient(clientStub);
  //load the data for initialization
  useEffect(() => {
    fetchTodos(query).then((res) => setElements(convert(res.data[queryName])));
  }, []);

  const onChanges = [];

  const inform = () => {
    onChanges.forEach((cb) => cb());
  };
  
  useEffect(() => {
    elements.forEach(Object.freeze);
    Object.freeze(elements);
    inform();
  }, [elements]);

  

  //helper method, call fetchTodos 当web app loaded
  const fetchAndInform = async () => {
    const res = await fetchTodos(query);
    const ele = res.data[queryName] || []
    setElements(convert(ele));
    console.log(convert(ele));
    //Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
    // 冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，
    // 不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。
    // 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
  };

  //create new to-do items in Dgraph
  //创建transaction 与 mutation
  const onAdd = async ({data, position}) => {
    console.log(data)
    try {
      //abstraction needed
      const p = {
        uid: "_:newTodo",
        "ReactFlowElement.data": data,
        "ReactFlowElement.position": position,
        "ReactFlowElement.connectTo": null,
      };
      console.log(p["ReactFlowElement.position"]);
      await save(Dgraph, p)
    }
    catch (error) {
      alert("Database write failed!");
      console.error("Network error", error);
    } finally {
      //reload
      fetchAndInform();
    }
  };
  const onSave = async (params) => {
    let sourceNode = elements.find((el) => el.id === params.source);
    let targetNode = elements.find((el) => el.id === params.target);
    let sourceDg = convertDgraph(sourceNode);
    let targetDg = convertDgraph(targetNode);
    console.log(sourceDg)
    try {
      const p = {
        uid: sourceDg.uid,
        "ReactFlowElement.connectTo": targetDg
      }
     await save(Dgraph, p)
      console.log(elements)
    }
    catch (error) {
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };
  //called when user connects two nodes
  const OnConnect = async (params) => {
    console.log(params);
    await onSave(params);
  };

  const onDestroy = async (ele) => {
    try {
      let p;
      if (ele["source"])  {
         p = {
          uid: ele.source,
          "ReactFlowElement.connectTo": null,
        }
      } else  {
         p = {
          uid: ele.id,
          "ReactFlowElement.data": null,
          "ReactFlowElement.position": null,
          "ReactFlowElement.connectTo":null,
        }
      }
      console.log(p)
      destroy(Dgraph, p)

    } catch (error) {
      alert("Database write failed!");
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };
  //called when the end of an edge gets dragged to another source or target
  const onEdgeUpdate = (oldEdge, newConnection) =>
    setElements((els) => updateEdge(oldEdge, newConnection, els));

  return (
    <ReactFlow
      elements={elements}
      defaultZoom={1.5}
      minZoom={0.2}
      maxZoom={4}
      onEdgeUpdate={onEdgeUpdate}
      onConnect={OnConnect}
      onElementsRemove={onDestroy}
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
