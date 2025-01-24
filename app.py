from flask import Flask, request, jsonify, render_template, redirect
from game_logic import Game, Player

app = Flask(__name__)
app.secret_key = "test"

game = Game()

@app.route("/", methods=["GET"])
def index():  
    return render_template("index.html",players = game.players[1:])

@app.route("/play", methods=["GET"])
def play():
    if len(game.players) == 1:
        return redirect("/")
    player_cards = game.players[1].hand
    dealer_cards = game.players[0].hand
    dealer_turn = not(game.in_game)
    stay = game.players[1].stay
    deal = game.deal
    dealer_blackjack = game.players[0].blackjack
    player_blackjack = game.players[1].blackjack
    player_score = game.players[1].score
    dealer_score = game.players[0].score
    new_player_card = game.players[1].hand[len(game.players[1].hand)-1]
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
    return render_template("play.html", data = game_data, player = game.players[1])

@app.route("/add_player", methods=["POST"])
def add_player():
    name = request.form["name"].strip()
    if name == "":
        print("null name")
        return redirect("/")
    game.add_player(name)
    print(game.players)
    return redirect("/")
#

@app.route("/bets", methods = ["GET","POST"])
def bets():
    if len(game.players) == 1:
        return redirect("/")
    if request.method == "POST":
        bets = []
        print("In bets")
        bet = request.form["bet"].strip()
        try:
            bet = float(bet)
        except:
            return redirect("/bets")
        if bet == "":
            print("null name")
            return redirect("/bets")
        if bet > game.players[1].money or bet == 0:
            return redirect("/bets")
        bets.append(bet)
        game.start_game(bets)
        return redirect("/play")
    return render_template("bets.html",money = game.players[1].money)

@app.route("/start_game", methods = ["POST"])
def start_game():
    game.reset()
    
    return redirect("/bets")

    
@app.route("/hit")
def hit():
    if game.players[1].stay:
        return jsonify("stay")
    if game.players[1].bust:
        return jsonify("bust")
    game.hit(game.players[1])
    card = game.players[1].hand[len(game.players[1].hand)-1]
    print(game.players[1].hand)
    print(game.players[1].score)
    data = {"card": card,
            "bust": False,
            "score": game.players[1].score
            }
    if game.players[1].bust:
        data["bust"]= True
    return jsonify(data)

@app.route("/stay")
def stay():
    print("staying")
    game.stay(game.players[1])
    print(game.players[1].score)
    print(game.players[0].hand[2:])
    return jsonify(game.players[0].hand[2:])

@app.route("/reset")
def reset():
    game.reset()
    return redirect("/bets")

@app.route("/dealerData")
def dealerData():
    data = {
        "dealerCards": game.players[0].hand,
        "dealerScore": game.players[0].score
    }
    return jsonify(data)



if __name__ == "__main__":
    app.run(host = "0.0.0.0", debug=True)