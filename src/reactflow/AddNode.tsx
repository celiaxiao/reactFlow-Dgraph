import { useState } from 'react'
import { Node, Edge, FlowElement, isNode } from "react-flow-renderer";
const AddNode = (onAdd: (node: Node) => void) => {


    const [data, setData] = useState('default label')
    const [positionX, setPositionX] = useState(0)
    const [positionY, setPositionY] = useState(0)
    const [nodeType, setNodeType] = useState('deletableNode')

    const onSubmit = (e: any) => {
        e.preventDefault()

        if (!positionX || !positionY || !data) {
            alert('missing one of the following: data or position')
            return
        }
        let position = { x: positionX, y: positionY }
        //give a default id, wait for submission to get Dgraph generated uid
        let newNode: Node = { id: '_newNode', data, position }
        onAdd(newNode)
        setData('default data')
        setPositionX(0)
        setPositionY(0)
        setNodeType('deletableNode')
    }

    return (
        <form className='add-form' onSubmit={onSubmit}>
            <div className='form-control'>

                <label>data</label>
                <input type='text'
                    placeholder='Add data'
                    value={data}
                    onChange={(e) => setData(e.target.value)} />

            </div>
            <div className='form-control'>

                <label>Set position X</label>
                <input type='object'
                    placeholder='Add poitions'
                    value={positionX}
                    onChange={(e) => setPositionX(parseInt(e.currentTarget.value))}
                />

            </div>
            <div className='form-control'>

                <label>Set position Y</label>
                <input type='object'
                    placeholder='Add poitions'
                    value={positionY}
                    onChange={(e) => setPositionY(parseInt(e.currentTarget.value))}
                />

            </div>
            <input type='submit' value='Save Node' className='btn btn-block' />
        </form>
    )
}

export default AddNode