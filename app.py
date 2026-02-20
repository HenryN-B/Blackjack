from flask import Flask, request, jsonify, render_template, redirect, session
from utils.game_logic import Game, Player
from utils.converter import get_currency
from dotenv import load_dotenv
import sqlite3
import os
import random
from string import ascii_uppercase


def generate_unique_name(length=10):
    while True:
        name = "".join(random.choice(ascii_uppercase) for _ in range(length))
        if name not in names:
            return name


load_dotenv()
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

#game = Game()
names = {}

# @app.after_request
# def add_3ader(response):
#     response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
#     response.headers["Pragma"] = "no-cache"
#     response.headers["Expires"] = "0"
#     return response

@app.route("/", methods=["GET"])
def index():  
    return render_template("index.html")

@app.route("/play", methods=["GET"])
def play():
    name = session["name"]
    if not name:
        return redirect("/")
    if len(names[name].players) == 1:
        return redirect("/")
    player_cards = names[name].players[1].hand
    dealer_cards = names[name].players[0].hand
    dealer_turn = not(names[name].in_game)
    stay = names[name].players[1].stay
    deal = names[name].deal
    dealer_blackjack = names[name].players[0].blackjack
    player_blackjack = names[name].players[1].blackjack
    player_score = names[name].players[1].score
    dealer_score = names[name].players[0].score
    new_player_card = names[name].players[1].hand[len(names[name].players[1].hand)-1]
    reshuffle = names[name].reshuffle
    game_data = {
        "playerCards": player_cards,
        "dealerCards": dealer_cards,
        "turn": dealer_turn,
        "deal": deal,
        "new_player_card": new_player_card,
        "stay": stay,
        "dealer_blackjack": dealer_blackjack,
        "player_blackjack": player_blackjack,
        "player_score": player_score,
        "dealer_score": dealer_score,
        "reshuffle": reshuffle
    }
    return render_template("play.html", data = game_data, player = names[name].players[1])



@app.route("/add_player", methods=["POST"])
def add_player():
    game = Game()
    name = generate_unique_name()

    if name == "" or name == "Null":
        return redirect("/")
    game.add_player(name)
    if name not in names:
        names[name] = game
    session["name"] = name
    return redirect("/bets")



@app.route("/bets", methods = ["GET","POST"])
def bets():
    name = session.get("name")
    if not name or name == "Null":
        return redirect("/")
    if len(names[name].players) == 1:
        return redirect("/")
    return render_template("bets.html",money = names[name].players[1].money, 
                           in_game = names[name].in_game, 
                           argentina = names[name].argentina)
    
@app.route("/start_game", methods=["POST"])
def start_game():
    name = session.get("name")
    money = names[name].players[1].money
    if name is None:
        return {"status": "error", "message": "No session"}

    data = request.get_json()
    bet = float(data.get("bet", 0))

    if bet <= 0:
        return {"status": "error", "message": "Invalid bet: Bet must be bigger then 0"}
    if bet > money:
        return {"status": "error", "message": "Invalid bet: Bet too large", "Money": money}
    names[name].start_game([bet])
    return {"status": "ok"}
    
@app.route("/hit")
def hit():
    name = session.get("name")
    if not name:
        return redirect("/")
    if names[name].players[1].stay:
        return jsonify("stay")
    if names[name].players[1].bust:
        return jsonify("bust")
    names[name].hit(names[name].players[1])
    card = names[name].players[1].hand[len(names[name].players[1].hand)-1]
    data = {"card": card,
            "bust": False,
            "score": names[name].players[1].score
            }
    if names[name].players[1].bust:
        data["bust"]= True
    return jsonify(data)

@app.route("/stay")
def stay():
    name = session.get("name")
    if not name or name == "Null":
        return redirect("/")
    names[name].stay(names[name].players[1])
    return jsonify(names[name].players[0].hand)

@app.route("/reset")
def reset():
    name = session.get("name")
    if not name or name == "Null":
        return redirect("/")
    names[name].reset()
    return redirect("/bets")

@app.route("/dealerData")
def dealerData():
    name = session.get("name")
    data = {
        "dealerCards": names[name].players[0].hand,
        "dealerScore": names[name].players[0].score
    }
    return jsonify(data)

@app.route("/player_and_dealer_data")
def player_and_dealer_data():
    name = session.get("name")
    data = {
        "playerCards": names[name].players[1].hand,
        "playerScore": names[name].players[1].score,
        "playerBlackjack": names[name].players[1].blackjack, 
        "dealerCards": names[name].players[0].hand,
        "dealerScore": names[name].players[0].score,
        "dealerBlackjack": names[name].players[0].blackjack,
    }
    return jsonify(data)

@app.route("/argentina")
def argentina():
    name = session.get("name")
    if names[name].argentina == True:
        return redirect("/bets")
    names[name].argentina = True
    names[name].players[1].money = round(names[name].players[1].money*get_currency("USD", "ARS"), 3)
    return redirect("/bets")


    
    
    



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)