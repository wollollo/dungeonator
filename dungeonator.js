// renderer interface:
//
// to be called on visible changes
// called with:
//   name of change? (ie describe nature) -- alt. with entire new Tile or sim for overwriting
//   location of change
//      Both can be done by reporting all touched Tiles, as they know their own coordinates etc.
//
// to be implemented as div insertion/class change, but in .html file

export function directionstring(wall) {
    switch (wall) {
        case 0:
            return 'north';
        case 1:
            return 'east';
        case 2:
            return 'south';
        case 3:
            return 'west';
        default:
            throw "Invalid direction";
    }
}

export function tile2id(tile) {
    return "r" + tile.row + "c" + tile.col;                      
}
