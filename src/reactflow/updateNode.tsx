// import Form from "./add-todo-form";
import AddNode from "./AddNode";
import "./updateNode.css";
import DisplayElements from "./DisplayElements";
import { useCallback, useEffect, useState } from "react";
import * as dgraph from "dgraph-js-http";
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  Node,
  FlowElement,
  removeElements,
  isNode
} from "react-flow-renderer";
import { DgraphNodesToFlowElements, } from "../Util/typeUtil"
import { destroy, fetchTodos, save } from "../model";
import { query, queryName } from "../Util/DqlUtil";
import DirectedEdge from "./DirectedEdge"
import DeletableNode from "./DeletableNode"
import * as customType from "../Util/typeUtil"


const UpdateNode = (props: customType.UpdateNodeProps) => {
  const { elements, setElements, setDelList } = props


  const onConnect = useCallback((params: Edge<any> | Connection) =>
    setElements((els) => addEdge(params, els)), []);

  //@param elementsToRemove: list of elements to be removed
  const onElementsRemove = useCallback((elementsToRemove: FlowElement[]) => {
    //console.log(elementsToRemove)
    for (let element of elementsToRemove) {
      console.log(element)
      //add element to delList, check if deleting element is a node
      if (isNode(element)) {
        setDelList((els) => els.concat({ id: element.id, isNode: true }));
      }
      else {
        setDelList((els) => els.concat({ id: (element as Edge).source, isNode: false }));
      }
    }
    //do the delete
    setElements((els) => removeElements(elementsToRemove, els));
  }, [])



  //TODO: double click to edit
  const onNodeDoubleClick = (event: MouseEvent, node: Node) => {

  }
  const nodeTypes = {
    deletableNode: DeletableNode,
  };
  const edgeTypes = {
    directedEdge: DirectedEdge
  }
  return (
    <div style={{ width: 'auto', height: window.innerHeight }}>
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

      {/* <div className="updatenode__controls">
        <button className='btn btn-block' onClick={submitToDgraph}>Save Layout</button>
        
        <div className="display_node">
          <AddNode onAdd={onAdd} />
          
          {elements.length > 0 ? (
            <DisplayElements elements={elements} onDelete={RemoveElementById} />
          ) : (
            "No Node To Show"
          )}
        </div>

      </div> */}
    </div>
  );
};

export default UpdateNode;
