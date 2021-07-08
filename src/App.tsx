import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'antd';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import type { ProSettings } from '@ant-design/pro-layout';
import ProLayout, { PageContainer, SettingDrawer } from '@ant-design/pro-layout';
import defaultProps from './defaultProps';
import UpdateNode from './reactflow/updateNode';
import * as dgraph from "dgraph-js-http";
import { AddForm } from './addForm';
import { fetchTodos, destroy, save } from './model';
import { query, queryName } from './Util/DqlUtil';
import { DgraphNodesToFlowElements } from './Util/typeUtil';
import * as customType from "./Util/typeUtil"
import ReactFlow, {
	Edge,
	Node,
	FlowElement,
} from "react-flow-renderer";



export default () => {
	const [settings, setSetting] = useState<Partial<ProSettings> | undefined>({ fixSiderbar: true });
	const [pathname, setPathname] = useState('/welcome');

	const [elements, setElements] = useState<FlowElement[]>([]);
	//store list of id of deleted nodes
	const [delList, setDelList] = useState<customType.delListType[]>([])
	//get Dgraph client
	const clientStub = new dgraph.DgraphClientStub("http://127.0.0.1:8080/");
	const Dgraph: dgraph.DgraphClient = new dgraph.DgraphClient(clientStub);
	//load the data for initialization

	const onChanges: any[] = [];

	const inform = () => {
		onChanges.forEach((cb) => cb());
	};

	//helper method, call fetchTodos when web app loaded
	const loadFromDgraph = async () => {
		let txn: dgraph.Txn = Dgraph.newTxn();
		const res = await fetchTodos(txn, query) || { data: "" };
		const ele: customType.DgraphNode[] = res.data[queryName] || []
		console.log(ele);
		// console.log(onElementsRemove)
		// console.log(DgraphNodesToFlowElements(ele, RemoveElementById) as FlowElement[])
		setElements(DgraphNodesToFlowElements(ele, RemoveElementById) as FlowElement[]);
	};

	//first time load from db
	useEffect(() => {
		// const txn = Dgraph.newTxn();
		loadFromDgraph()
	}, []);

	useEffect(() => {
		//Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
		// 冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，
		// 不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。
		// 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
		elements.forEach(Object.freeze);
		Object.freeze(elements);
		inform();
	}, [elements]);

	//method to submit all progess to Dgraph
	const submitToDgraph = async () => {
		let txn = Dgraph.newTxn();
		console.log(delList)
		// convert the delete list to json object
		let p = JSON.stringify(customType.getDeleteDgraphElementList(delList as customType.delListType[]))
		console.log(p)
		await destroy(txn, JSON.parse(p))
		//reset delList
		setDelList([])
		txn = Dgraph.newTxn();
		let pString = customType.FlowElementsToDgraphNodes(elements)
		//add new nodes
		await save(txn, pString);
		//delete existing nodes

		//reload
		await loadFromDgraph()
	}

	//add a temp element, need submit to Dgraph and received the generated uid
	const onAdd: (ele: Node) => void = useCallback((ele: Node) => {
		//random id with timestamp
		const getNodeId = () => `randomnode_${+new Date()}`;
		const newNode = {
			id: getNodeId(),
			data: { label: ele.data, onRemove: RemoveElementById },
			position: {
				x: ele.position.x,
				y: ele.position.y,
			},
			type: ele.type
		};
		setElements((els) => els.concat(newNode));
	}, [elements])

	//helper method for a node to delete itself
	const RemoveElementById = useCallback((id: string) => {
		console.log(id)
		//if the element is already stored in database
		if (!id.startsWith("random")) {
			//add to delList, for now, this method could only be called by a node
			setDelList((els) => els.concat({ id: id, isNode: true }));
		}
		// console.log(elements)
		//delete the node and all edges connecting to it
		setElements((els) => els.filter((el) => (el.id !== id && (el as Edge).source !== id && (el as Edge).target !== id)));
	}, [])

	const content = (
		<div><AddForm onAdd={onAdd} />

		</div>

	);

	return (
		<div
			id="test-pro-layout"
			style={{
				height: '70vh',
			}}
		>
			<ProLayout
				{...defaultProps}
				location={{
					pathname,
				}}

				onMenuHeaderClick={(e) => console.log(e)}
				menuItemRender={(item, dom) => (
					<a
						onClick={() => {
							setPathname(item.path || '/welcome');
						}}
					>
						{dom}
					</a>
				)}
			>
				<PageContainer
					content={content}
					tabList={[
						{
							tab: 'ReactFlow Displayment',
							key: 'base',
						}
					]}

					footer={[
						<Button key="3" onClick={loadFromDgraph}>Reset</Button>,
						<Button key="2" type="primary" onClick={submitToDgraph}>
							Save
						</Button>,
					]}
				>

					<div
					>
						<UpdateNode elements={elements} setElements={setElements} delList={delList} setDelList={setDelList} />
					</div>
				</PageContainer>
			</ProLayout>

		</div>
	);
};