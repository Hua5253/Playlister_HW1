import jsTPS_Transaction from "../../common/jsTPS.js"

export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, index, initTitle, initArtist, youTubeId) {
        super();
        this.model = initModel;
        this.index = index;
        this.title = initTitle;
        this.artist = initArtist;
        this.youTubeId = youTubeId;
    }

    doTransaction() {
        this.model.editSong(this.index, this.title, this.artist, this.youTubeId);
    }

    undoTransaction() {
        let song = this.model.originSong;
        this.model.editSong(this.index, song.title, song.artist, song.youTubeId);
    }
}