let isNavigatingAway = false;
let betHistory = [];
let totalBet = 0;
let totalMoney = startMoney;
const chipSound = document.getElementById("chip-sound");

if (argentina) {
  const page = document.querySelector("body");
  page.style.color = "black";
}

function updateDisplay() {
  document.getElementById("total-bet").textContent = totalBet;
  document.getElementById("total-money").textContent = totalMoney;
}

function addBet(amount) {
    betHistory.push(amount);
    totalBet += amount;
    updateDisplay();
}


if(in_game) {
    window.location.href = "/reset";
}

window.addEventListener("beforeunload", function(event) {
    if (!isNavigatingAway) {
        navigator.sendBeacon("/disconnect");
    }
});


document.getElementById("argentina").addEventListener("click", function () {
    if(!argentina) {
        fetch("/argentina")
            .then(() => {
                window.location.href = "/bets";
            });
    }
});

document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', function () {
        const chipValue = parseInt(this.id);

        fetch("/add_bet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ chipValue: chipValue }),
        })
        .then(response => response.json())
        .then(data => {
            const status = data.status;
            const tempBet = data.temp_bet;
            const money = data.money;

            if (status === 1) {
                console.log("Bet accepted! Current bet total:", tempBet);
                totalMoney = totalMoney-chipValue;
                console.log(totalMoney)
                addBet(chipValue);
                updateDisplay();
                chipSound.currentTime = 0;
                chipSound.play();      
            } else if (status === 2) {
                 alert("Error: Not enough money to place that bet.");
                console.log("Not enough money to place that bet.");
            }
        })
        .catch(error => {
            console.error("Error in fetch:", error);
        });
    });
});

document.getElementById("undo-button").addEventListener("click", () => {
    if (betHistory.length > 0) {
        last_bet = betHistory.pop();
        fetch("/undo_bet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ last_bet: last_bet }),
            }).then(response => response.json())
        .then(data => {
            const money = data.money
            totalBet -= last_bet;
            totalMoney = totalMoney-last_bet;
            updateDisplay();
        })
    }
});

document.getElementById("reset-button").addEventListener("click", () => {
    console.log("here");
        fetch("/reset_bet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({})
        }).then(response => response.json())
        .then(data => {
        const money = data.money
        console.log(totalMoney);
        console.log(totalBet);
        totalMoney = totalMoney + totalBet;
        totalBet = 0;
        betHistory = [];
        updateDisplay();
        document.getElementById("reset-sound").play();
    })
});


document.getElementById("start-game").addEventListener("click", function() {
fetch("/start_game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bet: totalBet })
})
.then(res => res.json())
.then(data => {
    if (data.status === "ok") {
        window.location.href = "/play";  // This keeps the session
    } else {
        alert("Bet must be greater than 0");
    }
});

});



