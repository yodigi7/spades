let Player = require('./Player');
const { DeckFactory } = require('playing-card-deck-generator');

const suitsMap = {
    "heart": "h",
    "spade": "s",
    "diamond": "d",
    "club": "c",
}

const suits = ['h', 's', 'd', 'c'];
const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

module.exports = class Game {
    constructor() {
        this.settings = {
            "winningScore": 500,
            "manualEndTrick": false,
        }
        this.team1 = {
            "player1": new Player(),
            "player3": new Player(),
            "score": 0,
            "name": "team1",
        };
        this.team2 = {
            "player2": new Player(),
            "player4": new Player(),
            "score": 0,
            "name": "team2",
        };
        this.deck = Game._getNewDeck();
        this.currentPlayerTurn = this.team1.player1;
        this.remainingTricks = 13;
        this.cardsOnBoard = [];
        this.previousCardsOnBoard = [];
    }

    startRound() {
        this.deck = Game._getNewDeck();
        this.remainingTricks = 13;
        this.cardsOnBoard = [];
        this.previousCardsOnBoard = [];
        this._dealHands();
    }

    playCard(playedCard) {
        let originalCountInHand = this.currentPlayerTurn.hand.length;
        this.currentPlayerTurn.hand = this.currentPlayerTurn.hand.filter(card => {
            if (card.getSuit() === playedCard.getSuit() && card.getValue() === playedCard.getValue()) {
                return false;
            }
            return true;
        });
        if (originalCountInHand - 1 !== this.currentPlayerTurn.hand.length) {
            throw new ReferenceError(`${this.currentPlayerTurn.name} does not have that card to play!`);
        }
        this.cardsOnBoard.push(playedCard);
        this._setNextPlayer();
        if (this.cardsOnBoard.length === 4 && !this.settings.manualEndTrick) {
            this.endTrick();
        }
    }

    endTrick() {
        this.previousCardsOnBoard = this.cardsOnBoard;
        this.remainingTricks--;
    }

    _setNextPlayer() {
        if (this.currentPlayerTurn === this.team1.player1) {
            this.currentPlayerTurn = this.team2.player2;
        } else if (this.currentPlayerTurn === this.team2.player2) {
            this.currentPlayerTurn = this.team1.player3;
        } else if (this.currentPlayerTurn === this.team1.player3) {
            this.currentPlayerTurn = this.team2.player4;
        } else if (this.currentPlayerTurn === this.team2.player4) {
            this.currentPlayerTurn = this.team1.player1;
        }
    }

    static _getNewDeck() {
        let deck = DeckFactory.build(suits, ranks);
        deck.shuffle();
        return deck;
    }

    _getHand() {
        let hand = [];
        for (let i=0; i< 13; i++) {
            hand.push(this.deck.dealTopCard());
        }
        return hand;
    }

    _dealHands() {
        this.team1.player1.giveHand(this._getHand());
        this.team1.player3.giveHand(this._getHand());
        this.team2.player2.giveHand(this._getHand());
        this.team2.player4.giveHand(this._getHand());
    }
}