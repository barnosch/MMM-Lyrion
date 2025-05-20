const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-Lyrion helper started...");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_PLAYERS_AND_TRACKS") {
            const lmsServer = payload; // payload ist die Server-URL
            this.getPlayersAndTracks(lmsServer);
        }
    },

    async getPlayersAndTracks(lmsServer) {
        const url = `${lmsServer}/jsonrpc.js`;

        try {
            const playersResponse = await axios.post(url, {
                id: 1,
                method: "slim.request",
                params: ["-", ["players", 0, 99]]
            });

            const players = playersResponse.data.result.players_loop || [];

            const playerDetailsPromises = players.map(async (player) => {
                try {
                    const statusResponse = await axios.post(url, {
                        id: 1,
                        method: "slim.request",
                        params: [player.playerid, ["status", "-", 1, "tags:cgABbehldiqtyrSuoKLN"]]
                    });

                    const status = statusResponse.data.result || {};
                    const playlist = status.playlist_loop || [];

                    let trackInfo = null;

                    if (playlist.length > 0) {
                        const track = playlist[0];
                        const trackId = track.id || null;

                        trackInfo = {
                            title: track.title || "",
                            artist: track.artist || "",
                            cover: trackId ? `${lmsServer}/music/${trackId}/cover.jpg` : null
                        };
                    }

                    return {
                        name: player.name,
                        id: player.playerid,
                        isPlaying: player.isplaying === 1,
                        track: trackInfo
                    };
                } catch (innerError) {
                    console.error(`Fehler beim Abrufen des Status für Player ${player.name}:`, innerError);
                    return {
                        name: player.name,
                        id: player.playerid,
                        isPlaying: false,
                        track: null
                    };
                }
            });

            const playersDetails = await Promise.all(playerDetailsPromises);
            this.sendSocketNotification("PLAYERS_TRACKS_RESULT", playersDetails);
        } catch (error) {
            console.error("Fehler beim Abrufen der Player und Tracks:", error);
            this.sendSocketNotification("PLAYERS_TRACKS_RESULT", []);
        }
    }
});
