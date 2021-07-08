import React, { FC, memo } from 'react';

import { EdgeProps, Handle, NodeProps, Position } from 'react-flow-renderer';
import { FaTimes } from "react-icons/fa";
import { Label } from 'semantic-ui-react';

const DeletableNode: FC<NodeProps> = (props) => {
  const { id, data } = props;
  // console.log(data)
  return (
    <div className="react-flow__node-selectorNode"
      style={{
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "#557"
      }
      }>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <FaTimes
        style={{
          color: "red",
          cursor: "pointer",
          position: "absolute",
          top: "0",
          right: "0",
        }}

        onClick={() => data.onRemove(id, data.currList)}
      />
      <label style={{
        padding: "15px",
        paddingRight: "15px",
        paddingTop: "15px",
        paddingBottom: "15px"
      }}>{data.label}</label>
    </div >

  );
  // console.log(data)

};

export default memo(DeletableNode);
