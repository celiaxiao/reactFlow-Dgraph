import { Connection, Edge, FlowElement, isNode, Node } from "react-flow-renderer";
import * as dgraph from 'dgraph-js-http'
import { createDgraphEdge, createDgraphNode, DeletableData, deleteDgraphEdge, deleteDgraphElement, deleteDgraphElementById, getDGElementById } from "./typeUtil";
import { destroy, save } from "../model";
//there is a easier way using recurse, but let's hardcode for now
export const query = `{
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

export const queryName = "todos";
//directly create a new node in Dgraph; NOT recommanded
//创建transaction 与 mutation
export const onAdd = async ({ id, data, position }: Node<DeletableData>, txn: dgraph.Txn) => {

  console.log(data)
  //abstraction needed
  const p = JSON.stringify(createDgraphNode({ id: id, data, position }))
  console.log(p)
  await save(txn, JSON.parse(p))
};

//directly delete an element from Dgraph; NOT recommanded
export const onDestroy = async (txn: dgraph.Txn, ele: FlowElement) => {
  let p;
  if (isNode(ele)) {
    p = deleteDgraphElement(ele);
  } else {
    p = deleteDgraphEdge(ele);

  }
  p = JSON.stringify(p)
  console.log(p)
  await destroy(txn, JSON.parse(p))
};

//called when user connects two nodes, directly add edge in Dgraph; NOT recommanded
export const onConnect = async (txn: dgraph.Txn, params: Edge | Connection, elements: FlowElement[]) => {
  let sourceDg = getDGElementById(params.source!, elements)
  let targetDg = getDGElementById(params.target!, elements)
  console.log(sourceDg)
  if (sourceDg && targetDg) {
    const p = JSON.stringify(createDgraphEdge(sourceDg, targetDg));
    await save(txn, JSON.parse(p))
    console.log(elements)
  }
}

//directly remove node from Dgraph by id; NOT recommanded
export const RemoveElementById = async (txn: dgraph.Txn, id: string) => {
  let p = JSON.stringify(deleteDgraphElementById(id))
  console.log("deleteDgraphElementById", p)
  await destroy(txn, JSON.parse(p))

};
