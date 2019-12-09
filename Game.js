const Player = require('./Player');
const { DeckFactory } = require('playing-card-deck-generator');
const deepcopy = require('deepcopy');

const suitsMap = {
    "heart": "h",
    "spade": "s",
    "diamond": "d",
    "club": "c",
}

const suits = ['h', 's', 'd', 'c'];
const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
const rankValues = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14,
}

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
        this.winner = null;
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
        this._updateWinner();

        this.previousCardsOnBoard = this.cardsOnBoard;
        if (--this.remainingTricks === 0) {
            this._endRound();
        }
    }

    _endRound() {
        this._updatePoints();

        if (this.team1.score < this.settings.winningScore &&
            this.team2.score < this.settings.winningScore) {
            this.startRound();
        }
    }

    _updatePoints() {
        let team1bid = this.team1.player1.bid + this.team1.player3.bid;
        let team2bid = this.team2.player2.bid + this.team2.player4.bid;
        let team1tricksWon = this.team1.player1.wonTrickCount + this.team1.player1.wonTrickCount;
        let team2tricksWon = this.team2.player2.wonTrickCount + this.team2.player4.wonTrickCount;
        if (team1bid <= team1tricksWon) {
            this.team1.score += team1bid * 10;
        } else {
            this.team1.score -= team1bid * 10;
        }
        if (team2bid <= team2tricksWon) {
            this.team2.score += team2bid * 10;
        } else {
            this.team2.score -= team2bid * 10;
        }
        if (this.team1.player1.bid === 0) {
            if (this.team1.player1.wonTrickCount === 0) {
                this.team1.score += 100;
            } else {
                this.team1.score -= 100;
            }
        }
        if (this.team2.player2.bid === 0) {
            if (this.team2.player2.wonTrickCount === 0) {
                this.team2.score += 100;
            } else {
                this.team2.score -= 100;
            }
        }
        if (this.team1.player3.bid === 0) {
            if (this.team1.player3.wonTrickCount === 0) {
                this.team1.score += 100;
            } else {
                this.team1.score -= 100;
            }
        }
        if (this.team2.player4.bid === 0) {
            if (this.team2.player4.wonTrickCount === 0) {
                this.team2.score += 100;
            } else {
                this.team2.score -= 100;
            }
        }
    }

    _updateWinner() {
        // TODO: break up, make more readable
        let startingSuit = this.cardsOnBoard[0].getSuit();
        let boardSuits = this._rotateList(this.cardsOnBoard.map(card => card.getSuit()), this._getPlayerNumber(this.currentPlayerTurn) - 1);
        let eligibleWinners = this._rotateList(deepcopy(this.cardsOnBoard), this._getPlayerNumber(this.currentPlayerTurn) - 1);
        if (boardSuits.indexOf(suitsMap.spade) >= 0) {
            eligibleWinners = eligibleWinners.map(card => {
                if (card.suit !== suitsMap.spade) {
                    return null;
                }
                return card;
            })
        } else {
            eligibleWinners = eligibleWinners.map(card => {
                if (card.suit !== startingSuit) {
                    return null;
                }
                return card;
            })
        }
        let valuedBoard = eligibleWinners.map(card => {
            if (card !== null) {
                return rankValues[card.value];
            }
            return 0;
        });
        let winningPlayer = valuedBoard.indexOf(Math.max(...valuedBoard)) + 1;
        this._getPlayerByNumber(winningPlayer).wonTrick();
    }

    _rotateList(list, rotateCount) {
        while(rotateCount--) {
            list.push(list.shift());
        }
        return list;
    }

    _getPlayerByNumber(num) {
        if (num === 1) {
            return this.team1.player1;
        } else if (num === 2) {
            return this.team2.player2;
        } else if (num === 3) {
            return this.team1.player3;
        } else if (num === 4) {
            return this.team2.player4;
        }
    }

    _getPlayerNumber(player) {
        if (player === this.team1.player1) {
            return 1;
        } else if (player === this.team2.player2) {
            return 2;
        } else if (player === this.team1.player3) {
            return 3;
        } else if (player === this.team2.player4) {
            return 4;
        }
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