import React, { Component } from 'react';
import KanbanBoard from './KanbanBoard';
import 'babel-polyfill';
import update from 'react-addons-update';
import 'whatwg-fetch';

const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'any-string-you-like'
};

class KanbanContainer extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            cards: []
        };
    }
    
    addTask(cardId, taskName) {
        let prevState = this.state;
        
        let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);
        let newTask = {id: Date.now(), name: taskName, done: false};
        let nextState = update(this.state.cards, {[cardIndex]: {tasks: {$push: [newTask]}}});
        this.setState({cards: nextState});
        
        fetch('${API_URL}/cards/${cardId}/tasks', {
            method: 'post',
            body: JSON.stringify(newTask)
        }).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Server response wasn't OK.");
            }
        }).then((responseData) => {
            newTask.id = responseData.id;
            this.setState({cards: nextState});
        }).catch((error) => {
            this.setState(prevState);
        });
    }
    
    deleteTask(cardId, taskId, taskIndex) {
        let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);
        let nextState = update(this.state.cards, {[cardIndex]: {tasks: {$splice: [[taskIndex, 1]]}}});
        this.setState({cards: nextState});
        
        fetch('${API_URL}/cards/${cardId}/tasks', {
            method: 'delete'
        });
    }
    
    toggleTask(cardId, taskId, taskIndex) {
        let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);
        let newDoneValue;
        let nextState = update(this.state.cards, {
            [cardIndex]: {
                tasks: {
                    [taskIndex]: {$apply: (done) => {
                        newDoneValue = !done
                        return newDoneValue;
                        }
                    }
                }
            }
        });
        this.setState({cards: nextState});
        
        fetch('${API_URL}/cards/${cardId}/tasks/${taskId}', {
            method: 'put',
            body: JSON.stringify()
        });
    }
    
    render() {
        return <KanbanBoard cards={this.state.cards} taskCallbacks={{
            add: this.addTask.bind(this), 
            delete: this.deleteTask.bind(this), 
            toggle: this.toggleTask.bind(this)
        }} />
    }
    
    componentDidMount() {
        fetch(API_URL + '/cards')
            .then((response) => response.json())
            .then((responseData) => this.setState({cards: responseData}))
            .catch((error) => console.log('Error fetching and parsing data.'));
    }
};

export default KanbanContainer;