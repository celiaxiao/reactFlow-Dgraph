import React, { memo, FC, CSSProperties } from 'react';

import { NodeComponentProps, Connection, Handle, Position } from 'react-flow-renderer';
import { destroy } from '../model';
import { FaTimes } from "react-icons/fa";
import { Label } from 'semantic-ui-react';

export const DeletableNode = ({ id, data }) => {
  console.log(data)
  return (
    <>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <Label className="ui basic label" border-style="double">

        {data.label}
        <FaTimes
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => data["onRemove"](id)}
        />
      </Label>
    </>
  );
};

export default memo(DeletableNode);
