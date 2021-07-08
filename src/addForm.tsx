import ProForm, { ProFormDateRangePicker, ProFormSelect, ProFormDigit, ProFormText } from "@ant-design/pro-form";
import { message } from "antd";
import { AddNodeProps, NodeTypeList } from "./Util/typeUtil";
import { Node } from 'react-flow-renderer'
export const AddForm = (props: AddNodeProps) => {

    // console.log(NodeTypeList)
    return (
        <ProForm<{}>
            onFinish={async (values: any) => {
                //get in info for new Node
                let position = { x: values.positionX, y: values.positionY }
                let data = values.dataLabel
                let type = values.type
                let newNode: Node = { id: '_newNode', data, position, type }
                //add to list
                props.onAdd(newNode)
                console.log(values);
                message.success('success');
            }}
            params={{}}
            request={async () => {

                return {
                    dataLabel: 'default data',
                };
            }}
            onValuesChange={(changedValues, values) => {

                // console.log("changed value", changedValues)
                // console.log("value", values)
            }}
        >
            <ProFormText
                width="sm"
                name="dataLabel"
                label="data"
            />
            <ProForm.Group>
                <ProFormDigit
                    name="positionX"
                    width="md"
                    label="Set position X"
                    placeholder="0-1000"
                    min={0}
                    initialValue={0}
                />
                <ProFormDigit
                    width="md"
                    name="positionY"
                    label="Set position Y"
                    placeholder="0-500"
                    min={0}
                    initialValue={0}
                />
            </ProForm.Group>

            <ProFormSelect
                width="md"
                valueEnum={NodeTypeList}
                name="type"
                label="Select a Node type"
                initialValue='deletableNode'
            />

        </ProForm>
    );

}