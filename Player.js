module.exports = class Player {
    constructor() {
        this.hand = [];
        this.bid = 0;
    }
    giveHand(cards) {
        this.hand = cards;
    }
    setBid(bid) {
        this.bid = bid;
    }
}