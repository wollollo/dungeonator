//const Tile = require('./Tile');
import {Tile} from './Tile.js';

test('Tile ctor sets coordinates', () => {
    let tile = new Tile(undefined, 0, 0, [1,1,1,1], function() { return 1; } );
    expect(tile.row).toBe(0);
    expect(tile.col).toBe(0);
});
