import { Node, Edge, FlowElement, isNode } from "react-flow-renderer";

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
export interface DeletableData {
    label: string;
    onRemove: (id: string) => void;
}

export type DgraphNode = {
    "uid": string,
    "ReactFlowElement.data"?: string,
    "ReactFlowElement.position"?: Position,
    "ReactFlowElement.connectTo"?: DgraphNode,
    "ReactFlowElement.type"?: string,
}

//helper method to convert list of elements to lists of Dgaph Nodes
export const DgraphNodesToFlowElements = (dgNodes: Array<DgraphNode>, onRemove: (id: string) => void) => {
    let temp = [];
    console.log(onRemove)
    for (let i = 0; i < dgNodes.length; i++) {
        console.log(dgNodes[i])
        // console.log("data is like: ", { label: dgNodes[i]["ReactFlowElement.data"], "onRemove": onRemove })
        //add node
        const addedNode = {
            id: dgNodes[i]["uid"],
            data: { label: dgNodes[i]["ReactFlowElement.data"], "onRemove": onRemove },
            position: dgNodes[i]["ReactFlowElement.position"],
            type: 'deletableNode',
        };
        temp.push(addedNode);
        //add edge if exists
        if (dgNodes[i]["ReactFlowElement.connectTo"]) {
            const addedEdge = {
                id:
                    dgNodes[i]["uid"] +
                    (dgNodes[i]["ReactFlowElement.connectTo"]!["uid"]),
                source: dgNodes[i]["uid"],
                target: dgNodes[i]["ReactFlowElement.connectTo"]!["uid"],
                arrowHeadType: "arrow",
                type: 'directedEdge',
                data: { label: 'click to delete', "onRemove": onRemove },
            };
            temp.push(addedEdge);
        }
    }
    console.log(temp)
    return temp;
};
//helper method to convert list of Flowelements to a list of Dgraph Nodes
export const FlowElementsToDgraphNodes = (elements: FlowElement[]) => {
    let temp: any[] = [];
    for (let ele of elements) {
        let dgNode;
        //add node
        if (isNode(ele)) {
            dgNode = createDgraphNode(ele);
            temp.push(dgNode)
            //add edge
        } else {
            let sourceDg = temp.find((node) => node.uid === (ele as Edge).source)
            let targetDg = temp.find((node) => node.uid === (ele as Edge).target)
            dgNode = createDgraphEdge(sourceDg, targetDg)
            temp.push(dgNode)
        }

    }
    return temp;
}
//helper method to convert single Flowelement to a single Dgraph Node
export const FlowElementToDgraph = (node: FlowElement) => {
    console.log(node);
    //add node
    console.log(node.id);
    const addedNode = createDgraphNode(node);

    return addedNode;
};

export const createDgraphNode = (node: FlowElement) => {
    return ({
        "uid": (node["id"].startsWith("random")) ? "_:newTodo" : node["id"],
        "ReactFlowElement.data": node["data"]["label"] || node["data"],
        "ReactFlowElement.position": node["position"],
    });
}

export const getDGElementById = (id: string, elements: FlowElement[]) => {
    let Node = getFlowElementById(id, elements);
    if (Node !== undefined) {
        let Dg = FlowElementToDgraph(Node);
        return Dg;
    }
}
export const getFlowElementById = (id: string, elements: FlowElement[]) => {
    return elements.find((el) => el.id === id);
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
    return deleteDgraphElementById(node.id)
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
