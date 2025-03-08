from random import choice


class Game():
    def __init__(self):
        self.players: list[Player] = []
        self.board: Board = Board()
        self.available_symbols: list[str] = ["x", "o"]
        self.current_player: Player | None = None
        self.winner: bool = None

        self.board.print_board()

    def add_player(self, name):
        if len(self.players) < 2:
            symbol = self.available_symbols.pop(0)
            player = Player(name, symbol)
            self.players.append(player)
        if len(self.players) == 2:
            self.current_player = choice(self.players)
            print("players:", [player.name for player in self.players])
            print("current player:", self.current_player.name, "symbol:", self.current_player.symbol)

    def remove_player(self, name):
        for player in self.players:
            if player.name == name:
                self.players.remove(player)
                self.available_symbols.append(player.symbol)
                return True
        return False

    def get_player(self, name):
        for player in self.players:
            if player.name == name:
                return player
        return None

    def make_move(self, col: int, player_name: str) -> bool:
        """
        Returns True if the move was successful, False otherwise
        """
        if self.winner:
            return False
        if self.current_player.name != player_name:
            return False
        successful = self.board.make_move(col, self.current_player.symbol)
        if successful:
            self.winner = self.current_player if self.board.check_win(self.current_player.symbol) else None
            if not self.winner:
                if not self.board.is_full():
                    self.current_player = self.players[0] if self.current_player == self.players[1] else self.players[1]
                    return True
                else:
                    print("The game is a draw!")
                    return True
            else:
                print(f"{self.current_player.name} has won the game!")
                return True

        else:
            return False

    def reset(self):
        self.board.clear_board()
        self.current_player = choice(self.players)
        self.winner = None


class Board():
    def __init__(self):
        self.rows = 6
        self.columns = 7
        self.board = [["_" for _ in range(self.columns)] for _ in range(self.rows)]
        self.last_move: tuple[int, int] = ()

    def print_board(self):
        for row in self.board:
            print(row)

    def make_move(self, col: int, symbol: str) -> bool:
        """
        returns True if the move was successful, False otherwise
        """
        if col < 0 or col > self.rows:
            return False
        for row in range(self.rows-1, -1, -1):
            if self.board[row][col] == "_":
                self.board[row][col] = symbol
                self.print_board()
                self.last_move = (row, col)
                return True
        return False

    def check_win(self, symbol: str) -> bool:
        rows = len(self.board)
        cols = len(self.board[0])

        # Check horizontal
        for r in range(rows):
            for c in range(cols - 3):
                if all(self.board[r][c + i] == symbol for i in range(4)):
                    return True

        # Check vertical
        for r in range(rows - 3):
            for c in range(cols):
                if all(self.board[r + i][c] == symbol for i in range(4)):
                    return True

        # Check diagonal (\)
        for r in range(rows - 3):
            for c in range(cols - 3):
                if all(self.board[r + i][c + i] == symbol for i in range(4)):
                    return True

        # Check diagonal (/)
        for r in range(3, rows):
            for c in range(cols - 3):
                if all(self.board[r - i][c + i] == symbol for i in range(4)):
                    return True

        return False

    def is_full(self, col: int = None) -> bool:
        if col is None:
            return all(self.board[0][i] != "_" for i in range(self.columns))
        else:
            return self.board[0][col] != "_"

    def clear_board(self):
        self.board = [["_" for _ in range(self.columns)] for _ in range(self.rows)]


class Player():
    def __init__(self, name, symbol):
        self.name = name
        self.symbol = symbol


if __name__ == "__main__":
    game = Game()
    print("Starter:", game.current_player.symbol, game.current_player.name)
    while True:
        col = int(input("Enter column: "))
        game.make_move(col, game.current_player.name)
        game.board.print_board()
        if game.winner:
            break
