import {Dungeon} from './Dungeon.js';

test('Bug: Overcount opens when an unseen tile borders two opens', () => {
    let dungeon = new Dungeon(function() {return 0;});
    expect(dungeon.opens).toBe(1);
    dungeon._rooms[0] = mapgenerator;
    dungeon.initialize();
    expect(dungeon.opens).toBe(2);

    dungeon.setcurrent(0,1);
    expect(dungeon._map[0][2]._walls).toEqual([1,0,1,0]);
    expect(dungeon._map[1][1]._walls).toEqual([0,1,0,1]);
    expect(dungeon._map[0][0]._walls).toEqual([1,0,1,1]);
    expect(dungeon._map[0][1]._walls).toEqual([1,0,0,0]);
    expect(dungeon._map[1][1]._room).toEqual(0);
    expect(dungeon.opens).toBe(2);

    dungeon.setcurrent(1,1);
    expect(dungeon.opens).toBe(2);

    dungeon.setcurrent(2,1);
    expect(dungeon.opens).toBe(2);

    dungeon.setcurrent(2,2);
    expect(dungeon.opens).toBe(2);

    dungeon.setcurrent(2,3);
    expect(dungeon.opens).toBe(2);

    dungeon.setcurrent(1,3);
    expect(dungeon.opens).toBe(0);
});

test('Bug/Suspected: Seenrestriction might misreturn', () => {
    let dungeon = new Dungeon(function() {return 0;});
    expect(dungeon.opens).toBe(1);
    dungeon._rooms[0] = mapgenerator;
    dungeon.initialize();
    expect(dungeon.opens).toBe(2);

    dungeon.setcurrent(0,1);
    expect(dungeon._map[0][2]._walls).toEqual([1,0,1,0]);
    expect(dungeon._map[1][1]._walls).toEqual([0,1,0,1]);
    expect(dungeon._map[0][0]._walls).toEqual([1,0,1,1]);
    expect(dungeon._map[0][1]._walls).toEqual([1,0,0,0]);
    expect(dungeon._map[1][1]._room).toEqual(0);

    dungeon._map.push([]);
    dungeon.addunseentile(2,0);
    dungeon.addunseentile(2,1);
    expect(dungeon.seenrestrictions(2,1)).toEqual(0); // work out if this is what we want to do
    dungeon.addunseentile(0,3);
    dungeon.addunseentile(1,2);
    dungeon.addunseentile(1,3);
    dungeon.addtile(2,1);
    dungeon.addunseentile(2,2);
    dungeon.addunseentile(2,3);
    //expect(dungeon.seenrestrictions(2,3)).toEqual(0);
});

function mapgenerator(row, col, wall) {
    let walls = [ [ [1,0,1,1], [1,0,0,0], [1,0,1,0], [1,1,0,0]],
                  [ [1,1,1,1], [0,1,0,1], [1,1,1,1], [0,1,0,1]],
                  [ [1,1,1,1], [0,0,1,1], [1,0,1,0], [0,1,1,0]]];

    return walls[row][col][wall];
}
