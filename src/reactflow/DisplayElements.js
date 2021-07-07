import { isNode } from "react-flow-renderer";
import { FaTimes } from "react-icons/fa";
import { FlowElement } from "react-flow-renderer";
//display single element
const Element = ({ el, onDelete }) => {
  // console.log(el)
  return (
    <div>
      {isNode(el) ? (
        //show node
        <div>
          <h3>
            {el.id}{" "}
            <FaTimes
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => onDelete(el.id)}
            />
          </h3>
          <p>{el.data.label}</p>
          <p>
            {el.position.x}, {el.position.y}
          </p>
        </div>
      ) : (
        // show edge
        <div>
          <h3>
            {el.id}{" "}
            <FaTimes
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => onDelete(el.id)}
            />
          </h3>
          <p>{el.source}</p>
          <p>{el.target}</p>
        </div>
      )}
    </div>
  );
};

//display list of elements
const DisplayElements = ({ elements, onDelete }) => {
  return (
    <>
      {elements.map((el, id) => (
        <Element key={id} el={el} onDelete={onDelete} />
      ))}
    </>
  );
};

export default DisplayElements;
