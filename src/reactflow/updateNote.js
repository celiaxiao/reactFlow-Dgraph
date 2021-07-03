import { useEffect, useState, useCallback } from "react";
import * as dgraph from "dgraph-js-http";
import ReactFlow, {
  removeElements,
  updateEdge,
} from "react-flow-renderer";
// import Form from "./add-todo-form";
import AddNode from "./AddNode";
import "./updateNode.css";
import DisplayElements from "./DisplayElements";

const initialElements = [
  { id: "1", data: { label: "Node 1" }, position: { x: 100, y: 100 } },
  { id: "2", data: { label: "Node 2" }, position: { x: 100, y: 200 } },
  { id: "e1-2", source: "1", target: "2" },
];

const UpdateNode = () => {
  //control whether to show add node form

  const [elements, setElements] = useState([]);
  const clientStub = new dgraph.DgraphClientStub("http://localhost:8080");
  const Dgraph = new dgraph.DgraphClient(clientStub);
  // fetchAndInform()


  const onChanges = [];

  const inform = () => {
    onChanges.forEach((cb) => cb());
  };

  //helper method to convert object
  const convert = (rfObject) => {
    let temp = [];
    for (let i = 0; i < rfObject.length; i++) {
      if (!rfObject[i]["ReactFlowElement.position"]) continue;
      //add node
      const addedNode = {
        id: rfObject[i]["uid"],
        data: { label: rfObject[i]["ReactFlowElement.data"] },
        position: rfObject[i]["ReactFlowElement.position"],
      };
      temp.push(addedNode);
      //add edge if exists
      if (
        rfObject[i]["ReactFlowElement.connectTo"] &&
        rfObject[i]["ReactFlowElement.connectTo"] != undefined
      ) {
        const addedEdge = {
          id:
            rfObject[i]["uid"] +
            (rfObject[i]["ReactFlowElement.connectTo"]["uid"] || ""),
          source: rfObject[i]["uid"],
          target: rfObject[i]["ReactFlowElement.connectTo"]["uid"],
        };
        console.log(addedEdge);
        temp.push(addedEdge);
      }
    }
    return temp;
  };

  //helper method, call fetchTodos 当web app loaded
  const fetchAndInform = async () => {
    const ele = await fetchTodos();

    setElements(convert(ele));
    console.log(convert(ele));
    //Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
    // 冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，
    // 不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。
    // 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
  };

  useEffect(() => {
    elements.forEach(Object.freeze);
    Object.freeze(elements);
    inform();
    //   return () => {
    //       cleanup
    //   }
  }, [elements]);

  //获取dgraph data, there is a easier way using recurse, but let's hardcode for now
  const fetchTodos = async () => {
    const query = `{
    todos(func: has(ReactFlowElement.data))
    {
    uid
    ReactFlowElement.data
    ReactFlowElement.position {
              x
              y
          }
    ReactFlowElement.connectTo {
      uid
      ReactFlowElement.data
      ReactFlowElement.position {
                x
                y
            }
      }
    }
  }`;
    const res = await Dgraph.newTxn().query(query);
    return res.data.todos || [];
  };

  //load the data for initialization
  useEffect(() => {
    fetchTodos().then((elements) => setElements(convert(elements)));
  }, []);

  //helper method to convert single element node to dgraph data type in json
  const toDgraph = ({ data, position }) => {
    const p = {
      uid: "_:newTodo",
      "ReactFlowElement.data": data,
      "ReactFlowElement.position": position,
    };
    return p;
  };
  //create new to-do items in Dgraph
  //创建transaction 与 mutation
  const add_Todo = async ({ data, position }) => {
    try {
      console.log(position.x, position.y);
      const p = {
        uid: "_:newTodo",
        "ReactFlowElement.data": data,
        "ReactFlowElement.position": position,
        "ReactFlowElement.connectTo": null,
      };
      console.log(p["ReactFlowElement.position"]);

      //创建item
      let res = await Dgraph.newTxn().mutate({
        setJson: p,
        //informs Dgraph这个transaction不会再修改data，可以commit了
        //在生产环境/更复杂的操作时一般直接set false或者忽略它，之后手动调用commit()
        commitNow: true,
      });

      console.info("Created new element with id", res.data.uids.newTodo);
    } catch (error) {
      alert("Database write failed!");
      console.error("Network error", error);
    } finally {
      //reload
      fetchAndInform();
    }
  };

  //delet nodes in Dgraph
  const destroy = async (ele) => {
    if (ele["source"]) deleteEle(ele);
    else {
      try {
        console.log(ele);
        await Dgraph.newTxn().mutate({
          deleteJson: {
            uid: ele.id,
            "ReactFlowElement.data": null,
            "ReactFlowElement.position": null,
          },
          commitNow: true,
        });
      } catch (error) {
        alert("Database write failed!");
        console.error("Network error", error);
      } finally {
        fetchAndInform();
      }
    }
  };

  //reactflow offical remove
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));

  const deleteEle = async (ele) => {
    try {
      console.log(ele);
      await Dgraph.newTxn().mutate({
        deleteJson: {
          uid: ele.source,
          "ReactFlowElement.connectTo": null,
        },
        commitNow: true,
      });

      await Dgraph.newTxn().mutate({
        deleteJson: {
          uid: ele.target,
          "ReactFlowElement.connectTo": null,
        },
        commitNow: true,
      });
    } catch (error) {
      alert("Database write failed!");
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };

  // //add edge
  // const delEdge = (id) => {
  //   setElements(elements.filter((el) => el.id != id));
  // }

  //called when user connects two nodes
  const onConnect = (params) => {
    console.log(params);
    save(params);
  };
  //called when the end of an edge gets dragged to another source or target
  const onEdgeUpdate = (oldEdge, newConnection) =>
    setElements((els) => updateEdge(oldEdge, newConnection, els));

  //helper method to convert to dgraph data type
  const convertDgraph = (node) => {
    console.log(node);
    //add node
    console.log(node.id);
    const addedNode = {
      uid: node["id"],
      "ReactFlowElement.data": node["data"]["label"],
      "ReactFlowElement.position": node["position"],
    };

    return addedNode;
  };
  //通过另一个transaction修改一个node
  const save = async (params) => {
    try {
      //get source node and target node
      let sourceNode = elements.find((el) => el.id === params.source);
      let targetNode = elements.find((el) => el.id === params.target);
      let sourceDg = convertDgraph(sourceNode);
      let targetDg = convertDgraph(targetNode);
      console.log(sourceDg);
      await Dgraph.newTxn().mutate({
        setJson: {
          uid: sourceDg.uid,
          //Dgraph update无需pass整个object，返回最新的title，其它的predicates值不变
          "ReactFlowElement.connectTo": targetDg,
        },
        commitNow: true,
      });

      await Dgraph.newTxn().mutate({
        setJson: {
          uid: targetDg.uid,
          //Dgraph update无需pass整个object，返回最新的title，其它的predicates值不变
          "ReactFlowElement.connectTo": sourceDg,
        },
        commitNow: true,
      });
    } catch (error) {
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };

  return (
    <ReactFlow
      elements={elements}
      defaultZoom={1.5}
      minZoom={0.2}
      maxZoom={4}
      onEdgeUpdate={onEdgeUpdate}
      onConnect={onConnect}
      onElementsRemove={destroy}
    >
      <div className="updatenode__controls">
        {/* form to show input */}
        <div className="display_node">
          {<AddNode onAdd={add_Todo} />}
          {/* form to show list of node value */}
          {elements.length > 0 ? (
            <DisplayElements elements={elements} onDelete={destroy} />
          ) : (
            "No Node To Show"
          )}
        </div>
      </div>
    </ReactFlow>
  );
};

export default UpdateNode;
