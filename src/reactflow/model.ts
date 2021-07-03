// this is the model for CRUD data to Dgraph
import * as dgraph from "dgraph-js-http";

//TS type
  interface Position {
    x: number,
    y: number
  }
  interface Element {
    id : string,
    data?: {label:string},
    position?: Position
    source? :string,
    target?: string
  }
  interface DgNode {
    uid: string,
    "ReactFlowElement.data": string,
    "ReactFlowElement.position": Position,
    "ReactFlowElement.connectTo"?: DgNode
  }
const NodeModel = ({elements, setElement })  => {
    
}

export default NodeModel