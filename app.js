var redirect_uri = "https://m-faraz3110.github.io/loggedin";


var access_token = null;
var refresh_token = null;

var selectedArtists = []
var selectedSongs = []

var min_valence = 1
var max_valence = 0
var min_acousticness = 1
var danceability = 1
var min_energy = 1
var min_speechiness = 1

var ArtistsText = []
var TracksText = []

var playlistTracks = []
client_id = '5014cb8de40942a1ae00a5e076ab4f6f';
client_secret = '78d73129328f4db49f3cc9add9fbdadf';


const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";

function onPageLoad() {
    selectedArtists = []
    selectedSongs = []

    min_valence = 1
    max_valence = 0
    min_acousticness = 1
    danceability = 1
    min_energy = 1
    min_speechiness = 1

    ArtistsText = []
    TracksText = []
    document.getElementById('artSec').replaceChildren();
    document.getElementById('trackSec').replaceChildren();
    document.getElementById('recSec').replaceChildren();

    if (window.location.search.length > 0) {
        handleRedirect();
    }
    else {
        access_token = localStorage.getItem("access_token");
        if (access_token == null) {
            // we don't have an access token so present token section
            document.getElementById("fail").style.display = 'block';

        }
        else {
            // we have an access token so present app section
            document.getElementById("appSection").style.display = 'block';
            topArtists()


        }
    }
}


function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);// remove param from url
}

function getCode() {
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}


function handleAuthorizationResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);

        var data = JSON.parse(this.responseText);
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {

        alert(this.responseText);
    }
}

function selectArtist(id) {
    var res = selectedArtists.indexOf(id);

    if (res == -1) {
        selectedArtists.push(id)

    }
    else {
        selectedArtists = selectedArtists.slice(0, res).concat(selectedArtists.slice(res + 1));
    }
    document.getElementById('selected').textContent = 'Selected: ' + (selectedArtists.length + selectedSongs.length) + ' / 5'
    disableButton();

}

function disableButton() {
    if ((selectedArtists.length + selectedSongs.length) < 1 || (selectedArtists.length + selectedSongs.length > 5)) {
        var disabled = document.getElementById('checker')
        disabled.disabled = true
        disabled.className = 'btn btn-disabled rbutton'

    }
    else {
        var disabled = document.getElementById('checker');
        document.getElementById('checker').disabled = false;
        disabled.className = 'btn btn-primary rbutton';
    }
}

function topArtists() {
    url = "	https://api.spotify.com/v1/me/top/artists?limit=30";
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${access_token
                }`
        }
    })
        .then(response => response.json()
        ).then(data => {

            if (data['error']) {
                document.getElementById("fail").style.display = 'block';
                document.getElementById("appSection").style.display = 'none';
                document.getElementById("selected").style.display = 'none';
                document.getElementById("bottom").style.display = 'none';

            }
            let count = 1;
            var table = document.createElement('table');
            var section = document.createElement('article')
            section.className = 'scroller'
            section.appendChild(table)
            table.className = "artTable";
            var tr = document.createElement('tr');
            tr.className = "trow"
            data['items'].forEach(item => {

                if (count > 5) {
                    count = 1
                    table.appendChild(tr)
                    tr = document.createElement('tr')
                    tr.className = "trow"
                }
                var td = document.createElement('td')
                td.className = "card"
                var img = document.createElement('img')
                img.src = item['images'][1]['url']
                img.style = "width:250px;height:250px"
                td.appendChild(img)
                td.onclick = function () {

                    if (td.classList.contains('cardclicked')) {

                        td.classList.remove('cardclicked')

                    }
                    else {
                        td.classList.add('cardclicked')


                    }
                    selectArtist(item['id'])
                };
                var name = document.createElement('p')
                name.textContent = item['name']
                td.appendChild(name)
                tr.appendChild(td)
                count = count + 1

            });
            document.getElementById("artSec").appendChild(section);
        }).catch(e => console.log(e));

}


function nextSection() {

    document.getElementById("appSection").style.display = 'none';
    document.getElementById("recSection").style.display = 'none';
    document.getElementById("nextSection").style.display = 'block';
    disableButton();

    if (document.getElementById('trackSec').children.length == 0) {
        topSongs()
    }

}

function showArtists() {

    document.getElementById("appSection").style.display = 'block';
    document.getElementById("recSection").style.display = 'none';
    document.getElementById("nextSection").style.display = 'none';


}

// function showTracks() {
//     document.getElementById("appSection").style.display = 'none';
//     document.getElementById("recSection").style.display = 'none';
//     document.getElementById("nextSection").style.display = 'block';
// }

function recSection() {

    document.getElementById("appSection").style.display = 'none';
    document.getElementById("nextSection").style.display = 'none';
    document.getElementById("recSection").style.display = 'block';
    getRecs2()


}

function topSongs() {
    url = "	https://api.spotify.com/v1/me/top/tracks?limit=100";
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${access_token
                }`
        }
    })
        .then(response => response.json()
        ).then(data => {

            let count = 1;
            var table = document.createElement('table');
            var section = document.createElement('article')
            section.className = 'scroller'
            section.appendChild(table)
            table.className = "songTable";
            var tr = document.createElement('tr');
            data['items'].forEach(item => {

                if (count > 4) {
                    count = 1
                    table.appendChild(tr)
                    tr = document.createElement('tr')
                }

                var td = document.createElement('td')

                var td = document.createElement('td')
                td.className = "card"
                var img = document.createElement('img')
                img.src = item['album']['images'][1]['url']
                img.style = "width:250px;height:250px"
                td.appendChild(img)
                img.onclick = function () {

                    if (td.classList.contains('cardclicked')) {

                        td.classList.remove('cardclicked')

                    }
                    else {
                        td.classList.add('cardclicked')


                    }
                    selectSongs(item['id'])
                };
                var name = document.createElement('p')

                name.textContent = item['name'] + " - " + item['artists'][0]['name']
                td.appendChild(name)
                var play = document.createElement('div')
                var play_button = document.createElement('i')
                play.className = 'playdiv'
                play_button.className = 'fa-regular fa-circle-play fa-xl'
                play.appendChild(play_button)
                if (window.matchMedia("(max-width: 600px)").matches) {
                    console.log('YES')
                    play.style.display = 'block'
                }
                else { play.style.display = 'none' }
                play.onclick = function () {
                    play_button.style.display = 'none'
                    var embed = document.createElement('iframe')
                    embed.style = 'border-radius:12px'
                    embed.setAttribute('src', 'https://open.spotify.com/embed/track/' + item['id'] + '?utm_source=generator&theme=0')
                    embed.style.width = '100%'
                    embed.style.height = '40'
                    embed.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture')
                    td.appendChild(embed)
                }
                td.appendChild(play)
                tr.appendChild(td)
                count = count + 1

            });
            document.getElementById("trackSec").appendChild(section);
        }).catch(e => console.log(e));
}

function selectSongs(id) {
    var res = selectedSongs.indexOf(id);
    console.log(res)

    if (res == -1) {
        selectedSongs.push(id)
    }
    else {
        selectedSongs = selectedSongs.slice(0, res).concat(selectedSongs.slice(res + 1));
    }
    document.getElementById('selected').textContent = 'Selected: ' + (selectedArtists.length + selectedSongs.length) + ' / 5'
    disableButton();
    console.log(selectedSongs.length + selectedArtists.length)
}



function getParams() {
    // var min_valence = 1
    // var max_valence = 0
    // var min_acousticness = 1
    // var danceability = 1
    // var min_energy = 1
    // var min_speechiness = 1
    count = 1

    return new Promise((resolve, reject) => {
        selectedSongs.forEach(item => {
            url = 'https://api.spotify.com/v1/audio-features/' + item;
            fetch(url, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(response => response.json()
                ).then(data => {

                    if (data['danceability'] < danceability) {
                        min_danceability = data['danceability'];

                    }
                    if (data['valence'] < min_valence) {
                        min_valence = data['valence'];

                    }
                    if (data['acousticness'] < min_acousticness) {
                        min_acousticness = data['acousticness'];

                    }
                    if (data['energy'] < min_energy) {
                        min_energy = data['energy'];

                    }
                    if (data['speechiness'] < min_speechiness) {
                        min_speechiness = data['speechiness'];

                    }
                    if (count == selectSongs.length) {

                        resolve(true)
                    }
                    count = count + 1


                }).catch(e => console.log(e));


        })





    })
    // getRecs(min_valence, max_valence, min_acousticness, danceability, min_energy, min_speechiness);





}

// const getRecs1 = async () => {
//     var wait = await getParams()
//     console.log("PARAMS OBTAINED?")
//     var seed_artists = ""
//     var seed_songs = ""

//     selectedArtists.forEach(item => {
//         seed_artists += item
//         seed_artists += "%2C"
//     })

//     selectedSongs.forEach(item => {
//         seed_songs += item
//         seed_songs += "%2C"
//     })
//     console.log(min_valence + "," + max_valence + "," + min_acousticness + "," + danceability + "," + min_energy + "," + min_speechiness)
//     url = 'https://api.spotify.com/v1/recommendations?seed_artists=' + seed_artists + "&seed_tracks=" + seed_songs + "&min_acousticness=" + min_acousticness + "&min_danceability=" + danceability + "&min_energy=" + min_energy + "&min_speechiness=" + min_speechiness + "&min_valence=" + min_valence + "&max_valence=" + max_valence;
//     fetch(url, {
//         headers: {
//             'Authorization': `Bearer ${access_token
//                 }`
//         }
//     })
//         .then(response => response.json()
//         ).then(data => {
//             console.log(data)

//         }).catch(e => console.log(e));


// }

async function getRecs2() {
    var wait = await getParams()

    if (Math.abs(max_valence - min_valence) < 0.3) {
        max_valence = 1

    }
    var seed_artists = ""
    var seed_songs = ""
    if (selectedArtists.length == selectedSongs.length) {
        selectedSongs = selectedSongs.slice(0, selectedSongs.length - 1)
    }

    for (i = 0; i < selectedArtists.length; i++) {
        seed_artists += selectedArtists[i]
        if (i != selectedArtists.length - 1) {
            seed_artists += "%2C"
        }
    }
    for (i = 0; i < selectedSongs.length; i++) {
        seed_songs += selectedSongs[i]
        if (i != selectedSongs.length - 1) {
            seed_songs += "%2C"
        }
    }

    url = 'https://api.spotify.com/v1/recommendations?limit=100&seed_artists=' + seed_artists + "&seed_tracks=" + seed_songs + "&min_acousticness=" + min_acousticness + "&min_danceability=" + min_danceability + "&min_energy=" + min_energy + "&min_speechiness=" + min_speechiness + "&min_valence=" + min_valence;
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${access_token
                }`
        }
    })
        .then(response => response.json()
        ).then(data => {

            let count = 1;
            var table = document.createElement('table');
            var section = document.createElement('article')
            section.className = 'scroller'
            section.appendChild(table)
            table.className = "recTable";
            var tr = document.createElement('tr');
            data['tracks'].forEach(item => {

                playlistTracks.push('spotify:track:' + item['id'])

                if (count > 4) {
                    count = 1
                    table.appendChild(tr)
                    tr = document.createElement('tr')
                }

                var td = document.createElement('td')

                var td = document.createElement('td')
                td.className = "card"
                var img = document.createElement('img')
                img.src = item['album']['images'][1]['url']
                img.style = "width:250px;height:250px"
                td.appendChild(img)
                td.onclick = function () {
                };
                var name = document.createElement('p')
                name.textContent = item['name'] + " - " + item['artists'][0]['name']
                td.appendChild(name)
                var play = document.createElement('div')
                var play_button = document.createElement('i')
                play.className = 'playdiv'
                play_button.className = 'fa-regular fa-circle-play fa-xl'
                play.appendChild(play_button)
                if (window.matchMedia("(max-width: 600px)").matches) {
                    console.log('YES')
                    play.style.display = 'block'
                }
                else { play.style.display = 'none' }
                play.onclick = function () {
                    play_button.style.display = 'none'
                    var embed = document.createElement('iframe')
                    embed.style = 'border-radius:12px'
                    embed.setAttribute('src', 'https://open.spotify.com/embed/track/' + item['id'] + '?utm_source=generator&theme=0')
                    embed.style.width = '100%'
                    embed.style.height = '40'
                    embed.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture')
                    td.appendChild(embed)
                }
                td.appendChild(play)
                tr.appendChild(td)
                count = count + 1

            });
            table.appendChild(tr)
            document.getElementById("recSec").replaceChildren(section);
        }).catch(e => console.log(e));

}

function getID() {
    return new Promise((resolve, reject) => {
        url = 'https://api.spotify.com/v1/me/';

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(response => response.json()
            ).then(data => {
                resolve(data['id'])
                return data['id']

            }).catch(e => console.log(e));


    })





}

function newPlaylist(userID) {
    return new Promise((resolve, reject) => {
        var body = {
            "name": "Music Recommender Playlist",
            "public": "false"
        }



        url = "https://api.spotify.com/v1/users/" + userID + "/playlists"
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token
                    }`
            },
            body: JSON.stringify(body)


        }).then(response => response.json()).then(data => {
            console.log("CREATED")
            resolve(data['id'])
            return data['id']
        }).catch(e => console.log(e));


    })
}

async function createPlaylist() {
    var tick = document.createElement('i')
    tick.className = 'fa-regular fa-check'
    var button = document.getElementById('playlist');
    button.textContent = "CREATED PLAYLIST "
    button.appendChild(tick)
    var userID = await getID();
    console.log(userID)
    var playlistID = await newPlaylist(userID);
    console.log(playlistID)
    console.log(playlistTracks)
    console.log("HELLOOOO")
    url = "https://api.spotify.com/v1/playlists/" + playlistID + "/tracks"
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token
                }`
        },
        body: JSON.stringify(playlistTracks)

    }).then(response => response.json()).then(data => {
        console.log("UPDATED")
        window.location.href = 'https://open.spotify.com/playlist/' + playlistID

    }).catch(e => console.log(e));








}

function auth() {
    // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-top-read user-read-email playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative";
    window.location.href = url; // Show Spotify's authorization screen
}

