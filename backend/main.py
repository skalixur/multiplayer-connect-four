from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
import socketio
import random
from string import ascii_uppercase
from game import Game
import os
import uuid
from fastapi.middleware.cors import CORSMiddleware


join_queue = []

name_to_id = {}
id_to_name = {}
sid_to_name = {}

# Initialize FastAPI app
app = FastAPI()
# Initialize the SocketManager with FastAPI
# Initialize Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app.mount("/socket.io", socketio.ASGIApp(sio))  # WebSockets

# Serve frontend (React build files)
frontend_dir = os.path.abspath("../frontend/dist")
assets_dir = os.path.abspath("../frontend/dist/assets")
index_path = os.path.join(frontend_dir, "index.html")

# Handle CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/create-room")
async def create_room_endpoint(data: dict):

    name = data.get("playerName")
    print(name, "is creating a room")
    if name == "" or len(name) > 50:
        raise HTTPException(400, detail=Error("Name must be between 1 and 50 characters").get_error())

    player_id = str(uuid.uuid4())
    link_id_name(player_id, name)

    code = generate_unique_code(4)

    rooms[code] = {"members": 1, "game": Game(), "consent": 0}
    rooms[code]["game"].add_player(name)
    join_queue.append((player_id, code, name))
    print("Player added to join queue:", (player_id, code, name))
    return {"ok": True, "data": {"playerId": player_id, "roomCode": code}}


@app.post("/api/join-room")
async def join_room_endpoint(data: dict):
    name = data.get("playerName")
    code = data.get("roomCode")

    if name == "" or len(name) > 50:
        return Error("Name must be between 1 and 50 characters").get_error()

    if code not in rooms:
        return Error("Room does not exist").get_error()

    if rooms[code]["members"] >= 2:
        return Error("Room is full").get_error()

    id = str(uuid.uuid4())

    link_id_name(id, name)

    rooms[code]["members"] += 1
    rooms[code]["game"].add_player(name)

    join_queue.append((id, code, name))
    return {"ok": True, "data": {"playerId": id, "roomCode": code}}
rooms = {}


def generate_unique_code(length):
    while True:
        code = ""
        for _ in range(length):
            code += random.choice(ascii_uppercase)

        if code not in rooms:
            break

    return code


def link_id_name(id, name):
    name_to_id[name] = id
    id_to_name[id] = name


@sio.on("connect")
async def connect(sid, environ=None):
    print(f"Client {sid} connected")


@sio.on("disconnect")
async def disconnect(sid, environ=None):
    for room, data in rooms.items():
        if sid in data.get("players", []):
            name = sid_to_name[sid]
            id = name_to_id[name]
            print(f"Client {sid} left room {room}")
            data["players"].remove(sid)
            rooms[room]["members"] -= 1
            rooms[room]["game"].remove_player(name)
            await sio.emit("player_left", {"sid": sid}, room=room)
            if len(data["players"]) == 0:
                del rooms[room]  # Remove room if empty
            await sio.leave_room(sid, room)
            await sio.emit("player-leave", {"playerName": name, "playerId": id}, room=room)
            break


@sio.on("join-room")
async def join_room(sid, data):
    id = data["playerId"]
    room_code = data["roomCode"]
    name = data["playerName"]
    sid_to_name[sid] = name

    print(f"Client {name} is trying to join room {room_code}")

    if (id, room_code, name) in join_queue and room_code in rooms:
        print(f"Client {name} is joining room {room_code}")
        game = rooms[room_code]["game"]
        symbol = game.get_player(name).symbol
        print("Newly joined player symbol:", symbol)
        if symbol is not None:
            await sio.emit("player-data", {"symbol": game.get_player(name).symbol}, room=sid)
        else:
            print("Symbol not found for some reason sadge")
            await sio.emit("error", Error("Symbol not found for some reason sadge").get_error(), room=sid)
            return
        await sio.enter_room(sid, room_code)
        await sio.emit("player-join", get_players(room_code), room=room_code)
        await sio.emit("board-update", {"board": game.board.board}, room=room_code)
        if rooms[room_code]["game"].winner:
            await sio.emit("game-over", {"tie": False, "winnerSymbol": game.current_player.symbol}, room=room_code)
        elif rooms[room_code]["game"].board.is_full():
            await sio.emit("game-over", {"tie": True, "winnerSymbol": None}, room=room_code)
        if rooms[room_code]["members"] == 2:
            await sio.emit("turn", {"currentPlayerSymbol": game.current_player.symbol}, room=room_code)
        print(f"Client {name} joined room {room_code}")
    else:
        print(f"Client {name} is not in the join queue or room does not exist")
        print("Expected:", join_queue)
        print("Player details:", (id, room_code, name))


@sio.on("player-join")
async def player_joined(sid, data):
    print(f"Player {data['name']} joined room")


@sio.on("make-move")
async def make_move(sid, data):
    room_code = data["roomCode"]
    column = int(data["cellIndex"])
    id = data["playerId"]
    print(f"Player {id} is making a move in room {room_code} at column {column}")

    if rooms[room_code]["members"] != 2:
        return Error("Not enough players in the room").get_error()

    if room_code not in rooms:
        return

    game: Game = rooms[room_code]["game"]
    symbol = game.current_player.symbol
    success = game.make_move(column, id_to_name[id])
    x, y = game.board.last_move
    if success:
        await sio.emit("board-update", {"board": game.board.board, "coords": {"row": x, "column": y}, "symbol": symbol}, room=room_code)

        if game.winner:  # If someone won
            print("Sending out the news of the winner...")
            await sio.emit("game-over", {"tie": False, "winnerSymbol": game.current_player.symbol}, room=room_code)
        elif game.board.is_full():
            await sio.emit("game-over", {"tie": True, "winnerSymbol": None}, room=room_code)
        else:  # If nothing of interest happened just announce who the current player is
            await sio.emit("turn", {"currentPlayerSymbol": game.current_player.symbol}, room=room_code)
    elif game.board.is_full(column):
        await sio.emit("error", Error("Column is full!").get_error(), room=sid)
    elif not game.winner:
        await sio.emit("error", Error("It's not your turn!").get_error(), room=sid)
    else:
        await sio.emit("error", Error("The game is already over!").get_error(), room=sid)


@sio.on("reset")
async def reset(sid, room_code):
    if room_code not in rooms:
        return

    rooms[room_code]["consent"] += 1
    if rooms[room_code]["consent"] == 2:
        game = rooms[room_code]["game"]
        game.reset()
        await sio.emit("board-update", {"board": game.board.board}, room=room_code)
        await sio.emit("turn", {"currentPlayerSymbol": game.current_player.symbol}, room=room_code)
        rooms[room_code]["consent"] = 0


@sio.on("unreset")
async def unreset(sid, room_code):
    if room_code not in rooms:
        return

    rooms[room_code]["consent"] -= 1


@sio.on("message")
async def on_message(sid, data):
    print("message:", data)


def get_players(room):
    players = {}
    game = rooms[room]["game"]

    for player in game.players:
        players[player.symbol] = {"playerName": player.name,
                                  "playerSymbol": player.symbol, "playerId": name_to_id[player.name]}

    return players


class Error():
    def __init__(self, message):
        self.message = message

    def get_error(self):
        return {"ok": False, "data": {"messages": [self.message]}}


# ** DO NOT TOUCH ANYTHING FROM HERE ON OUT UNLESS YOU ARE GOD (In which case hi God) **

# Serve index.html for React Router (Handles all frontend routes)


@app.api_route("/react-playground/{full_path:path}")
async def serve_react_app(request: Request, full_path: str):
    # Serve the React app for any path under /react-playground
    print("Serving React app")
    file_path = os.path.join(frontend_dir, full_path)
    if os.path.isfile(file_path):
        print("Serving file", file_path)
        return FileResponse(file_path)
    elif os.path.isdir(file_path):
        print(f"Requested path {file_path} is a directory, not a file.")
        # Handle the case where a directory is requested, if necessary
        # For example, you might want to serve an index file within the directory
        index_file = os.path.join(file_path, "index.html")
        if os.path.isfile(index_file):
            print("Serving index file", index_file)
            return FileResponse(index_file)
        else:
            print("No index file found in directory", file_path)
            return HTMLResponse(content="Directory listing is not allowed", status_code=403)
    else:
        with open(index_path) as f:
            print("Serving index.html", index_path)
            return HTMLResponse(content=f.read())


def frontend(build_dir="./build"):
    """
     FASTAPI ROUTER FOR REACT FRONTEND
    :param build_dir: the path to your build folder for react
            we are assuming the "static" folder lives within your build folder
            if not, change it some lines below
    :return: fastapi.FastAPI
    """

    import pathlib
    import fastapi.exceptions
    from fastapi import FastAPI, Request, Response
    from fastapi.staticfiles import StaticFiles

    build_dir = pathlib.Path(frontend_dir)

    react = FastAPI(openapi_url="")
    app.mount("/react-playground/", StaticFiles(directory=assets_dir, html=True), name="assets")

    @react.get('/{path:path}')
    async def handle_catch_all(request: Request, path):
        print("handling", request.url.path)
        if path and path != "/":
            disk_path = build_dir / path
            if disk_path.exists():
                return Response(disk_path.read_bytes(), 200)
            else:
                if disk_path.is_file():
                    raise fastapi.exceptions.HTTPException(404)

        return Response((build_dir / "index.html").read_bytes(), 200)

    return react


app.mount('/', frontend(build_dir='build'))  # we are MOUNTING it!


"""@app.route("/", methods=["POST", "GET"])
def home():
    session.clear()
    if request.method == "POST":
        name = request.form.get("name")
        code = request.form.get("code")
        join = request.form.get("join", False)
        create = request.form.get("create", False)

        if not name:
            return render_template("home.html", error="Please enter a name", code=code, name=name)

        if join != False and not code:
            return render_template("home.html", error="Please enter a room code", code=code, name=name)

        room = code
        if create != False:
            room = generate_unique_code(4)
            rooms[room] = {"members": 0, "messages": [], "game": Game()}

        elif code not in rooms:  # Then they're trying to join a room so we need to handle this case
            return render_template("home.html", error="The room does not exist", code=code, name=name)

        session["room"] = room
        session["name"] = name

        return redirect(url_for("room"))

    return render_template("home.html")


@app.route("/index")
def index():
    return render_template("index.html")


@app.route("/room")
def room():
    room = session.get("room")
    if room is None or session.get("name") is None or room not in rooms:
        return redirect(url_for("home"))

    return render_template("room.html", code=room, messages=rooms[room]["messages"])


@socketio.on("message")
def message(data):
    room = session.get("room")
    if room not in rooms:
        return

    content = {
        "name": session.get("name"),
        "msg": data["data"]
    }
    send(content, to=room)
    rooms[room]["messages"].append(content)
    print(f"{session.get('name')} said: {data['data']}")


@socketio.on("connect")
def connect(auth):
    room = session.get("room")
    name = session.get("name")
    if not room or not name:
        return
    if room not in rooms:
        leave_room(room)
        return

    join_room(room)
    send({"name": name, "msg": "has entered the room!"}, to=room)
    rooms[room]["members"] += 1
    print(f"{name} joined room {room}")

    rooms[room]["game"].add_player(name)


@socketio.on("make-move")
def make_move(data):
    room = session.get("room")
    name = session.get("name")
    col = int(data["data"])

    if not room or not name:
        print("first out")
        return
    if room not in rooms:
        print("second out")
        leave_room(room)
        return

    if name == rooms[room]["game"].current_player.name:
        game = rooms[room]["game"]
        successful = game.make_move(col, name)
        if successful:
            print(f"{name} made a move in column {col}")
            if game.winner:
                emit("game-over", game.current_player.name, to=room)
                print(f"{name} has won the game!")
            elif game.board.is_full():
                emit("game-over", None, to=room)
                print("The game is a draw!")
            emit("update_board", game.board.board, to=room)


@socketio.on("disconnect")
def disconnect():
    room = session.get("room")
    name = session.get("name")
    leave_room(room)

    rooms[room]["game"].remove_player(name)

    if room in rooms:
        rooms[room]["members"] -= 1
        if rooms[room]["members"] <= 0:
            del rooms[room]

    send({"name": name, "msg": "has left the room!"}, to=room)
    print(f"{name} left room {room}")"""


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4321)
