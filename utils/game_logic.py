import random
import sqlite3

class Player:
    def __init__(self,name):
        self.name = name
        self.score = 0
        self.hand = []
        self.money = 100
        self.bet = 0
        self.stay = False
        self.bust = False
        self.blackjack = False
        self.temp_bet = 0

class Game:
    def __init__(self):
        self.deck = []
        self.players = []
        self.players.append(Player("Dealer"))
        self.in_game = False
        self.reset()
        self.deal = False
        self.argentina = False
        self.reshuffle = True
        
        
    def add_player(self,name = "Temp"):
        if name == "Dealer":
            name = "This guy wanted to be cool and break the game so now his name is this"
        self.players.append(Player(name))
        
    def add_bet(self,bets):
        for i,player in enumerate(self.players):
            if i == 0:
                continue
            bet = bets[i-1]
            player.bet = bet
    
    def deal_one(self,player):
        player.hand.append(self.deck.pop())
        self.update_score(player)
        
    def hit(self,player):
        if self.deal:
            self.deal = False
        if player.bust:
            return
        self.deal_one(player)
        self.update_score(player)
            
    def start_game(self,bets):
        self.in_game = True
        self.deal = True
        self.add_bet(bets)
        for i in range(2):
            for player in self.players:
                if player.name == "Dealer":
                    continue
                self.deal_one(player)
                self.update_score(player)
            self.deal_one(self.players[0])
            self.update_score(self.players[0])
        self.update_score(self.players[0])
        for player in self.players:
            if player.score == 21:
                if player.name == "Dealer":
                    self.players[0].blackjack = True
                    for player in self.players:
                        player.stay = True
                    self.end_game()
                    break
                player.blackjack = True
                player.money += player.bet*3
            
            
    def update_score(self, player):
        score = 0
        aces = 0
        card_values = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
            '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 10, 'Q': 10, 'K': 10, 'A': 11
        }

        for card in player.hand:
            if card[0] in card_values:
                score += card_values[card[0]]
                if card[0] == 'A':
                    aces += 1
        
        while score > 21 and aces:
            score -= 10
            aces -= 1
            
        player.score = score
        
        if player.score > 21:
            player.bust = True

            
    def stay(self,player):
        if self.deal:
            self.deal = False
        player.stay = True
        for player in self.players:
            if player.name == "Dealer":
                continue
            if player.stay == False:
                break
            self.dealer_turn()
            
    def dealer_turn(self):
        while self.players[0].score < 17:
            self.deal_one(self.players[0])
            self.update_score(self.players[0])
        self.end_game()
    
    def end_game(self):
        self.in_game = False
        for player in self.players:
            if player.name == "Dealer":
                continue
            if player.bust:
                continue
            if self.players[0].bust:
                player.money += player.bet*2
                continue
            if player.score < self.players[0].score:
                continue
            if player.score == self.players[0].score:
                player.money += player.bet
                continue
            if player.score > self.players[0].score:
                player.money += player.bet*2
                continue
            
    def reset(self):
        print("resetting")
        self.in_game = False
        self.reshuffle = False
        if len(self.deck) < 105:
            self.deck = []
            self.reshuffle = True
            suits = ("Hearts", "Diamonds", "Clubs", "Spades")
            ranks = ("2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A")

            for _ in range(8):  # 8 decks
                for suit in suits:
                    for rank in ranks:
                        self.deck.append((rank, suit))
            random.shuffle(self.deck)
    
        for player in self.players:
            player.score = 0
            player.hand = []
            player.bet = 0
            player.stay = False
            player.bust = False
            player.blackjack = False


def simulate():
    game = Game()
    name = input("Whats your name: ")
    game.add_player(name)
    
    
    while True:
        bet = []
        for player in game.players:
            if player.name == "Dealer":
                continue
            while True:
                print(player.money)
                string_bet = input("Whats you bet: ")
                try:
                    bet.append(int(string_bet))
                    if int(string_bet) > player.money:
                        print("Too much")
                        continue
                    break
                except:
                    print("try again")
                
        game.start_game(bet)
        
        for i,player in enumerate(game.players):
            while not player.stay:
                if player.bust:
                    print("Busted!")
                    input("press enter")
                    break
                if i == 0:
                    break
                print("dealers card:", game.players[0].hand[0])
                print(game.players[i].hand)
                print(game.players[i].name,"score is", game.players[i].score)
                inpt = input("Hit(1) or Stay(2): ")
                if inpt == "1":
                    game.hit(player)
                elif inpt == "2":
                    game.stay(player)
                else:
                    print("oops try again")
        
        if game.players[0].bust:
            print("Dealer Busted!")
        print(game.players[0].hand, "\n Dealer score:", game.players[0].score)
        game.reset()