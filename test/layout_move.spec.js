/*jslint sloppy:true, nomen:true */
/*global jasmine, describe, xdescribe, it, xit,
 expect, beforeEach, afterEach,
 Pocketry
 */
describe('Tile move in the layout', function () {
  beforeEach(function () {
    this.colCount = 5;
    this.rowSpan = 2;
    this.l = new Pocketry.Layout(this.colCount, this.rowSpan);
  });

  var tileId = 1;

  function tileCreator(type) {
    return function () {
      var obj = Object.create(type);
      obj.id = tileId++;
      return obj;
    };
  }

  beforeEach(function () {
    tileId = 1;
  });

  function position(x, y) {
    return {x: x, y: y};
  }

  var appTile = tileCreator(Pocketry.TILES.app),
    pinTile = tileCreator(Pocketry.TILES.pin),
    feedTile = tileCreator(Pocketry.TILES.feed);

  function dumpLayout(layout, msg) {
    msg = msg || '';
    var arr = layout.matrix.get().map(function (row) {
      return row.map(function (tile) {
        return tile ? tile.id : 0;
      });
    });
    var str = '\n' + msg + '\n';
    arr.forEach(function (row) {
      row.forEach(function (val) {
        str += (val ? val : 0);
        str += ' ';
      });
      str += '\n';
    });
    console.log(str);
  }

  describe('Layout.move', function () {

    it('should be defined function', function () {
      expect(typeof this.l.move === "function").toBeTruthy();
    });

    it('should move pin in two pin stack', function () {
      var l = this.l;
      var pin = pinTile();
      var pin2 = pinTile();
      l.add(pin);
      l.add(pin2);

      l.move(pin2, 0);
      expect(l.stack.length).toEqual(2);
      expect(l.stack.indexOf(pin)).toEqual(1);
      expect(l.stack.indexOf(pin2)).toEqual(0);
    });

    it('should move pin on stack among more pins', function () {
      var l = this.l;
      var pin = pinTile();
      var feed = feedTile();
      l.add(appTile());
      l.add(feedTile());
      l.add(feed);
      l.add(appTile());
      l.add(pinTile());
      l.add(pinTile());
      l.add(pin);
      l.add(feedTile());

      var feedIndex = l.stack.indexOf(feed);
      l.move(pin, feedIndex);
      expect(l.stack.indexOf(pin)).toEqual(feedIndex);
      expect(l.stack.indexOf(feed)).toEqual(feedIndex + 1);
    });


    it('should move pin to the end on undefined  destination', function () {
      var l = this.l;
      var pin = pinTile();
      l.add(appTile());
      l.add(feedTile());
      l.add(appTile());
      l.add(pinTile());
      l.add(pinTile());
      l.add(pin);
      l.add(feedTile());

      l.move(pin);
      expect(l.stack.indexOf(pin)).toEqual(l.stack.length - 1);
    });

    it('should handle pin move on incorrect destination stack coordinate', function () {
      var l = this.l;
      var pin = pinTile();
      l.add(feedTile());
      l.add(pinTile());
      l.add(pinTile());
      l.add(pin);
      l.add(feedTile());
      l.add(feedTile());
      l.add(feedTile());

      l.move(pin, 142);
      expect(l.stack.indexOf(pin)).toEqual(l.stack.length - 1);
    });

    it('should swap two pins on the matrix', function () {
      var l = this.l,
        pin = pinTile(),
        feed = feedTile();

      l.add(feed);
      l.add(pin);

      l.move(pin, 0);
      l.rebuild();

      var result = [
        [pin, feed, feed, feed, null],
        [null, feed, feed, feed, null]
      ];
      dumpLayout(this.l);
      expect(l.matrix.get()).toEqual(result);
      expect(pin.position).toEqual(position(0, 0));
      expect(feed.position).toEqual(position(1, 0));
    });


    it('should rebuild matrix according to the algorithm on stack change', function () {
      this.l = new Pocketry.Layout(9, 2);
      var tiles = [
        appTile(),
        pinTile(),
        pinTile(),
        pinTile(),
        feedTile(),
        feedTile(),
        pinTile(),
        pinTile(),
        appTile(),
        feedTile(),
        appTile()
      ];

      function o(tileId) {
        return tiles[tileId - 1];
      }

      var app = pin = fid = o;

      var result = [
        [app(1), app(1), pin(2), pin(3), fid(5), fid(5), fid(5), null, null],
        [app(1), app(1), pin(4), null, fid(5), fid(5), fid(5), null, null],
        [fid(6), fid(6), fid(6), pin(7), pin(8), app(9), app(9), null, null],
        [fid(6), fid(6), fid(6), null, null, app(9), app(9), null, null],
        [fid(10), fid(10), fid(10), app(11), app(11), null, null, null, null],
        [fid(10), fid(10), fid(10), app(11), app(11), null, null, null, null]
      ];

      var l = this.l;
      tiles.forEach(function (tile) {
        l.add(tile);
      });
      expect(this.l.matrix.get()).toEqual(result);

      dumpLayout(this.l, 'Init matrix');

      l.move(pin(4), 7);
      l.rebuild();

      var expectedResult = [
        [app(1), app(1), pin(2), pin(3), fid(5), fid(5), fid(5), null, null],
        [app(1), app(1), null, null, fid(5), fid(5), fid(5), null, null],
        [fid(6), fid(6), fid(6), pin(7), pin(8), app(9), app(9), null, null],
        [fid(6), fid(6), fid(6), pin(4), null, app(9), app(9), null, null],
        [fid(10), fid(10), fid(10), app(11), app(11), null, null, null, null],
        [fid(10), fid(10), fid(10), app(11), app(11), null, null, null, null]
      ];

      dumpLayout(this.l, 'After move 4 -> 7');
      expect(l.matrix.get()).toEqual(expectedResult);
      expect(pin(7).position).toEqual(position(3, 2));
      expect(pin(8).position).toEqual(position(4, 2));
      expect(pin(10).position).toEqual(position(0, 4));
      expect(pin(4).position).toEqual(position(3, 3));
    });

    it('should add single pin to the layout', function () {
      this.l = new Pocketry.Layout(11, 2);
      var tiles = [
        appTile(), //1
        pinTile(), //2
        pinTile(), //3
        pinTile(), //4
        feedTile(), //5
        feedTile(), //6
        pinTile(), //7
        pinTile(), //8
        appTile(), //9
        feedTile(), //10
        appTile() //11
      ];

      function o(tileId) {
        return tiles[tileId - 1];
      }

      var app = pin = fid = o;

      var result = [
        [app(1), app(1), pin(2), pin(3), fid(5), fid(5), fid(5), fid(6), fid(6), fid(6), pin(7)],
        [app(1), app(1), pin(4), null, fid(5), fid(5), fid(5), fid(6), fid(6), fid(6), pin(8)],
        [app(9), app(9), fid(10), fid(10), fid(10), app(11), app(11), null, null, null, null],
        [app(9), app(9), fid(10), fid(10), fid(10), app(11), app(11), null, null, null, null]
      ];

      var afterMove = [
        [app(1), app(1), pin(2), pin(3), fid(5), fid(5), fid(5), pin(7), fid(6), fid(6), fid(6) ],
        [app(1), app(1), pin(4), null, fid(5), fid(5), fid(5), null, fid(6), fid(6), fid(6) ],
        [pin(8), app(9), app(9), fid(10), fid(10), fid(10), app(11), app(11), null, null, null],
        [null, app(9), app(9), fid(10), fid(10), fid(10), app(11), app(11), null, null, null]
      ];

      var l = this.l;
      tiles.forEach(function (tile) {
        l.add(tile);
      });
      dumpLayout(this.l, 'Initial matrix');
      expect(this.l.matrix.get()).toEqual(result);

      l.move(pin(7), 5);
      l.rebuild();
      dumpLayout(this.l, 'Moved 7 -> 5');
      expect(this.l.matrix.get()).toEqual(afterMove);
    });
  });

  describe('Layout.moveTo', function () {
    it('should move pin to the left of app', function () {
      var pin = pinTile(),
        app = appTile(),
        pin2 = pinTile();

      this.l.add(pin);
      this.l.add(app);
      this.l.add(pin2);

      var result = [
        [pin, pin2, app, app, null],
        [null, null, app, app, null],
      ];

      this.l.moveTo(pin2, {x: 1, y: 0});
      dumpLayout(this.l, 'Moved pin -> app left');
      expect(this.l.stack).toEqual([pin, pin2, app]);
      expect(this.l.matrix.get()).toEqual(result);
    });

    it('should move pin to the right of app', function () {
      var pin = pinTile(),
        app = appTile(),
        pin2 = pinTile();

      this.l.add(pin);
      this.l.add(pin2);
      this.l.add(app);

      var result = [
        [pin, app, app, pin2, null],
        [null,app, app, null, null],
      ];

      this.l.moveTo(pin2, {x: 3, y: 1});
      dumpLayout(this.l, 'Moved pin -> app right');
      expect(this.l.stack).toEqual([pin, app, pin2]);
      expect(this.l.matrix.get()).toEqual(result);
    });

    it('should move pin to empty cell', function () {
      var pin = pinTile(),
        app = appTile(),
        pin2 = pinTile();

      this.l.add(pin);
      this.l.add(app);
      this.l.add(pin2);

      var result = [
        [pin, pin2, app, app, null],
        [null,null, app, app, null],
      ];

      this.l.moveTo(pin2, {x: 0, y: 1});
      dumpLayout(this.l, 'Moved pin -> empty');
      expect(this.l.stack).toEqual([pin, pin2, app]);
      expect(this.l.matrix.get()).toEqual(result);
    });

  });

});