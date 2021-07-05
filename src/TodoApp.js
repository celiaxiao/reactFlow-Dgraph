import { useEffect, useState } from "react";
import * as dgraph from "dgraph-js-http";
import ReactFlow, {
  isNode
} from "react-flow-renderer";
import { convert, createDgraphEdge, createDgraphNode, deleteDgraphElement, deleteDgraphEdge, getRFElementById } from "./Util/typeUtil"
import { fetchTodos, save, destroy } from "./model";
import { query, queryName } from "./Util/DqlUtil";
import UpdateNode from './reactflow/updateNode'

const App = () => {
  const [elements, setElements] = useState([]);
  //get Dgraph client
  const clientStub = new dgraph.DgraphClientStub("http://127.0.0.1:8080/");
  const Dgraph = new dgraph.DgraphClient(clientStub);
  //load the data for initialization
  useEffect(() => {
    fetchTodos(Dgraph, query).then((res) => setElements(convert(res.data[queryName])));
  }, []);

  const onChanges = [];

  const inform = () => {
    onChanges.forEach((cb) => cb());
  };
  
  useEffect(() => {
    elements.forEach(Object.freeze);
    Object.freeze(elements);
    inform();
    return () => {
      Dgraph.logout()
    }
  }, [elements]);

  //helper method, call fetchTodos 当web app loaded
  const fetchAndInform = async () => {
    const res = await fetchTodos(Dgraph, query);
    const ele = res.data[queryName] || []
    console.log("fetchAndInform received data")
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
      const p = createDgraphNode({data,position})
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
  ////called when user connects two nodes
  const onConnect = async (params) => {
    let sourceDg = getRFElementById(params.source, elements)
    let targetDg = getRFElementById(params.target, elements)
    console.log(sourceDg)
    try {
      const p = createDgraphEdge(sourceDg,targetDg);
     await save(Dgraph, p)
      console.log(elements)
    }
    catch (error) {
      console.error("Network error", error);
    } finally {
      fetchAndInform();
    }
  };

  const onDestroy = async (ele) => {
    try {
      let p;
      if (isNode(ele))  {
         p = deleteDgraphEdge(ele); 
      } else  {
         p = deleteDgraphElement(ele);
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
    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          
        </header>
        <UpdateNode
        elements={elements}
        onConnect={onConnect}
        onDestroy={onDestroy}
        onAdd={onAdd}
        />
      </div>
    )
  
}
export default App;