module.exports = class Player {
    constructor() {
        this.hand = [];
        this.bid = 0;
        this.wonTrickCount = 0;
    }
    giveHand(cards) {
        this.hand = cards;
    }
    setBid(bid) {
        this.bid = bid;
    }
    wonTrick() {
        this.wonTrickCount++;
    }
}