import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import UpdateNode from './reactflow/updateNode';
import reportWebVitals from './reportWebVitals';





function render() {
  ReactDOM.render(
    // <TodoApp model={model}/>,
    <UpdateNode />,
    document.getElementById('root'),
  )
}

render()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
