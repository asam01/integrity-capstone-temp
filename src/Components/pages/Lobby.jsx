import React, { Component, Fragment } from 'react';
import {Link} from 'react-router-dom';
import {Helmet} from 'react-helmet';

const GameLobby = () => (
    <Fragment>
        <Helmet><title>Game Lobby</title></Helmet>
        <div className="room code container">
            <p>Room code</p>
            <p>123456</p>
        </div>
        <div className="lobby members list">
            <p>room members</p>
            <ul>
                <li>Aneesha</li>
                <li>John</li>
                <li>Jack</li>
                <li>Yeet</li>
            </ul>
        </div>
        <Link to="/play/game"> start game </Link>
    </Fragment>

)

export default GameLobby;