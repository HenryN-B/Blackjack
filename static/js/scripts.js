const delay = ms => new Promise(res => setTimeout(res, ms));
let isNavigatingAway = false;
let hit_cool_down = true;
console.log("Updated 0.0.3")

function changeHitButton(str) {
    const container = document.getElementById("actions-top");
    const button_container = document.getElementById("hit-stay")
    button_container.classList.remove("hit-stay")
    button_container.classList.add("hit-stay-hidden")
    const para = document.createElement("p");
    const text = document.createTextNode(str);
    para.appendChild(text);
    container.appendChild(para);
}


function calculateScore(card) {
    let score = 0;
    let aceCount = 0;
    //console.log("cards in calculate score:" +card)

   
        let value = card[0]; 
        //console.log("value in calculate score:" + value)
        if (value === "K" || value === "Q" || value === "J") {
            score += 10; 
        } else if (value === "A") {
            aceCount += 1; 
        } else {
            score += parseInt(value);
        }

    for (let i = 0; i < aceCount; i++) {
        if (score + 11 <= 21) {
            score += 11;
        } else {
            score += 1;
        }
    }

    return score;
}

function updateScore(score,player) {
    //console.log(player + " score: "+score)
    let target = player+"-score"
    const container = document.getElementById(target)
    container.innerHTML = score
}

async function handleGameData() {

    if (game_data.deal ) {
        //updateScore(game_data.dealer_score,"dealer")
        dealCards(game_data.playerCards, "player-hand");
        dealCards(game_data.dealerCards, "dealer-hand");
        let cards = document.getElementsByClassName("card");
        function revealCard(index) {
            cards[index].classList.remove("hidden-card")
        }
        revealCard(2);
        setTimeout(() => revealCard(0), 500); 
        setTimeout(() => revealCard(3), 1000); 
        setTimeout(() => revealCard(1), 1500);
        await delay(2000);
        hit_cool_down = false;
        updateScore(game_data.player_score,"player")
        if(game_data.dealer_blackjack) {
            changeHitButton("Dealer Blackjack!");
            last_dealer_cards("null");
        }  else if(game_data.player_blackjack) {
            changeHitButton("Blackjack!");
            last_dealer_cards("null");
        }
    } else {
        whoHand = "";
        for (var i = 0; i<2; i++) {
            if (i == 0) {
                whoHand = "dealer-hand";
                cards = game_data.dealerCards
            } else {
                whoHand = "player-hand";
                cards = game_data.playerCards
            }
            const container = document.getElementById(whoHand);
            container.innerHTML = "";
            cards.forEach((card, index) => {
                //console.log(whoHand, card)
                const img = document.createElement("img");
                const cardString = (whoHand === "dealer-hand" && index === 0 && !(game_data.stay)) ? "card_back.png" : `card${card[1]}${card[0]}.png`;
                img.src = `static/images/${cardString}`;
                img.alt = "Card image";
                img.classList.add("card");
                container.appendChild(img);
        });
        }
        if(game_data.dealer_blackjack) {
            changeHitButton("Dealer Blackjack!");
            await delay(500);
            last_dealer_cards("null");
        }  else if(game_data.player_blackjack) {
            changeHitButton("Blackjack!");
            await delay(500);
            last_dealer_cards("null");
        } else if (game_data.stay) {
            changeHitButton("staying!");
        } else if(game_data.bust) {
            changeHitButton("busted!")
        }
        //console.log("Not deal");
        
    }
    //console.log("Done with handling");

}

function dealCards(cards, whoHand) {
    var done = 0;
    const container = document.getElementById(whoHand);
    container.innerHTML = ""; // Clear existing cards

    cards.forEach((card, index) => {
        //console.log(whoHand, card)
        const img = document.createElement("img");
        const cardString = (whoHand === "dealer-hand" && index === 0) ? "card_back.png" : `card${card[1]}${card[0]}.png`;
        img.src = `static/images/${cardString}`;
        img.alt = "Card image";
        img.classList.add("card");
        img.classList.add("hidden-card")
        container.appendChild(img);
    });
    //console.log("done dealing")
}

async function last_dealer_cards(cards) {
    let aces = 0;
    //console.log("new dealers cards", cards)
    var score = game_data.dealer_score
    if(cards[0][0] == "A" ^ cards[1][0] =="A") {
        aces+=1;
    } else if(cards[0][1] == "A" && cards[1][1] == "A") {
        aces+=1;
    }

    //console.log("dealer score in last_dealer_cards:" + score)

    var first_card = document.getElementsByClassName("card")[0]
    var card = game_data.dealerCards[0]
    var temp = `card${card[1]}${card[0]}.png`
    first_card.src = `static/images/${temp}` 
    whoHand = "dealer-hand"
    updateScore(score,"dealer")

    function flip(card) {
        const container = document.getElementById("dealer-hand");
        const img = document.createElement("img");
        const cardString = `card${card[1]}${card[0]}.png`;
        img.src = `static/images/${cardString}`;
        img.alt = "Card image";
        img.classList.add("card");
        container.appendChild(img);
        score += calculateScore(card)
        //console.log("Updated dealer score:" + score)
        if(card[0] == "A") {
            aces +=1;
        }
        if(score > 21 && aces >= 1) {
            score -= 10;
            aces-=1;
        }
        updateScore(score,"dealer")
    }
    if (cards != "null") {
        for (let i = 2; i < cards.length; i++) {
            //console.log(cards[i]);
            setTimeout(() => flip(cards[i]), 500*(i-1));
        }
    }
}

async function addCard(card, whoHand) {
    try {
        //console.log("adding card", card)
        const cardString = `card${card[1]}${card[0]}.png`;
        const img = document.createElement("img");
        img.src = `static/images/${cardString}`;
        img.alt = "New card image";
        img.classList.add("card");

        const playerHandContainer = document.getElementById("player-hand");
        playerHandContainer.appendChild(img);

    } catch (error) {
        //console.error("Error adding new card:", error);
    }
}

document.getElementById('hit-button').addEventListener('click', async function(event) {
    event.preventDefault();
    try {
        if(hit_cool_down == false) {
            const response = await fetch('/hit');
            const data = await response.json();
            //console.log(data)
            if(data.bust == true) {
                changeHitButton("busted!");
                addCard(data.card);
                updateScore(data.score,"player")
                const response = await fetch('stay');
                const bust_data = await response.json();
                last_dealer_cards(bust_data);
            } else {
                //console.log('Hit response:', data.card);
                //console.log
                addCard(data.card);
                game_data.player_score += data.card[0]
                updateScore(data.score,"player")
            }
        }
    } catch (error) {
        //console.error('Error on hit:', error);
    }
});

document.getElementById('stay-button').addEventListener('click', async function(event) {
    event.preventDefault(); 
    try {
        if(hit_cool_down == false) {
            const response = await fetch('stay');
            const data = await response.json();
            changeHitButton("staying!");
            //console.log(data);
            last_dealer_cards(data);
        }


    } catch (error) {
        //console.error('Error on stay:', error);
    }
});

document.getElementById('reset').addEventListener('click', async function (event) {
    event.preventDefault();
    isNavigatingAway = true;
    window.location.href = '/reset';
    
});

window.addEventListener('unload', function() {
    if (!isNavigatingAway) {
        navigator.sendBeacon('/disconnect', {});
    }
});



handleGameData();