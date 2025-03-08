from flask import Flask, request, jsonify, render_template, redirect, session
from game_logic import Game, Player
import sqlite3

app = Flask(__name__)
app.secret_key = "test"

game = Game()
names = {}

@app.route("/", methods=["GET"])
def index():  
    return render_template("index.html",players = game.players[1:])

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
        "dealer_score": dealer_score
    }
    return render_template("play.html", data = game_data, player = names[name].players[1])

@app.route("/add_player", methods=["POST"])
def add_player():
    game = Game()
    name = request.form["name"].strip()
    if name == "" or name == "Null":
        return redirect("/")
    game.add_player(name)
    if name not in names:
        names[name] = game
    session["name"] = name
    return redirect("/bets")

@app.route("/bets", methods = ["GET","POST"])
def bets():
    name = session["name"]
    if not name or name == "Null":
        return redirect("/")
    if len(names[name].players) == 1:
        return redirect("/")
    if request.method == "POST":
        bets = []
        bet = request.form["bet"].strip()
        try:
            bet = float(bet)
        except:
            return redirect("/bets")
        if bet == "":
            return redirect("/bets")
        if bet > names[name].players[1].money or bet <= 0:
            return redirect("/bets")
        bets.append(bet)
        names[name].start_game(bets)
        return redirect("/play")
    return render_template("bets.html",money = names[name].players[1].money)

@app.route("/start_game", methods = ["POST"])
def start_game():
    game.reset()
    
    return redirect("/bets")
    
@app.route("/hit")
def hit():
    name = session["name"]
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
    name = session["name"]
    if not name or name == "Null":
        return redirect("/")
    names[name].stay(names[name].players[1])
    # data = {
    #     "cards": names[name].players[0].hand,
    #     dealer
    # }
    return jsonify(names[name].players[0].hand[2:])

@app.route("/reset")
def reset():
    name = session["name"]
    if not name or name == "Null":
        return redirect("/")
    names[name].reset()
    return redirect("/bets")

@app.route("/dealerData")
def dealerData():
    name = session["name"]
    data = {
        "dealerCards": names[name].players[0].hand,
        "dealerScore": names[name].players[0].score
    }
    return jsonify(data)

@app.route("/disconnect", methods=["POST"])
def disconnect():
    if "name" in session:
        name = session["name"]
        if name in names:
            del names[name] 
            session["name"] = "Null"
        
    return '', 204 
    



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)