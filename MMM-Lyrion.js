Module.register("MMM-Lyrion", {
    defaults: {
        updateInterval: 60000,
        lmsServer: "http://192.168.1.100:9000",
    },

    start: function() {
        this.players = [];
        this.getPlayers();
        setInterval(() => {
            this.getPlayers();
        }, this.config.updateInterval);
    },
    
    getTranslations: function () {
    return {
      en: "translations/en.json",
      de: "translations/de.json",
      };
    },

    getPlayers: function() {
        this.sendSocketNotification("GET_PLAYERS_AND_TRACKS", this.config.lmsServer);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "PLAYERS_TRACKS_RESULT") {
            this.players = payload;
            this.updateDom();
        }
    },

    getStyles: function() {
        return ["MMM-Lyrion.css", "font-awesome.css"];
    },

    getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "Lyrion";

    // Nur Player anzeigen, die aktuell etwas abspielen
    var playingPlayers = this.players.filter(player => player.isPlaying && player.track);

    if (playingPlayers.length === 0) {
        //wrapper.innerHTML = "Kein aktiver Player <i class='fa fa-music'></i>"; //Original
        wrapper.innerHTML = this.translate("noplayer") + "  <i class='fa fa-music'></i>";
        return wrapper;
    }

    playingPlayers.forEach(player => {
        var playerDiv = document.createElement("div");
        playerDiv.className = "player-container";

        var header = document.createElement("div");
        header.className = "player-header";
        header.innerHTML = `<b>${player.name}</b>  <i class="fa fa-play"></i>`;
        playerDiv.appendChild(header);

        var trackInfo = document.createElement("div");
        trackInfo.className = "player-track-info";
        trackInfo.innerHTML = `${player.track.artist} – ${player.track.title}`;

        playerDiv.appendChild(trackInfo);
        wrapper.appendChild(playerDiv);
    });

    return wrapper;

    }
});