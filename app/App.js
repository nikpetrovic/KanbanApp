import React from 'react';
import ReactDOM from 'react-dom';
import KanbanContainer from './KanbanContainer';
import KanbanBoard from './KanbanBoard';
import { Router, Route, browserHistory } from 'react-router';
import EditCard from './EditCard';
import NewCard from './NewCard';

let cardsList = [
	{
		id: 1,
		title: "Read the Book",
		description: "I should read the **whole** book",
		color: '#BD8D31',
		status: "in-progress",
		tasks: []
	},
	{
		id: 2,
		title: "Write some code",
		description: "Code along with the samples in the book. The complete source can be found at [github](https://github.com/pro-react)",
		color: '#3A7E28',
		status: "todo",
		tasks: [
			{
				id: 1,
				name: "ContactList Example",
				done: true
			},
			{
				id: 2,
				name: "Kanban Example",
				done: false
			},
			{
				id: 3,
				name: "My own experiments",
				done: false
			}
		]
	}
];

ReactDOM.render((
	<Router history={browserHistory}>
		<Route component={KanbanContainer}>
			<Route path="/" component={KanbanBoard}>
				<Route path="new" component={NewCard} />
				<Route path="edit/:card_id" component={EditCard} />
			</Route>
		</Route>
	</Router>
	), document.getElementById('root'));