import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import TodoApp from './TodoApp';
import TodoModel from './TodoModel';
import UpdateNode from './reactflow/updateNote';

const model = new TodoModel()

function render() {
  ReactDOM.render(
    // <TodoApp model={model}/>,
    <UpdateNode model={model}/>,
    document.getElementById('root'),
  )
}

model.subscribe(render)
render()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
