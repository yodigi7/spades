const { expect } = require('chai');
const Player = require('../Player');
const Game = require('../Game');

describe('Player', () => {

    let player;
    beforeEach(function() {
        player = new Player();
    })

    it('giveHand() completely removes all old cards and sets with the new cards', () => {
        let newHand = Game._getNewDeck().cards;

        player.giveHand(newHand);

        expect(player.hand).to.be.deep.equal(newHand);
    });

    it('setBid() updates bid', () => {
        let newBid = 10;

        player.setBid(newBid);

        expect(player.bid).to.be.equal(newBid);
    });

    // TODO
    it('wonTrick()', () => {

    });
});