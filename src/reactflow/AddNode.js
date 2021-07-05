import { useState } from 'react'
const AddNode = ({ onAdd }) => {


    const [data, setData] = useState('default label')
    const [positionX, setPositionX] = useState(0)
    const [positionY, setPositionY] = useState(0)

    const onSubmit = (e) => {
        e.preventDefault()

        //   if(!nodeId || !position || !data) {
        //       alert('missing one of the following: id, data, or position')
        //       return
        //   }
        let position = { x: positionX, y: positionY }
        //position = {x: positionX, y: positionY}
        onAdd({ data, position })


        setData('default data')
        setPositionX(0)
        setPositionY(0)
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
                    onChange={(e) => setPositionX(e.currentTarget.value)}
                />

            </div>

            <div className='form-control'>

                <label>Set position Y</label>
                <input type='object'
                    placeholder='Add poitions'
                    value={positionY}
                    onChange={(e) => setPositionY(e.currentTarget.value)}
                />

            </div>

            <input type='submit' value='Save Node' className='btn btn-block' />
        </form>



    )
}

export default AddNode