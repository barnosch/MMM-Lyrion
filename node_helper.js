const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-Lyrion helper start...");
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_PLAYERS_AND_TRACKS") {
            this.getPlayersAndTracks(payload);
        }
    },

    async getPlayersAndTracks(lmsServer) {
        const url = `${lmsServer}/jsonrpc.js`;

        try {
            // Spieler abrufen
            const playersResponse = await axios.post(url, {
                id: 1,
                method: "slim.request",
                params: ["-", ["players", 0, 99]]
            });

            const players = playersResponse.data.result.players_loop || [];

            // Details zu allen Playern abrufen
            const playerDetailsPromises = players.map(async player => {
                try {
                    const statusResponse = await axios.post(url, {
                        id: 1,
                        method: "slim.request",
                        params: [player.playerid, ["status", "-", 1, "tags:cgABbehldiqtyrSuoKLN"]]
                    });

                    const status = statusResponse.data.result || {};
                    const trackInfo = (status.playlist_loop && status.playlist_loop.length > 0)
                        ? {
                            //title: status.playlist_loop[0].title || "unknown titel",
                            //artist: status.playlist_loop[0].artist || "unknown artist"
                            title: status.playlist_loop[0].title || "",
                            artist: status.playlist_loop[0].artist || ""
                        }
                        : null;

                    return {
                        name: player.name,
                        id: player.playerid,
                        isPlaying: player.isplaying === 1,
                        track: trackInfo
                    };
                } catch (innerError) {
                    console.error(`error while fetching status for player ${player.name}:`, innerError);
                    return {
                        name: player.name,
                        id: player.playerid,
                        isPlaying: player.isplaying === 1,
                        track: null
                    };
                }
            });

            const playersDetails = await Promise.all(playerDetailsPromises);
            this.sendSocketNotification("PLAYERS_TRACKS_RESULT", playersDetails);
        } catch (error) {
            console.error("error while fetching the player and tracks: ", error);
            this.sendSocketNotification("PLAYERS_TRACKS_RESULT", []);
        }
    }
});
