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
export interface delListType {
    id: string,
    isNode: boolean,
}
//helper method to convert list of elements to lists of Dgaph Nodes
export const DgraphNodesToFlowElements = (dgNodes: Array<DgraphNode>, onRemove: (id: string) => void) => {
    let temp = [];
    for (let i = 0; i < dgNodes.length; i++) {
        console.log(dgNodes[i])
        // console.log("data is like: ", { label: dgNodes[i]["ReactFlowElement.data"], "onRemove": onRemove })
        //add node
        const addedNode = {
            id: dgNodes[i]["uid"],
            data: { label: dgNodes[i]["ReactFlowElement.data"], "onRemove": onRemove },
            position: dgNodes[i]["ReactFlowElement.position"],
            type: dgNodes[i]["ReactFlowElement.type"],
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
    console.log(elements)
    let temp: DgraphNode[] = [];
    let tempJson = [];
    for (let ele of elements) {
        let dgNode;
        //add node
        if (isNode(ele)) {
            dgNode = createDgraphNode(ele);
            temp.push(dgNode)
            tempJson.push(JSON.parse(JSON.stringify(dgNode)))
            //add edge
        } else {
            let sourceDg = temp.find((node) => node.uid === (ele as Edge).source)
            let targetDg = temp.find((node) => node.uid === (ele as Edge).target)
            dgNode = createDgraphEdge(sourceDg!, targetDg!)
            temp.push(dgNode)
            tempJson.push(JSON.parse(JSON.stringify(dgNode)))
        }

    }
    console.log(temp)
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
    let id = node.id;
    return ({
        "uid": (id.startsWith("random")) ? "_:" + id : id,
        "ReactFlowElement.data": node["data"]["label"] || node["data"],
        "ReactFlowElement.position": node["position"],
        "ReactFlowElement.type": node.type
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

export const deleteDgraphEdgeById = (edgeSource: string) => {
    return ({
        "uid": edgeSource,
        "ReactFlowElement.connectTo": null
    });
}

//@param: ele: {id: id for a Node or id for the sourceNode of an edge; isNode: whether this element is a node}
export const getDeleteDgraphElementList = (ele: delListType[]) => {
    let temp = []
    for (let i = 0; i < ele.length; i++) {
        let deleteEle = ele[i]
        //if it's a node and exists in db, generated json for deleting a Dgraph Node
        if (deleteEle.isNode && !deleteEle.id.startsWith("random")) {
            temp.push(deleteDgraphElementById(deleteEle.id))
        }
        //if it's an edge, first check if the source will be deleted, or if the source exists in Dgraph 
        //if not, generate json for deleting Dgraph predicate
        else {
            if (deleteEle.id.startsWith("random") || ele.find((el) => el.id === deleteEle.id && el.isNode)) {
                break;
            }
            temp.push(deleteDgraphEdgeById(deleteEle.id))
        }
        // temp.push(deleteEle)
    }
    return temp
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
        "ReactFlowElement.type": null,
    });
}
