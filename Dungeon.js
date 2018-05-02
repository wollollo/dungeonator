import {Tile} from './Tile.js';

export class Dungeon {
    constructor(renderer) {
        this._renderer = renderer; // to be used for updating the DOM on changes
        this._updateQueue = [];

        this._map = [[]];
        //this._map[0].push(new Tile(this, 0, 0, [1,0,1,1], function (row, col, direction) { return corridorgenerator(row, col, direction, 0, 0, 1);}));
        this._map[0].push(new Tile(this, 0, 0, [1,0,1,1], 0));
        this._rooms = [basicgenerator];
        this._opens = 1;
        this._count = 1;
        this._map[0][0].discover();

        this._currentrow = 0;
        this._currentcol = 0;

    }

    initialize() {
        this._updateQueue.push(this._map[0][0]);
        this.setcurrent(0,0);
    }
    
    get map() {
        return this._map;
    }

    get opens() {
        return this._opens;
    }

    get count() {
        return this._count;
    }

    display(tile) {
        this._updateQueue.push(tile);
        this._renderer(this._updateQueue);
    }

    move(direction) {
        if (this._map[this._currentrow][this._currentcol].wall(direction) != 0) {
            //alert("nonopen");
            return;
        } else {
            let drow = deltarow(direction);
            let dcol = deltacol(direction);

            if (this._map[this._currentrow + drow][this._currentcol + dcol].seen != true) {
                alert('HUH');
                return;
            }

            this.setcurrent(this._currentrow + drow, this._currentcol + dcol);
        }
    }

    setcurrent(row, col) {
        this._map[this._currentrow][this._currentcol].current = false;
        this.display(this._map[this._currentrow][this._currentcol]);
        this._currentrow = row;
        this._currentcol = col;
        this._map[row][col].current = true;
        // TODO: discover & process neighbours; set room if necessary
        //       just call addtile?
        this.addtile(row, col); // check this doesn't overwrite anything, should not.
        this.display(this._map[row][col]);
        // TODO: see neighbours
        for (let dirn = 0; dirn < 4; ++dirn) {
            if (this._map[row][col].wall(dirn) == 0) {
                this.addtile(row + deltarow(dirn), col + deltacol(dirn));
            }
        }
    }

    unseenrestrictions(row, col) {
        let walls = [];

        if (row == 0) {
            walls.push(1);
        } else {
            walls.push(this._map[row - 1][col].wall(2)); // grab south restriction from north tile
        }

        walls.push(-1); // east is unknown
        walls.push(-1); // south is unknown

        if (col == 0) {
            walls.push(1);
        } else {
            walls.push(this._map[row][col - 1].wall(1)); // grab east restriction from west tile
        }

        return walls;
    }

    _newroom() {
        this._rooms.push(basicgenerator);
        return this._rooms.length - 1;
    }

    addunseentile(row, col) {
        // dimension checks
        if ( !(row >= 0 && row <= this._map.length) ) { // add to a row, or the first possible new row
            if (row == this._map.length && col != 0) { // new row, start at left
                return;
            } else if (col != this._map[row].length) { // existing row, add at end
                return;
            }
        }

        // calculate restrictions
        let restrns = this.unseenrestrictions(row, col);

        // find room
        let room = undefined;
        for (let wall = 0; wall < 4; ++wall) {
            if (restrns[wall] == 0) {
                room = this._map[row + deltarow(wall)][col + deltacol(wall)].room;
            }
        }

        // update restrictions: if other room, close, and update opposite side, and redraw
        for (let wall = 0; wall < 4; ++wall) {
            if (restrns[wall] == 0 && this._map[row + deltarow(wall)][col + deltacol(wall)].room != room) {
                restrns[wall] = 1;
                this._map[row + deltarow(wall)][col + deltacol(wall)]._walls[opposite(wall)] = 1;
                this.display(this._map[row + deltarow(wall)][col + deltacol(wall)]);
            }
        }

        if (this._map.length == row) {
            this._map.push([]);
        }
        //console.log("creating tile at r " + row + " c " + col + " with restrictions " + restrns)
        // TODO: determine generator
        //let generator = function (row, col, direction) { return corridorgenerator(row, col, direction, 0, 0, 1); };
        //let generator = basicgenerator;
        this._map[row].push(new Tile(this, row, col, restrns, room));

        // render
        this.display(this._map[row][col]);
    }

    generator(tile, wall) {
        return this._rooms[tile.room](tile.row, tile.col, wall);
    }

    seenrestrictions(row, col) { // also calculates change in number of open sides
        // basic idea: go through restrictions, update as needed
        // assume sanity
        // update exactly the -1's, and update other side of same edge
        //     checks: the other side of a -1 is a -1 and also unseen. assert/alert or something on both
        // we can assume left/top tiles exist, as map edges are never -1; but right/bottom need not exist.

        let tile = this._map[row][col];

        let opensdelta = 0; // we are definitely removing one open edge, but it gets counted later
        for (let wall = 0; wall < 4; ++wall) {
            let drow = deltarow(wall);
            let dcol = deltacol(wall);
            let opp  = opposite(wall);

            if (tile.wall(wall) == -1) { // process unknown edges
                if (row + drow < this._map.length && row + drow >= 0 && col + dcol < this._map[row + drow].length && col + dcol >= 0) {
                    // check rooms
                    if (this._map[row + drow][col + dcol].room != undefined && this._map[row + drow][col + dcol].room != tile.room) {
                        tile.setwall(wall, 1);
                        this._map[row + drow][col + dcol].setwall(opp, 1);
                        continue; // too far?
                    }
                    // verify other side is -1/unseen
                    if (this._map[row + drow][col + dcol].wall(opp) != -1 || this._map[row + drow][col + dcol].seen == true) {
                        throw "Insane edges! Opposite not unknown.";
                    }
                }

                // TODO: this is precisely when we need to know the generator, should be undefined up to here?
                //   NO: first open against a tile defines its generator; later neighbours only open if same generator (how does equality work for functions?)
                //let number = tile.generator(row, col, wall);
                let number = this.generator(tile, wall);

                tile.setwall(wall, number);
                if (number == 0) {
                    ++opensdelta;
                }
                if (row + drow < this._map.length && row + drow >= 0 && col + dcol < this._map[row + drow].length && col + dcol >= 0) {
                    this._map[row + drow][col + dcol].setwall(opp, number); // update other side
                    if (number == 0) { // update room of other side
                        this._map[row + drow][col + dcol]._room = this._map[row][col].room;
                    }
                }
            } else { // process known edges, check agrees with other side
                if (row + drow < this._map.length && row + drow >= 0 && col + dcol < this._map[row + drow].length && col + dcol >= 0) {
                    if (tile.wall(wall) == 0 && this._map[row+drow][col+dcol].seen) { 
                        --opensdelta; // we've resolved a side; counts the side we crossed
                    }
                    if (this._map[row + drow][col + dcol].wall(opp) != tile.wall(wall)) {
                        throw "Insane edges! Opposite not equal.";
                    }
                }
            }
        }
        return opensdelta;
    }

    addtile(row, col) {
        //console.log("entered addtile with r " + row + " c " + col);
        if (row < 0 || col < 0 || row > this._map.length) {
            return 0;
        }
        if (row < this._map.length && col < this._map[row].length && this._map[row][col].seen == true) {
            return 0; // already on the map
        }

        // generate unseens to get restrictions
        if (row == this._map.length) {
            this._map.push([]);
        }
        for (let addrow = 0; addrow <= row; ++addrow) {
            for (let addcol = this._map[addrow].length; addcol <= col; ++addcol) { // this assumes no row is ever skipped entirely; checked above
                this.addunseentile(addrow, addcol); //we now have unseens (or seens, if already existing) up to row , col
            }
        }

        if (this._map[row][col].room == undefined) { // this should be in addtile?
            this._map[row][col]._room = this._newroom();
        }

        let opensdelta = this.seenrestrictions(row, col);
        this._opens += opensdelta
        this._map[row][col].discover();
        this._count += 1;
        this.display(this._map[row][col]); // start drawing this tile
    }
}

function basicgenerator(row, col, direction) {
    return Math.floor(2 * Math.random());
}

function blockinggenerator(row, col, direction) {
    return 1;
}

function eastcorridorgenerator(row, col, direction) {
    if (direction == 1) {
        return 0;
    } else {
        return 1;
    }
}

function corridorgenerator(row, col, direction, originrow, origincol, origindirection) {
    let length = Math.floor(40 * Math.random());
    if (direction == origindirection) {
        if ( Math.abs(row - originrow) >= length || Math.abs(col - origincol) >= length) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return 1;
    }
}

function opposite(direction) {
    return (direction + 2) % 4;
}

function deltarow(direction) {
    var drow = 0;
    switch (direction) {
        case 0:
            drow = -1;
            break;
        case 1:
            drow = 0;
            break;
        case 2:
            drow = 1;
            break;
        case 3:
            drow = 0;
            break;
        default:
            "pass"
    }
    return drow;
}

function deltacol(direction) {
    var dcol = 0;
    switch (direction) {
        case 0:
            dcol = 0;
            break;
        case 1:
            dcol = 1;
            break;
        case 2:
            dcol = 0;
            break;
        case 3:
            dcol = -1;
            break;
        default:
            "pass"
    }
    return dcol;
}
