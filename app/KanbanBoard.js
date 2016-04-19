import React, { Component, PropTypes } from 'react';
import List from './List';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import { Link } from 'react-router';

class KanbanBoard extends Component {
  render() {
    let cardModal = this.props.children && React.cloneElement(this.props.children, {
      cards: this.props.cards,
      cardCallbacks: this.props.cardCallbacks
    });

    return (
    	<div className="app">
        <Link to="/new" className="float-button">+</Link>

    		<List id='todo' title="To Do" cards={this.props.cards.filter((card) => card.status === 'todo')} taskCallbacks={this.props.taskCallbacks} cardCallbacks={this.props.cardCallbacks} />

    		<List id='in-progress' title="In Progress" cards={this.props.cards.filter((card) => card.status == 'in-progress')} taskCallbacks={this.props.taskCallbacks} cardCallbacks={this.props.cardCallbacks} />

    		<List id='done' title="Done" cards={this.props.cards.filter((card) => card.status === 'done')} taskCallbacks={this.props.taskCallbacks} cardCallbacks={this.props.cardCallbacks} />

        {cardModal}
      </div>
    );
  }
}

KanbanBoard.propTypes = {
	cards: PropTypes.arrayOf(PropTypes.object),
  taskCallbacks: PropTypes.object
};

export default DragDropContext(HTML5Backend)(KanbanBoard);