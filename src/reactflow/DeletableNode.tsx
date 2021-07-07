import React, { FC, memo } from 'react';

import { EdgeProps, Handle, NodeProps, Position } from 'react-flow-renderer';
import { FaTimes } from "react-icons/fa";
import { Label } from 'semantic-ui-react';

const DeletableNode: FC<NodeProps> = (props) => {
  const { id, data } = props;

  return (
    <div style={{ borderStyle: "solid", borderWidth: "1px" }
    }>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <Label className="ui basic label" borderstyle="double" >

        {data.label}
        < FaTimes
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => data["onRemove"](id)}
        />
      </Label>
    </div >

  );
  // console.log(data)

};

export default memo(DeletableNode);
