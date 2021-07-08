// import Form from "./add-todo-form";
import "./updateNode.css";
import { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  Node,
  FlowElement,
  removeElements,
  isNode,
  MiniMap,
  Background,
  BackgroundVariant,
  OnLoadParams,
  Controls
} from "react-flow-renderer";
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
  const nodeStrokeColor = (n: Node): string => {
    if (n.style?.background) return n.style.background as string;
    if (n.type === 'input') return '#0041d0';
    if (n.type === 'output') return '#ff0072';
    if (n.type === 'default') return '#1a192b';

    return '#eee';
  };

  const nodeColor = (n: Node): string => {
    if (n.style?.background) return n.style.background as string;

    return '#fff';
  };

  return (
    <div style={{ width: 'auto', height: window.outerHeight }}>
      <ReactFlow
        elements={elements}
        defaultZoom={1.5}
        minZoom={0.2}
        maxZoom={4}

        zoomOnDoubleClick={false}
        onConnect={onConnect}
        onElementsRemove={onElementsRemove}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
      >
        {/* <MiniMap nodeStrokeColor={nodeStrokeColor} nodeColor={nodeColor} nodeBorderRadius={2} />
        <Controls />
        <Background color="#aaa" gap={20} /> */}
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
