const albumsData = [
    {
        title: "Whatever People Say I Am, That's What I'm Not (2006)",
        image: "assets/WPSIATWIN.jpg",
        description: [
            "Their debut album captures the raw energy and observations of youth \
            in Sheffield with a distinctive blend of indie rock and vivid \
            storytelling, making it the fastest-selling debut album in UK chart history."
        ],
        songs: [
            "I Bet You Look Good on the Dancefloor",
            "Mardy Bum",
            "Dancing Shoes",
            "When the Sun Goes Down",
            "A Certain Romance"
        ]
    },
    {
        title: "Favourite Worst Nightmare (2007)",
        image: "assets/FWN.jpg",
        description: [
            "The follow-up album maintains the band's frenetic pace, exploring themes \
            of nightlife, relationships, and growing up, showcasing their evolution and \
            lyrical prowess."
        ],
        songs: [
            "Fluorescent Adolescent",
            "505",
            "Teddy Picker"
        ]
    },
    {
        title: "Humbug (2009)",
        image: "assets/HUMBUG.jpg",
        description: [
            "Released in the summer of 2009, the album is considered a shift compared to \
            the previous two, more accessible, albums. Co-producer Josh Homme, the lead singer \
            of Queens of the Stone Age, played a major role in developing the darker sound."
        ],
        songs: [
            "Cornerstone",
            "My Propeller",
            "Crying Lightning",
            "The Jeweller's Hands",
        ]
    },
    {
        title: "Suck It and See (2011)",
        image: "assets/SUCKIT.jpg",
        description: [
            "This album marks a return to a more accessible and melodic style, blending catchy \
            tunes with poetic lyricism, and solidifies the band's status."
        ],
        songs: [
            "Don't Sit Down 'Cause I've Moved Your Chair",
            "Reckless Serenade",
            "Love is a Laserquest",
            "That's Where You're Wrong",
            "Library Pictures"
        ]
    },
    {
        title: "AM (2013)",
        image: "assets/AM.jpg",
        description: [
            "AM is characterized by its seductive, R&B-influenced sound, exploring themes of desire, \
            lust, and longing, and becoming a commercial and critical worldwide success."
        ],
        songs: [
            "Do I Wanna Know?",
            "R U Mine?",
            "Arabella",
            "Knee Socks",
            "One for the Road"
        ]
    },
    {
        title: "Tranquility Base Hotel & Casino (2018)",
        image: "assets/TBHC.jpg",
        description: [
            "The band takes a bold step into the realm of lounge and sci-fi-inspired music, exploring \
            consumerism, technology, and modern life with a mature, concept-driven album."
        ],
        songs: [
            "Tranquility Base Hotel & Casino",
            "Four Out of Five",
            "Star Treatment",
            "One Point Perspective"
        ]
    },
    {
        title: "The Car (2022)",
        image: "assets/CAR.jpg",
        description: [
            "A further departure from the rock & roll hits, the Arctic Monkeys continue to delve into \
            new sounds and a soother gaze with the currently last studio record."
        ],
        songs: [
            "There'd Better Be A Mirrorball",
            "Body Paint",
            "Sculptures of Anything Goes"
        ]
    }
];

function displayAlbumInfo(albumIndex) {
    const album = albumsData[albumIndex];
    const albumTitle = document.getElementById("album-title");
    const albumImage = document.getElementById("album-cover");
    const albumDescription = document.getElementById("album-description");
    const songList = document.getElementById("song-list");

    albumTitle.textContent = album.title;
    albumImage.src = album.image;
    albumDescription.textContent = album.description;
    songList.textContent = album.songs.join(", ");

    document.getElementById("album-info").classList.remove("hidden");
}

// add event listeners for album buttons
const albumButtons = document.getElementById("album-buttons").children;
for (let i = 0; i < albumButtons.length; i++) {
    albumButtons[i].addEventListener("click", () => {
        displayAlbumInfo(i);
    });
}

// show first album on reload
const firstButton = document.getElementById("album1");
firstButton.click();
firstButton.focus();