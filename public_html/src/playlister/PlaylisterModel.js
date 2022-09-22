import jsTPS from "../common/jsTPS.js";
import Playlist from "./Playlist.js";
import MoveSong_Transaction from "./transactions/MoveSong_Transaction.js";
import AddSong_Transaction from "./transactions/AddSong_Transaction.js";
import RemoveSong_Transaction from "./transactions/RemoveSong_Transaction.js";
import EditSong_Transaction from "./transactions/EditSong_Transaction.js";

/**
 * PlaylisterModel.js
 * 
 * This class manages all playlist data for updating and accessing songs
 * as well as for loading and unloading lists. Note that editing should employ
 * an undo/redo mechanism for any editing features that change a loaded list
 * should employ transactions the jsTPS.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class PlaylisterModel {
    /*
        constructor

        Initializes all data for this application.
    */
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.playlists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;

        // THE MODAL IS NOT CURRENTLY OPEN
        this.confirmDialogOpen = false;

        // A song array to save the removed song inorder to redo ->
        this.removedSongs = [];

        // foolproof design ->
        this.hasListSelected = false;
    }

    // FOR MVC STUFF
    
    setView(initView) {
        this.view = initView;
    }

    refreshToolbar() {
        this.view.updateToolbarButtons(this);
    }
    
    // FIRST WE HAVE THE ACCESSOR (get) AND MUTATOR (set) METHODS
    // THAT GET AND SET BASIC VALUES NEEDED FOR COORDINATING INTERACTIONS
    // AND DISPLAY

    getList(index) {
        return this.playlists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.playlists.length; i++) {
            let list = this.playlists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    getPlaylistSize() {
        return this.currentList.songs.length;
    }

    getSong(index) {
        return this.currentList.songs[index];
    }

    getDeleteListId() {
        return this.deleteListId;
    }

    setDeleteListId(initId) {
        this.deleteListId = initId;
    }

    // For editing song, set and get a temp song for storing the initial song object.
    setTempSong(song) {
        this.tempSong = {
            title: song.title,
            artist: song.artist,
            youTubeId: song.youTubeId,
        }
        
        // keep the original song in order to undo
        this.originSong = {
            title: song.title,
            artist: song.artist,
            youTubeId: song.youTubeId,
        }
    }

    getTempSong() {
        return this.tempSong;
    }

    // Set remove song index.
    setModifySongIndex(index) {
        this.modifySongIndex = index;
    }

    // Get remove song index.
    getModifySongIndex() {
        return this.modifySongIndex;
    }

    toggleConfirmDialogOpen() {
        this.confirmDialogOpen = !this.confirmDialogOpen;
        this.view.updateToolbarButtons(this);
        return this.confirmDialogOpen;
    }

    // THESE ARE THE FUNCTIONS FOR MANAGING ALL THE LISTS

    addNewList(initName, initSongs) {
        let newList = new Playlist(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initSongs)
            newList.setSongs(initSongs);
        this.playlists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.playlists);
        return newList;
    }

    sortLists() {
        this.playlists.sort((listA, listB) => {
            if (listA.getName().toUpperCase() < listB.getName().toUpperCase()) {
                return -1;
            }
            else if (listA.getName().toUpperCase() === listB.getName().toUpperCase()) {
                return 0;
            }
            else {
                return 1;
            }
        });
        this.view.refreshLists(this.playlists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.playlists.length; i++) {
            let list = this.playlists[i];
            this.view.unhighlightList(list.id); // Was : this.view.unhighlightList(i);
        }
    }

    loadList(id) {
        // If user attempts to reload the currentList, then do nothing.
        if (this.hasCurrentList() && id === this.currentList.id) {
            this.view.highlightList(id);
            return;
        }

        let list = null;
        let found = false;
        let i = 0;
        while ((i < this.playlists.length) && !found) {
            list = this.playlists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.refreshPlaylist(this.currentList);
                this.view.highlightList(id); // Was : this.view.highlightList(i);
                found = true;
            }
            i++;
        }
        this.tps.clearAllTransactions();
        this.view.updateStatusBar(this);
        this.view.updateToolbarButtons(this);
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.playlists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let songs = [];
                for (let j = 0; j < listData.songs.length; j++) {
                    songs[j] = listData.songs[j];
                }
                this.addNewList(listData.name, songs);
            }
            this.sortLists();   
            this.view.refreshLists(this.playlists);
            return true;
        }        
    }

    saveLists() {
        let playlistsString = JSON.stringify(this.playlists);
        localStorage.setItem("recent_work", playlistsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    unselectCurrentList() {
        if (this.hasCurrentList()) {
            this.currentList = null;
            this.view.updateStatusBar(this);
            this.view.clearWorkspace();
            this.tps.clearAllTransactions();
            this.view.updateToolbarButtons(this);
        }
    }

    renameCurrentList(initName, id) {
        if (this.hasCurrentList()) {
            let targetList = this.playlists[this.getListIndex(id)];

            if (initName === "") {
                targetList.setName("Untitled");
            } else {
                targetList.setName(initName);
            }

            this.sortLists(); 
            this.view.highlightList(id);
            this.saveLists();
            this.view.updateStatusBar(this);
        }
    }

    deleteList(id) {
        let toBeDeleted = this.playlists[this.getListIndex(id)];
        this.playlists = this.playlists.filter(list => list.id !== id);
        this.view.refreshLists(this.playlists)
        // 2 cases, deleted is current list
        // deleted is not current list
        if (toBeDeleted == this.currentList) {
            this.currentList = null;
            this.view.clearWorkspace();
            this.tps.clearAllTransactions();
            this.view.updateStatusBar(this);
        } else if (this.hasCurrentList()) {
            this.view.highlightList(this.currentList.id);
        }
        this.saveLists();
    }

    // NEXT WE HAVE THE FUNCTIONS THAT ACTUALLY UPDATE THE LOADED LIST

    moveSong(fromIndex, toIndex) {
        if (this.hasCurrentList()) {
            let tempArray = this.currentList.songs.filter((song, index) => index !== fromIndex);
            tempArray.splice(toIndex, 0, this.currentList.getSongAt(fromIndex))
            this.currentList.songs = tempArray;
            this.view.refreshPlaylist(this.currentList);
        }
        this.saveLists();
    }

    // Remove a song. My code goes here -> 
    removeSong(index) {
        // save the song to the removedSongs Array inorder to redo.
        this.removedSongs.push(this.currentList.getSongAt(index));

        this.currentList.songs.splice(index, 1);
        this.saveLists();
        this.restoreList();
    }

    // Redo remove song transaction ->
    redoRemoveSong(index) {
        // get the song from our removedSongs Array.
        let song = this.removedSongs.pop();

        this.currentList.songs.splice(index, 0, song);
        this.saveLists();
        this.restoreList();
    }

    // Adding a new song. My code goes here ->
    addSong() {
        this.currentList.songs.push({title: "Untitled", artist: "unknown", youTubeId: "dQw4w9WgXcQ"}); 
        this.saveLists();
        this.restoreList();
    }

    // Redo Add Song transaction ->
    redoAddSong() {
        this.currentList.songs.pop();
        this.saveLists();
        this.restoreList();
    }

    // Editing a song. Ny code goes here ->
    editSong(index, initTitle, initArtist, youTubeId) {
        let songToBeEdit = this.currentList.getSongAt(index);

        if (initTitle === "") {
            songToBeEdit.title = "untitled";
        } else {
            songToBeEdit.title = initTitle;
        }
        if (initArtist === "") {
            songToBeEdit.artist = "unknown";
        } else {
            songToBeEdit.artist = initArtist;
        }
        if (youTubeId === "") {
            songToBeEdit.youTubeId = "dQw4w9WgXcQ";
        } else {
            songToBeEdit.youTubeId = youTubeId;
        }
        
        this.saveLists();
        this.restoreList();
    }

    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    // NOW THE FUNCTIONS THAT CREATE AND ADD TRANSACTIONS
    // TO THE TRANSACTION STACK

    addMoveSongTransaction(fromIndex, toIndex) {
        let transaction = new MoveSong_Transaction(this, fromIndex, toIndex);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

    addAddSongTransaction() {
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

    addRemoveSongTransaction(index) {
        let transaction = new RemoveSong_Transaction(this, index);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

    addEditSongTransaction(index, initTitle, initArtist, youTubeId) {
        let transaction = new EditSong_Transaction(this, index, initTitle, initArtist, youTubeId);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }
}