export class Tile {
    constructor(dungeon, row, col, walls, room) { // Dungeon, int, int, array of ints[4] 
        this._dungeon = dungeon;
        this._row = row;
        this._col = col;
        this._walls = walls;
        this._seen = false;
        //this._seen = this._dungeon.unseenwalls(row, col); // What is this supposed to do?
        this._current = false;
        this._room = room;
    }

    get seen() {
        return this._seen;
    }

    get current() {
        return this._current;
    }

    get row() {
        return this._row;
    }

    get col() {
        return this._col;
    }

    get generator() {
        return this._generator;
    }

    get room() {
        return this._room;
    }

    set current(flag) {
        this._current = flag;
    }

    wall(direction) {
        return this._walls[direction];
    }

    setwall(direction, value) {
        this._walls[direction] = value;
    }
    
    discover() {
        this._seen = true;
    }
}
