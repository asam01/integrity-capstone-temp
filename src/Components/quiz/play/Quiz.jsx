import React, { Component } from 'react';
import {fire} from '../../../firebase.js';


class Quiz extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.saveAnswer = this.saveAnswer.bind(this);
    }

    saveAnswer(answer) {
        let that = this;
        let currentQuestionId = this.props.game.quiz.questions[this.props.game.quiz.currentQuestion].id;
        fire.database().ref('/Rooms/' + that.props.game.key + '/players/' + this.props.playerKey + '/answers/' + currentQuestionId).set(answer, function(error) {
            var x = 1+1;
        }
        );
    }

    render() {
        return (
            <div></div>
        );
    }
};

export {Quiz};