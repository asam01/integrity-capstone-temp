import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Typography } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import PropTypes from 'prop-types';
import Question from './Question';
import QuestionForm from './QuestionForm';
import { calculateDefaultTimeLimit } from '../../common/utils/appUtil';


class CreateQuiz extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            gametype: 'quiz',
            gamemode: 'normal',
            timelimit: true,
            timescore: false,
            questions: [],
            gamePass: '',
            curQuestion: 0,
        };
        this.addQuestion = this.addQuestion.bind(this);
        this.addQuestions = this.addQuestions.bind(this);
        this.deleteQuestion = this.deleteQuestion.bind(this);
        this.createQuiz = this.createQuiz.bind(this);
    }

    handleChange = name => (event) => {
        this.setState({
            [name]: event.target.value,
        });
    };

    handleChangeBool = name => (event) => {
        this.setState({ [name]: event.target.checked });
    };

    handleChangeSelect = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    addQuestion(questionParameter) {
        const { questions, timelimit } = this.state;
        questions.push(question);
        this.setState({
            questions,
        });
        const snack = {
            variant: 'success',
            message: 'Added question',
        };
    }

    addQuestions(qs) {
    }

    deleteQuestion(question) {

    }

    createQuiz() {

    }

    render() {

    }
}

export default CreateQuiz;