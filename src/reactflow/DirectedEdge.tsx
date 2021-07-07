import { FC } from 'react';
import { EdgeProps, getBezierPath, getMarkerEnd } from 'react-flow-renderer';
import { FaTimes } from 'react-icons/fa';
import { Label } from 'semantic-ui-react';

const DirectedEdge: FC<EdgeProps> = ({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  arrowHeadType,
  markerEndId,

}) => {
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  // console.log(data)
  return (
    <>
      <path id={id} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} markerStart={markerEnd} />
      <text>
        <textPath href={`#${id}`} style={{ fontSize: '12px' }} startOffset="50%" textAnchor="middle">
          {data.label}
        </textPath>
      </text>
      <Label className="ui basic label" border-style="double">
        <FaTimes
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => data["onRemove"](source)}
        />


      </Label>
    </>
  );
};

export default DirectedEdge;
