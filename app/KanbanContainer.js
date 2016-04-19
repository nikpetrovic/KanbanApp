import React, { Component } from 'react';
import KanbanBoard from './KanbanBoard';
import 'babel-polyfill';
import update from 'react-addons-update';
import 'whatwg-fetch';
import { throttle } from './throttle.js';

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

        this.updateCardStatus = throttle(this.updateCardStatus.bind(this));
        this.updateCardPosition = throttle(this.updateCardPosition.bind(this), 500);
    }

    updateCardStatus(cardId, listId) {
        let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
        let card = this.state.cards[cardIndex];
        if(card.status !== listId) {
            this.setState(
                update(this.state, {
                    cards: {
                        [cardIndex]: {
                            status: {$set: listId}
                        }
                    }
                })
            );
        }
    }

    updateCardPosition(cardId, afterId) {
        if(cardId !== afterId) {
            let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
            let card = this.state.cards[cardIndex];
            let afterIndex = this.state.cards.findIndex((card) => card.id == afterId);

            this.setState(
                update(this.state, {
                    cards: {
                        $splice: [
                            [cardIndex, 1],
                            [afterIndex, 0, card]
                        ]
                    }
                })
            );
        }
    }
    
    addTask(cardId, taskName) {
        let prevState = this.state;
        
        let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);
        let newTask = {id: Date.now(), name: taskName, done: false};
        let nextState = update(this.state.cards, {[cardIndex]: {tasks: {$push: [newTask]}}});
        this.setState({cards: nextState});
        
        fetch(`${API_URL}/cards/${cardId}/tasks`, {
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
        
        fetch(`${API_URL}/cards/${cardId}/tasks`, {
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
        
        fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
            method: 'put',
            body: JSON.stringify()
        });
    }

    addCard() {
        let prevState = this.state;
        if(card.id === null) {
            let card = Object.assign({}, card, {id: Data.now()});
        }

        let nextState = update(this.state.cards, {
            $push: {card}
        });

        this.setState({cards: nextState});

        // Call the API to add the card on the server
        fetch(`${API_URL}/cards`, {
            method: 'post',
            headers: API_HEADERS,
            body: JSON.stringify(card)
        })
        .then((response) => { 
            if (response.ok) {
                return response.json() 
            } else {
                // Throw an error if server response wasn't 'ok' // so we can revert back the optimistic changes // made to the UI.
                throw new Error("Server response wasn't OK")
            } 
        })
        .then((responseData) => {
            // When the server returns the definitive ID
            // used for the new Card on the server, update it on React card.id=responseData.id
            this.setState({cards:nextState});
        })
        .catch((error) => {
            this.setState(prevState); 
        });
    }

    updateCard(card) {
        // Keep a reference to the original state prior to the mutations // in case we need to revert the optimistic changes in the UI let prevState = this.state;
        // Find the index of the card
        let cardIndex = this.state.cards.findIndex((c) => c.id == card.id);
        // Using the $set command, we will change the whole card 
        let nextState = update(this.state.cards, { 
            [cardIndex]: { $set: card }
        });
          // set the component state to the mutated object
        this.setState({cards:nextState});
        // Call the API to update the card on the server
        fetch(`${API_URL}/cards/${card.id}`, {
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify(card)
        })
        .then((response) => {
            if (!response.ok) {
                // Throw an error if server response wasn't 'ok' // so we can revert back the optimistic changes // made to the UI.
                throw new Error("Server response wasn't OK")
            }
        })
        .catch((error) => {
            console.error("Fetch error:",error)
            this.setState(prevState); 
        });
    }
    
    render() {
        let kanbanBoard = this.props.children && React.cloneElement(this.props.children, {
            cards: this.state.cards,
            taskCallbacks: {
                add: this.addTask.bind(this), 
                delete: this.deleteTask.bind(this), 
                toggle: this.toggleTask.bind(this)
            },
            cardCallbacks: {
                updateStatus: this.updateCardStatus, 
                updatePosition: this.updateCardPosition,
                addCard: this.addCard.bind(this),
                updateCard: this.updateCard.bind(this)
            }
        });

        return kanbanBoard;
    }
    
    componentDidMount() {
        fetch(`${API_URL}/cards`)
            .then((response) => response.json())
            .then((responseData) => this.setState({cards: responseData}))
            .catch((error) => console.log('Error fetching and parsing data. => ' + error));
    }
};

export default KanbanContainer;