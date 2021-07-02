import './App.css';
import 'todomvc-app-css/index.css';
import React, { Component } from 'react';
export default class App extends Component {
  render() {
    return (
      <div>
				<header className="header">
					<h1>todos</h1>
					<input
						className="new-todo"
						placeholder="What needs to be done?"
						autoFocus={true}
					/>
				</header>
			</div>
    )
  }
}