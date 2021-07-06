import { Node, Edge, FlowElement } from "react-flow-renderer";

//TS type
export type Position = {
    x: number,
    y: number
};

enum handlePosition {
    'left',
    'right',
    'top',
    'bottom'
}
export interface Data {
    label: string;
    onRemove: (id: string) => void;
}

export type DgraphNode = {
    "uid": string,
    "ReactFlowElement.data"?: string,
    "ReactFlowElement.position"?: Position,
    "ReactFlowElement.connectTo"?: DgraphNode
}
//helper method to convert object
export const convert = (rfObject: Array<DgraphNode>, onRemove: (id: string) => Promise<void>) => {
    let temp = [];
    console.log(onRemove)
    for (let i = 0; i < rfObject.length; i++) {
        console.log("data is like: ", { label: rfObject[i]["ReactFlowElement.data"], "onRemove": onRemove })
        //add node
        const addedNode = {
            id: rfObject[i]["uid"],
            data: { label: rfObject[i]["ReactFlowElement.data"], "onRemove": onRemove },
            position: rfObject[i]["ReactFlowElement.position"],
            type: 'deletableNode',
        };
        temp.push(addedNode);
        //add edge if exists
        if (rfObject[i]["ReactFlowElement.connectTo"]) {
            const addedEdge = {
                id:
                    rfObject[i]["uid"] +
                    (rfObject[i]["ReactFlowElement.connectTo"]!["uid"]),
                source: rfObject[i]["uid"],
                target: rfObject[i]["ReactFlowElement.connectTo"]!["uid"],
                arrowHeadType: "arrow",
                type: 'directedEdge',
                data: { label: 'click to delete', "onRemove": onRemove },
            };
            temp.push(addedEdge);
        }
    }
    return temp;
};

//helper method to convert to dgraph data type
export const convertDgraph = (node: FlowElement) => {
    console.log(node);
    //add node
    console.log(node.id);
    const addedNode = createDgraphNode(node);

    return addedNode;
};

export const createDgraphNode = (node: FlowElement) => {
    return ({
        "uid": node["id"] || "_:newTodo",
        "ReactFlowElement.data": node["data"]["label"] || node["data"],
        "ReactFlowElement.position": node["position"],
    });
}

export const getDGElementById = (id: string, elements: FlowElement[]) => {
    let Node = elements.find((el) => el.id === id);
    if (Node !== undefined) {
        let Dg = convertDgraph(Node);
        return Dg;
    }
}

export const createDgraphEdge = (source: DgraphNode, target: DgraphNode) => {
    return ({
        "uid": source.uid,
        "ReactFlowElement.connectTo": target
    })
}

export const deleteDgraphEdge = (edge: Edge) => {
    console.log(edge)
    return ({
        "uid": edge.source,
        "ReactFlowElement.connectTo": null
    });
}

export const deleteDgraphElement = (node: Node) => {
    console.log(node)
    return ({
        "uid": node.id,
        "ReactFlowElement.data": null,
        "ReactFlowElement.position": null,
        "ReactFlowElement.connectTo": null,
    });
}

export const deleteDgraphElementById = (id: string) => {
    //console.log(node)
    return ({
        "uid": id,
        "ReactFlowElement.data": null,
        "ReactFlowElement.position": null,
        "ReactFlowElement.connectTo": null,
    });
}
