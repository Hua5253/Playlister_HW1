import jsTPS_Transaction from "../../common/jsTPS.js";

export default class RemoveSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, index) {
        super();
        this.model = initModel;
        this.index = index;
    }

    doTransaction() {
        this.model.removeSong(this.index);
    }

    undoTransaction() {
        this.model.redoRemoveSong(this.index);
    }
}