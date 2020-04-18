from flask import Flask, request, send_from_directory
import random
import json
from enum import Enum

app = Flask(__name__, static_url_path='/static')

import logging

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)


class Player:

    def __init__(self, name):
        self.name = name
        self.dead = False
        self.ja = False


class States(Enum):
    CHANCELLOR_NOMINATION = "CHANCELLOR_NOMINATION"
    VOTING = "VOTING"
    LEGISLATIVE_CHANCELLOR = "LEGISLATIVE_CHANCELLOR"
    LEGISLATIVE_PRESIDENT = "LEGISLATIVE_PRESIDENT"
    EXECUTION = "EXECUTION"
    CARD_INSPECTION = "CARD_INSPECTION"


class Game:

    def __init__(self, names):
        # random.shuffle(names)
        self.players = [Player(name) for name in names]

        # self.players[4].dead = True

        self.players_dict = {player.name: player for player in self.players}

        self.president = self.players[0]
        self.chancellor = None
        self.nominee = None

        self.deck = ['Liberal'] * 6 + ['Fascist'] * 11
        random.shuffle(self.deck)

        self.discard_pile = []
        self.dealed_cards_president = []
        self.dealed_cards_chancellor = []

        self.last_president = None
        self.last_chancellor = None

        self.anarchy_counter = 0
        self.liberal_articles = 0
        self.fasist_articles = 0

        if len(self.players) == 5:
            roles = ["hitler"] + 1 * ["fascist"] + 3 * ["liberal"]
        elif len(self.players) == 6:
            roles = ["hitler"] + 1 * ["fascist"] + 4 * ["liberal"]
        elif len(self.players) == 7:
            roles = ["hitler"] + 2 * ["fascist"] + 4 * ["liberal"]
        elif len(self.players) == 8:
            roles = ["hitler"] + 2 * ["fascist"] + 5 * ["liberal"]
        elif len(self.players) == 9:
            roles = ["hitler"] + 3 * ["fascist"] + 5 * ["liberal"]
        elif len(self.players) == 10:
            roles = ["hitler"] + 3 * ["fascist"] + 6 * ["liberal"]
        else:
            raise Exception(f"Invalid number of players: {len(self.players)}")

        assert (len(self.players) == len(roles))

        random.shuffle(roles)

        for i, role in enumerate(roles):
            self.players[i].role = role

        self.state = States.CHANCELLOR_NOMINATION
        self.message = f"President {self.president.name} is selecting a chancellor."

    def next_round(self):
        next_president = self.president
        ok = False
        while not ok:
            index = self.players.index(next_president) + 1
            if index >= len(self.players):
                index = 0
            next_president = self.players[index]
            if not next_president.dead:
                ok = True

        self.state = States.CHANCELLOR_NOMINATION
        self.president = next_president
        self.chancellor = None
        self.message = f"President {game.president.name} is selecting a chancellor."


game = Game(["Anna", "Bob", "Cecil", "David", "Eva", "Fiona"])


@app.route('/images/<path:path>')
def send_image(path):
    return send_from_directory('images', path)


@app.route('/')
def root():
    return app.send_static_file('index.html')


@app.route('/secretHitler.html')
def root_board():
    return app.send_static_file('secretHitler.html')


@app.route('/hitler.js')
def js():
    return app.send_static_file('hitler.js')


@app.route('/login.js')
def js_login():
    return app.send_static_file('login.js')


@app.route('/hitler.css')
def css():
    return app.send_static_file('hitler.css')


@app.route('/game')
def get_public_game():
    ret = {}
    ret['players'] = [player.name for player in game.players]

    ret['liberal_articles'] = game.liberal_articles
    ret['fasist_articles'] = game.fasist_articles

    ret['president'] = game.president.name
    ret["chancellor"] = game.chancellor.name if game.chancellor else None

    ret["anarchy_counter"] = game.anarchy_counter

    ret["dead"] = [player.dead for player in game.players]
    ret["message"] = game.message
    return str(json.dumps(ret))


@app.route('/info/<path:path>')
def get_private_info(path):
    if path not in [player.name for player in game.players]:
        print("Invalid name in request: ", path)

    ret = {}
    player = game.players_dict[path]

    ret["role"] = player.role

    if player.role == "fascist" or (player.role == "hitler" and len(game.players) <= 6):
        ret["fascists"] = [player.name for player in game.players if player.role == "fascist"]
        ret["hitler"] = [player.name for player in game.players if player.role == "hitler"]

    if player.dead:
        return str(json.dumps(ret))

    if game.state == States.CHANCELLOR_NOMINATION and game.president == player:
        ret["action"] = "nomination"
        living_players = [p for p in game.players if (not p.dead)]
        if len(living_players) <= 5:
            ret["candidates"] = [p.name for p in game.players if
                                 (p != player) and (not p.dead) and (not game.last_chancellor == p)]
        else:
            ret["candidates"] = [p.name for p in game.players if
                                 (p != player) and (not p.dead) and (not game.last_chancellor == p) and (
                                     not game.last_president == p)]


    elif game.state == States.VOTING:
        ret["action"] = "voting"

    elif game.state == States.LEGISLATIVE_PRESIDENT and game.president == player:
        ret["action"] = "legislative_president"
        ret["cards"] = game.dealed_cards_president
        ret["veto"] = (game.fasist_articles == 5)

    elif game.state == States.LEGISLATIVE_CHANCELLOR and game.chancellor == player:
        ret["action"] = "legislative_chancellor"
        ret["cards"] = game.dealed_cards_chancellor
        ret["veto"] = (game.fasist_articles == 5)

    elif game.state == States.EXECUTION and game.president == player:
        ret["action"] = "execution"
        ret["candidates"] = [p.name for p in game.players if (p != player) and (not p.dead)]
        
    elif game.state == States.CARD_INSPECTION and game.president == player:
        ret["action"] = "card_inspection"
        ret["cards"] = game.deck[:3]

    return str(json.dumps(ret))


@app.route("/action", methods=['POST'])
def action():
    action = request.json

    if game.state == States.CHANCELLOR_NOMINATION:
        game.nominee = game.players_dict[action["nominee"]]
        game.state = States.VOTING
        game.message = f"President {game.president.name} nominated {game.nominee.name} for chancellor. Vote Ja or Nein."
        game.num_votes = 0

    elif game.state == States.VOTING:
        game.players_dict[action["player"]].ja = True if action["vote"] == "ja" else False
        game.num_votes += 1
        if game.num_votes == len([player for player in game.players if not player.dead]):
            voted_ja = [player.name for player in game.players if player.ja and not player.dead]
            voted_nein = [player.name for player in game.players if (not player.ja) and (not player.dead)]

            if len(voted_ja) > len(voted_nein):
                game.anarchy_counter = 0
                game.chancellor = game.nominee
                game.state = States.LEGISLATIVE_PRESIDENT
                game.message = f"Chancellor {game.chancellor.name} was elected to the office!<p>Voted Ja: "
                for name in voted_ja:
                    game.message += name + ", "
                game.message = game.message[:-2] + "<p> Voted Nein: "
                for name in voted_nein:
                    game.message += name + ", "
                game.message = game.message[:-2] + "<p>President is now choosing the legislation."
                game.dealed_cards_president = [game.deck.pop(0) for i in range(3)]

                game.last_chancellor = game.chancellor
                game.last_president = game.president

            else:
                game.anarchy_counter += 1

                game.message = f"Chancellor nominee {game.nominee.name} did not get enough votes!<p>Voted Ja: "
                for name in voted_ja:
                    game.message += name + ", "
                game.message = game.message[:-2] + "<p> Voted Nein: "
                for name in voted_nein:
                    game.message += name + ", "
                game.message = game.message[:-2]

                if game.anarchy_counter == 3:
                    article = game.deck.pop(0)
                    game.anarchy_counter = 0
                    game.last_chancellor = None
                    game.last_president = None

                    if len(game.deck) <= 3:
                        game.deck += game.discard_pile
                        game.discard_pile = []
                        random.shuffle(game.deck)

                    print("Deck", game.deck)
                    print("Discard pile", game.discard_pile)

                    if article == "Liberal":
                        game.liberal_articles += 1
                        game.message += "<p>Angry mob in streets passed a liberal article!"
                        # TODO: handle liberal victory 

                    else:
                        game.fasist_articles += 1
                        game.message += "<p>Angry mob in streets passed a fascist article!"
                        # TODO: handle  fascist victory 
                        
                game.next_round()


    elif game.state == States.LEGISLATIVE_PRESIDENT:
        game.dealed_cards_chancellor = action["legislative_president"]
        game.message = "President passed articles to the chancellor."
        game.state = States.LEGISLATIVE_CHANCELLOR

    elif game.state == States.EXECUTION:
        game.players_dict[action["executed"]].dead = True
        game.next_round()
        
    elif game.state == States.CARD_INSPECTION:        
        game.next_round()


    elif game.state == States.LEGISLATIVE_CHANCELLOR:

        article = action["legislative_chancellor"]
        print("Chancellor chooses", article)

        for i, card in enumerate(game.dealed_cards_president):
            if card == article:
                game.dealed_cards_president.pop(i)
                break
        game.discard_pile += game.dealed_cards_president

        if len(game.deck) <= 3:
            game.deck += game.discard_pile
            game.discard_pile = []
            random.shuffle(game.deck)

        print("Deck", game.deck)
        print("Discard pile", game.discard_pile)

        if article == "Liberal":
            game.liberal_articles += 1
            game.next_round()
            # TODO: handle liberal victory 

        else:
            game.fasist_articles += 1
            # TODO: handle  fascist victory 
            # TODO: handle presidential powers

            if (game.fasist_articles in [4, 5]):
                game.state = States.EXECUTION
                game.message = f"President {game.president.name} has to execute one of the players!"
                
            elif (game.fasist_articles in [3] and len(game.players) in [5,6]):
                game.message = f"President {game.president.name} now inspect top 3 cards."
                game.state = States.CARD_INSPECTION

            else:
                game.next_round()

    return ""


if __name__ == "__main__":
    app.run()
