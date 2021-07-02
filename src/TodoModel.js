
import * as dgraph from 'dgraph-js-http'
export default class TodoModel {
  constructor() {
    
	const clientStub = new dgraph.DgraphClientStub("http://localhost:8080")
   this.dgraph = new dgraph.DgraphClient(clientStub)
   	this.todos = []
    this.fetchAndInform()

  }

	onChanges = []

	subscribe = onChange =>
		this.onChanges.push(onChange)

	inform = () => {
		
		this.onChanges.forEach(cb => cb())
	}

	addTodo = ({id,data,position}) => {
		this.todos = this.todos.concat({
			uid: id,
			data: data,
			position: position,
		})

		this.inform()
	}

	//helper method, call fetchTodos 当web app loaded
	async fetchAndInform() {
		this.todos = await this.fetchTodos()
		//Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
		// 冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，
		// 不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。
		// 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
		this.todos.forEach(Object.freeze)
    	Object.freeze(this.todos)
		this.inform()
	  }
	//获取dgraph data
	async fetchTodos() {
		const query = `{
		  todos(func: has(ReactFlowElement.data))
		  {
			uid
			ReactFlowElement.data
			ReactFlowElement.position
		  }
		}`
		const res = await this.dgraph.newTxn().query(query)
		return res.data.todos || []
	  }

	  //create new to-do items in Dgraph
	  //创建transaction 与 mutation
	 add_Todo = async({id,data,position}) => {
		try {
			//创建item
		  const res = await this.dgraph.newTxn().mutate({
			setJson: {
			//alias, uid of a node is refered to uid.newTodo; auto-increment
			  uid: "_:newTodo",
			  data,
			  position,
			},
			//informs Dgraph这个transaction不会再修改data，可以commit了
			//在生产环境/更复杂的操作时一般直接set false或者忽略它，之后手动调用commit()
			commitNow: true,
		  })
	
		  console.info('Created new to-do with uid', res.data.uids.newTodo)
		} catch (error) {
		  alert('Database write failed!')
		  console.error('Network error', error)
		} finally {
			//reload
		  this.fetchAndInform()
		}
	  }
	  //delet nodes in Dgraph
	async destroy(todo) {
		try {
		  await this.dgraph.newTxn().mutate({
			deleteJson: {
			  uid: todo.uid,
			  is_todo: null,
  			  completed: null
			},
			commitNow: true,
		  })
		} catch (error) {
		  alert('Database write failed!')
		  console.error('Network error', error)
		} finally {
		  this.fetchAndInform()
		}
	}


	//通过另一个transaction修改一个node
	async save(todoToSave, newTitle) {
		try {
		  await this.dgraph.newTxn().mutate({
			setJson: {
			  uid: todoToSave.uid,
			  //Dgraph update无需pass整个object，返回最新的title，其它的predicates值不变
			  title: newTitle,
			},
			commitNow: true,
		  })
		} catch (error) {
		  console.error('Network error', error)
		} finally {
		  this.fetchAndInform()
		}
	}
	
}