//TS type
type Position = {
    x: number,
    y: number
};
export abstract class ReactFlowElement {
    id!: string;
};
enum handlePosition{
    'left',
    'right',
    'top',
    'bottom'
}
export class Node extends ReactFlowElement {
    data?: { label: string };
    position!: Position;
    type?:string;
    style?:{};
    className?:string;
    targetPosition?: handlePosition// default: 'top'
    sourcePosition?: handlePosition //default: 'bottom'
    isHidden?: boolean // if true, the node will not be rendered
    draggable?: boolean //- if option is not set, the node is draggable (overwrites general nodesDraggable option)
    connectable?: boolean //- if option is not set, the node is connectable (overwrites general nodesConnectable option)
    selectable?: boolean //- if option is not set, the node is selectable (overwrites general elementsSelectable option)
}
enum ArrowHeadType {
    "arrow",
    "arrowHead"
}
export class Edge extends ReactFlowElement {
    source!: string;
    target!: string;
    arrowHeadType? : ArrowHeadType
    type?: string;
    animated?: boolean;
    className?:string;
    label?:string;
    labelShowBg?: boolean;
    labelBgStyle?: {}
    labelBgPadding?: [number, number];
    labelBgBorderRadius?: number ;
    markerEndId?: string;
    isHidden?: boolean;
    data?: {} ;
    markerStart?: string;

}
export type DgraphNode = {
    uid: string,
    "ReactFlowElement.data": string,
    "ReactFlowElement.position": Position,
    "ReactFlowElement.connectTo": DgraphNode
}
//helper method to convert object
export const convert = (rfObject: Array<DgraphNode>) => {
    let temp = [];
    for (let i = 0; i < rfObject.length; i++) {
        //add node
        const addedNode = {
            id: rfObject[i]["uid"],
            data: { label: rfObject[i]["ReactFlowElement.data"] },
            position: rfObject[i]["ReactFlowElement.position"],
        };
        temp.push(addedNode);
        //add edge if exists
        if ( rfObject[i]["ReactFlowElement.connectTo"] ) {
            const addedEdge = {
                id:
                    rfObject[i]["uid"] +
                    (rfObject[i]["ReactFlowElement.connectTo"]["uid"]),
                source: rfObject[i]["uid"],
                target: rfObject[i]["ReactFlowElement.connectTo"]["uid"],
                arrowHeadType: "arrow",
                markerStart:"arrow"
            };
            console.log(addedEdge);
            temp.push(addedEdge);
        }
    }
    return temp;
};

//helper method to convert to dgraph data type
export const convertDgraph = (node: ReactFlowElement) => {
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
