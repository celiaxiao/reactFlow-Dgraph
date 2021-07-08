// this is the model for CRUD data to Dgraph
import * as dgraph from "dgraph-js-http";

//获取dgraph data
export const fetchTodos = async (txn: dgraph.Txn, query: string) => {
  //console.log(query)
  try {
    const res = await txn.query(query);
    console.log(res)
    return res;
  } catch (error) {
    alert("Database write failed!");
    console.error("Network error", error);
  } finally {
    await txn.discard();
  }
};


//delete
export const destroy = async (txn: dgraph.Txn, jsonObj: JSON) => {
  try {
    await txn.mutate({
      deleteJson: jsonObj,
      commitNow: true,
    });
  } catch (error) {
    alert("Database write failed!");
    console.error("Network error", error);
  } finally {
    await txn.discard();
  }


};

//update
export const save = async (txn: dgraph.Txn, jsonObj: any) => {
  try {
    console.log(jsonObj)
    await txn.mutate({
      setJson: jsonObj,
      commitNow: true,
    });
  } catch (error) {
    alert("Database write failed!");
    console.error("Network error", error);
  } finally {
    await txn.discard();
  }

};