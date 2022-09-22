/**
 * PlaylisterView.js
 * 
 * This class deals with the view of our Web application providing services
 * for loading data into our controls and building other UI controls.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class PlaylisterView {
    constructor() {}

    /*
        init

        The user interface should start out with the editing buttons disabled.
    */
    init() {
        // @todo - ONCE YOU IMPLEMENT THE FOOLPROOF DESIGN STUFF YOU SHOULD PROBABLY
        // START THESE BUTTONS OFF AS DISABLED
        this.enableButton("add-list-button");
        this.disableButton("add-song-button");
        this.disableButton('undo-button');
        this.disableButton('redo-button');
        this.disableButton('close-button');
    }

    /*
        setController

        We are using MVC so this view class requires the controller
        object so that once user interface controls are created we
        can initialize the proper event handlers for them.
    */
    setController(initController) {
        this.controller = initController;
    }

    /*
        refreshLists

        This function is called each time the number of lists or the names
        of lists change, like when a list is added, delete, or renamed. It
        simply rebuilds the cards in the sidebar list of playlists.
    */
    refreshLists(lists) {
        // GET THE UI CONTROL WE WILL APPEND IT TO
        let listsElement = document.getElementById("sidebar-list");
        listsElement.innerHTML = "";

        // APPEND A SELECTION CARD FOR EACH PLAYLIST
        for (let i = 0; i < lists.length; i++) {
            let list = lists[i];
            this.appendListToView(list);
        }
    }

    // update list. my code goes here ->
    update(list) {
        this.refreshPlaylist(list);
    }

    /*
        appendListToView

        Adds a playlist card to select from in the left sidebar.
    */
    appendListToView(newList) {
        // EACH CARD WILL HAVE A UNIQUE ID
        let listId = "playlist-" + newList.id;

        // MAKE THE CARD DIV
        let card = document.createElement("div");
        card.setAttribute("id", listId);
        card.setAttribute("class", "list-card");
        card.setAttribute("class", "unselected-list-card");

        // MAKE THE TEXT SPAN
        let textSpan = document.createElement("span");
        textSpan.setAttribute("id", "list-card-text-" + newList.id);
        textSpan.setAttribute("class", "list-card-text");
        textSpan.appendChild(document.createTextNode(newList.name));

        // MAKE THE DELETE LIST BUTTON FOR THIS CARD
        let deleteButton = document.createElement("input");
        deleteButton.setAttribute("type", "button");
        deleteButton.setAttribute("id", "delete-list-" + newList.id);
        deleteButton.setAttribute("class", "list-card-button");
        deleteButton.setAttribute("value", "🗑");

        // PUT EVERYTHING IN THE MOST OUTER DIV
        card.appendChild(textSpan);
        card.appendChild(deleteButton);

        // AND PUT THE NEW CARD INTO THE LISTS DIV
        let listsElement = document.getElementById("sidebar-list");
        listsElement.appendChild(card);

        // SETUP THE HANDLER FOR WHEN SOMEONE MOUSE CLICKS ON OUR LIST
        this.controller.registerListSelectHandlers(newList.id);
    }

    /*
        refreshPlaylist

        Called each time a song is added, removed, moved, or updated,
        this function rebuilds all the song cards for the playlist.
    */
    refreshPlaylist(playlist) {
        // CLEAR OUT THE OLD SONG CARDS
        let itemsDiv = document.getElementById("playlist-cards");
        itemsDiv.innerHTML = "";

        // FOR EACH SONG
        for (let i = 0; i < playlist.songs.length; i++) {
            // MAKE AN ITEM (i.e. CARD)
            let song = playlist.getSongAt(i);
            let itemDiv = document.createElement("div");
            itemDiv.classList.add("list-card");
            itemDiv.classList.add("unselected-list-card");
            itemDiv.id = "playlist-card-" + (i + 1);

            // MAKE THE TEXT CONTENT
            let titleSpan = document.createElement("span");
            titleSpan.setAttribute("id", "song-card-title" + song.title);
            titleSpan.setAttribute("class", "song-card-title");
            titleSpan.append(document.createTextNode(song.title));
            let artistSpan = document.createElement("span");
            artistSpan.setAttribute("id", "song-card-artist" + song.artist);
            artistSpan.setAttribute("class", 'song-card-artist');
            artistSpan.append(document.createTextNode(song.artist));

            // let itemText = document.createTextNode(song.title + " by " + song.artist);

            // MAKE THE NUMBRE OF CARD
            let span = document.createElement('span');
            let num = document.createTextNode(i + 1 + ".")
            span.appendChild(num);

            // MAKE THE HYPERLINK OF THE CONTENT
            let hyperLink = song.youTubeId;
            let a = document.createElement('a');
            a.href = "https://www.youtube.com/watch?v=" + hyperLink;

            // MAKE THE DELETE SONG BUTTON FOR THIS CARD
            let deleteButton = document.createElement("input");
            deleteButton.setAttribute("type", "button");
            deleteButton.setAttribute("id", "remove-song-" + (i + 1));
            deleteButton.setAttribute("class", "song-card-button");
            deleteButton.setAttribute("value", "X");    

            // PUT THE CONTENT INTO THE CARD
            a.append(titleSpan, "by", artistSpan);
            itemDiv.append(span, a);
            itemDiv.appendChild(deleteButton);

            // AND PUT THE CARD INTO THE UI
            itemsDiv.appendChild(itemDiv);
        }
        // NOW THAT THE CONTROLS EXIST WE CAN REGISTER EVENT
        // HANDLERS FOR THEM
        this.controller.registerItemHandlers();
    }

    /*
        clearWorkspace

        This removes all the songs from workspace, which should be
        done whenever a list is closed.
    */
    clearWorkspace() {
        // REMOVE THE ITEMS        
        let itemsDiv = document.getElementById("playlist-cards");
        itemsDiv.innerHTML = "";
    }

    /*
        disableButton

        This function disables the button that has the id parameter
        as it's id property. This should be done as part of a foolproof
        design strategy.
    */
    disableButton(id) {
        let button = document.getElementById(id);
        button.classList.add("disabled");
        button.disabled = true;
    }

    /*
        enableButton

        This function enables the button that has the id parameter
        as it's id property. This should be done as part of a foolproof
        design strategy.
    */    
   enableButton(id) {
        let button = document.getElementById(id);
        button.classList.remove("disabled");
        button.disabled = false;
    }

    /*
        highlightList

        Changes the background of a list card to make it look selected.
    */
    highlightList(listId) {
        // HIGHLIGHT THE LIST
        let listCard = document.getElementById("playlist-" + listId);
        listCard.classList.remove("unselected-list-card");
        listCard.classList.add("selected-list-card");
    }

    /*
        unhighlightList

        Changes the background of a list card so it doesn't look selected.
    */
    unhighlightList(listId) {
        // HIGHLIGHT THE LIST
        let listCard = document.getElementById("playlist-" + listId);
        listCard.classList.add("unselected-list-card");
        listCard.classList.remove("selected-list-card");
    }

    /*
        updateToolbarButtons

        Implements our foolproof design strategy so that when toolbar
        buttons cannot be used they are disabled.
    */
    updateToolbarButtons(model) {
        let tps = model.tps;
        if (model.confirmDialogOpen) {
            this.disableButton("add-list-button");
            this.disableButton("add-song-button");
            this.disableButton("undo-button");
            this.disableButton("redo-button");
            this.disableButton("close-button");
        } 
        else {
            if (tps.hasTransactionToUndo())
                this.enableButton("undo-button");
            else
                this.disableButton("undo-button");

            if (tps.hasTransactionToRedo())
                this.enableButton("redo-button");
            else
                this.disableButton("redo-button");

            if (model.hasListSelected) {
                this.disableButton("add-list-button");
                this.enableButton("close-button");
            }
            else {
                this.enableButton("add-list-button");
                this.disableButton("close-button");
            }
            if (model.hasListSelected) 
                this.enableButton("add-song-button");
            else
                this.disableButton("add-song-button");
        }
    }

    /*
        updateStatusBar

        Displays the name of the loaded list in the status bar.
    */
    updateStatusBar(model) {
        let statusBar = document.getElementById("statusbar");
        if (model.hasCurrentList()) {
            statusBar.innerHTML = model.currentList.getName();
        } else {
            statusBar.innerHTML = '';
        }
    }
}