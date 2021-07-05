//there is a easier way using recurse, but let's hardcode for now
   export const query = `{
        todos(func: has(ReactFlowElement.data))
        {
        uid
        ReactFlowElement.data
        ReactFlowElement.position {
                  x
                  y
              }
        ReactFlowElement.connectTo {
          uid
          ReactFlowElement.data
          ReactFlowElement.position {
                    x
                    y
                }
          }
        }
      }`;
      
  export const queryName = "todos";

