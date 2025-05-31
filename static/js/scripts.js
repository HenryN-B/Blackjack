const delay = ms => new Promise(res => setTimeout(res, ms));
let isNavigatingAway = false;
let hit_cool_down = true;
console.log("Updated 0.0.3")

function changeHitButton(label = "Restart") {
  const container = document.getElementById("actions-box");
  container.innerHTML = "";

  const btn = document.createElement("button");
  btn.id = "reset";
  btn.classList.add("btn", "reset-btn");
  btn.textContent = label;


  btn.addEventListener("click", (event) => {
    event.preventDefault();
    isNavigatingAway = true;
    window.location.href = "/reset";
  });
  container.appendChild(btn);
}

function findOutcome() {
    fetch("/player_and_dealer_data").then(response => response.json())
        .then(data => {
            const player_score = data.playerScore;
            const dealer_score = data.dealerScore;
            const playerBlackjack = data.playerBlackjack;
            const dealerBlackjack= data.dealerBlackjack
 
            if (playerBlackjack || dealerBlackjack) {

            } else if (dealer_score > 21) {
                showOutcome("Dealer Bust, You Won!");
            } else if (player_score > dealer_score) {
                showOutcome("You Won!");
            } else if(player_score < dealer_score) {
                showOutcome("You Lost!");
            } else if (player_score == dealer_score){
                showOutcome("Tie, push!");
            }
    })
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
            changeHitButton();
            showOutcome("Dealer Blackjack, You Lose!");
            last_dealer_cards("null");
        }  else if(game_data.player_blackjack) {
            changeHitButton();
            showOutcome("Player Blackjack, You Win!");
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
                const card_container = document.createElement("div");
                card_container.classList.add("card-container");
                const img = document.createElement("img");
                const isFaceDown = (whoHand === "dealer-hand" && index === 0 && !game_data.stay);
                const cardString = isFaceDown ? "card_back.png" : `card${card[1]}${card[0]}.png`;

                img.src = `static/images/${cardString}`;
                img.alt = "Card image";
                img.classList.add("card");

                card_container.appendChild(img);
                container.appendChild(card_container);
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
        const card_container = document.createElement("div");
         card_container.classList.add("card-container");
        //console.log(whoHand, card)
        const img = document.createElement("img");
        const cardString = (whoHand === "dealer-hand" && index === 0) ? "card_back.png" : `card${card[1]}${card[0]}.png`;
        img.src = `static/images/${cardString}`;
        img.alt = "Card image";
        img.classList.add("card");
        img.classList.add("hidden-card")
        card_container.appendChild(img);
        container.appendChild(card_container);
    });
    //console.log("done dealing")
}

async function last_dealer_cards(cards) {
    let aces = 0;
    //console.log("new dealers cards", cards)
    var score = game_data.dealer_score
    //console.log("dealer score in last_dealer_cards:" + score)
    var first_card = document.getElementsByClassName("card")[0]
    var card = game_data.dealerCards[0]
    var temp = `card${card[1]}${card[0]}.png`
    first_card.src = `static/images/${temp}` 
    whoHand = "dealer-hand"
    updateScore(score,"dealer")

    function flip(card) {
        
        const container = document.getElementById("dealer-hand");
        const card_container = document.createElement("div");
        card_container.classList.add("card-container");
        const img = document.createElement("img");
        const cardString = `card${card[1]}${card[0]}.png`;
        img.src = `static/images/${cardString}`;
        img.alt = "Card image";
        img.classList.add("card");
        card_container.appendChild(img);
        container.appendChild(card_container);
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
        if(cards[0][0] == "A" ^ cards[1][0] =="A") {
            aces+=1;
        } else if(cards[0][1] == "A" && cards[1][1] == "A") {
            aces+=1;
        }
        for (let i = 2; i < cards.length; i++) {
            //console.log(cards[i]);
            setTimeout(() => flip(cards[i]), 500*(i-1));
        }
    }
    const totalDelay = 500 * (cards.length - 2);   
    setTimeout(findOutcome, totalDelay + 50);  
    
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
        const card_container = document.createElement("div");
        card_container.classList.add("card-container");

        card_container.appendChild(img);
        playerHandContainer.appendChild(card_container);

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
                changeHitButton("Restart");
                showOutcome("Busted!")
                addCard(data.card);
                updateScore(data.score,"player")
                last_dealer_cards(data.dealCards);
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
            changeHitButton();
            last_dealer_cards(data);
        }


    } catch (error) {
        //console.error('Error on stay:', error);
    }
});

window.addEventListener('unload', function() {
    if (!isNavigatingAway) {
        navigator.sendBeacon('/disconnect', {});
    }
});



function showOutcome(message, duration = 5000) {
  // Re-use an existing box if we already made one.
  let box = document.getElementById("round-outcome");
  if (!box) {
    box = document.createElement("div");
    box.id = "round-outcome";

    /* --- basic inline styling; swap out for a CSS class if you prefer --- */
    Object.assign(box.style, {
  position: "fixed",
  top: "50%",          // halfway down the viewport
  left: "5px",         // halfway across the viewport
  transform: "translate(-0%, -50%)",
  padding: "20px 40px",
  background: "rgba(0,0,0,0.85)",
  color: "#fff",
  fontSize: "3rem",
  letterSpacing: ".5px",
  borderRadius: "10px",
  zIndex: "1000",
  textAlign: "center",
  boxShadow: "0 0 15px rgba(0,0,0,0.6)",
  display: "none",
  pointerEvents: "none",
  transition: "opacity 0.25s",
    });

    document.body.appendChild(box);
  }

  box.textContent = message;
  box.style.opacity = "1";
  box.style.display = "block";

  // Clear any previous hide timer and set a new one
  clearTimeout(box._hideTimer);
  if (duration !== 0) {
    box._hideTimer = setTimeout(() => {
      box.style.opacity = "0";
      // Wait for the fade-out before hiding
      setTimeout(() => (box.style.display = "none"), 250);
    }, duration);
  }
}

handleGameData();