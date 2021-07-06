import { memo } from 'react';

import { Handle, Position } from 'react-flow-renderer';
import { FaTimes } from "react-icons/fa";
import { Label } from 'semantic-ui-react';

export const DeletableNode = ({ id, data }) => {
  // console.log(data)
  return (
    <div style={{ borderStyle: "solid", borderWidth: "1px" }}>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <Label className="ui basic label" border-style="double">

        {data.label}
        <FaTimes
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => data["onRemove"](id)}
        />
      </Label>
    </div>
  );
};

export default memo(DeletableNode);
