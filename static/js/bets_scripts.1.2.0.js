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
        if(startMoney-totalBet-chipValue >= 0) {
            console.log("Bet accepted! Current bet total:", totalBet+chipValue);
            totalMoney = totalMoney-chipValue;
            addBet(chipValue);
            updateDisplay();
            chipSound.currentTime = 0;
            chipSound.play();    

        } else {
                alert("Error: Not enough money to place that bet.");
                console.log("Not enough money to place that bet.");
        }
    });
});

document.getElementById("undo-button").addEventListener("click", () => {
    if (betHistory.length > 0) {
        last_bet = betHistory.pop();
        totalBet -= last_bet;
        totalMoney = totalMoney+last_bet;
        updateDisplay();
    }
});

document.getElementById("reset-button").addEventListener("click", () => {
    totalMoney = totalMoney + totalBet;
    totalBet = 0;
    betHistory = [];
    updateDisplay();
    document.getElementById("reset-sound").play();
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
        window.location.href = "/play"; 
    } else {
        if(message == "Invalid bet: Bet too large") {
            startMoney = data.money;
            totalBet = 0;
            betHistory = [];
        }
        alert(data.message);
    }
});

});



