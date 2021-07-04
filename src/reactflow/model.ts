// this is the model for CRUD data to Dgraph
import * as dgraph from "dgraph-js-http";


const clientStub = new dgraph.DgraphClientStub("http://localhost:8080");
const Dgraph = new dgraph.DgraphClient(clientStub);





//获取dgraph data
export const fetchTodos = async (query: string ) => {
  console.log(query)
  const res = await Dgraph.newTxn().query(query);
  console.log(res)
  return res;
};


//delete
export const destroy = async (Dgraph: dgraph.DgraphClient, jsonObj: JSON) => {

  await Dgraph.newTxn().mutate({
    deleteJson: jsonObj,
    commitNow: true,
  });


};

//update
export const save = async (Dgraph: dgraph.DgraphClient, jsonObj: JSON) => {
  console.log(jsonObj)
  await Dgraph.newTxn().mutate({
    setJson: jsonObj,
    commitNow: true,
  });

};