const { expect } = require('chai');
const Game = require('../Game');
const Deck = require('playing-card-deck-generator').Deck;

describe('Game', () => {

    let game;
    beforeEach(function() {
        game = new Game();
    })

    it('default game init sets up correctly', () => {
        expect(game.remainingTricks).to.equal(13);
        expect(game.cardsOnBoard).to.deep.equal([]);
        expect(game.previousCardsOnBoard).to.deep.equal([]);
    });

    it("startRound() gets fresh deck, deals everyone hands and resets remainingTricks, cardsOnBoard, and previousCardsOnBoard", () => { 
        game.deck = null;
        game.remainingTricks = 1;
        game.cardsOnBoard = [1];
        game.previousCardsOnBoard = [1];

        game.startRound();

        expect(game.deck).to.exist;
        expect(game.remainingTricks).to.equal(13);
        expect(game.cardsOnBoard).to.deep.equal([]);
        expect(game.previousCardsOnBoard).to.deep.equal([]);
    });

    it("playCard() adds card to board, remove card from player\'s hand and updated to next person", () => { 
        game.startRound();
        let playedCard = game.team1.player1.hand[0];

        game.playCard(playedCard)

        for (let card of game.team1.player1.hand) {
            expect(card).not.equal(playedCard);
        }
        expect(game.cardsOnBoard).to.deep.equal([playedCard]);
        expect(game.currentPlayerTurn).to.equal(game.team2.player2);
    });

    it('_getHand() removes 13 from deck and received cards are the 13 missing cards', () => {
        let receivedHand = game._getHand();

        expect(game.deck.cards.length).to.deep.equal(39);
        for (const card of receivedHand) {
            expect(game.deck.cards).not.include(card);
        }
    });

    it('_setNextPlayer() updates currentPlayerTurn to be next person in', () => {
        expect(game.currentPlayerTurn).to.equal(game.team1.player1);
        game._setNextPlayer();
        expect(game.currentPlayerTurn).to.equal(game.team2.player2);
        game._setNextPlayer();
        expect(game.currentPlayerTurn).to.equal(game.team1.player3);
        game._setNextPlayer();
        expect(game.currentPlayerTurn).to.equal(game.team2.player4);
        game._setNextPlayer();
        expect(game.currentPlayerTurn).to.equal(game.team1.player1);
    });

    it('_dealHands() leaves empty deck and each player with 13 cards in hand', () => {
        game._dealHands();

        expect(game.deck.cards).to.deep.equal([]);
        expect(game.team1.player1.hand.length).to.equal(13);
        expect(game.team1.player3.hand.length).to.equal(13);
        expect(game.team2.player2.hand.length).to.equal(13);
        expect(game.team2.player4.hand.length).to.equal(13);
    });

    it('endTrick() moves current cardsOnBoard to previousCardsOnBoard and decrements remainingTricks', () => {
        let tempDeck = game.deck.cards;
        let originalCardsOnBoard = [tempDeck[0], tempDeck[1], tempDeck[2], tempDeck[3]];
        game.cardsOnBoard = originalCardsOnBoard;
        game.endTrick();

        expect(game.previousCardsOnBoard).to.deep.equal(originalCardsOnBoard);
        expect(game.remainingTricks).to.equal(12);
    });

    it('_getNewDeck() returns new deck', () => {
        let deck = Game._getNewDeck();

        expect(deck).to.exist;
        expect(deck).to.be.instanceOf(Deck);
    });
});