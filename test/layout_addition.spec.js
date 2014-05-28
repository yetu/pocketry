/*jslint sloppy:true, nomen:true */
/*global jasmine, describe, xdescribe, it, xit,
 expect, beforeEach, afterEach,
 Pocketry */
describe('Layout calc: ', function () {
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

  describe('Layout.add', function () {
    it('should add single pin to the layout', function () {

      var pin = pinTile(),
        result = [
          [pin, null, null, null, null],
          [null, null, null, null, null]
        ];

      this.l.add(pin);
      expect(this.l.matrix.get()).toEqual(result);
      expect(pin.position).toEqual(position(0, 0));
    });

    it('should add pin and app tiles', function () {
      var pin = pinTile(),
        app = appTile(),

        result = [
          [pin, app, app, null, null],
          [null, app, app, null, null]
        ];

      this.l.add(pin);
      this.l.add(app);
      expect(this.l.matrix.get()).toEqual(result);
      expect(pin.position).toEqual(position(0, 0));
      expect(app.position).toEqual(position(1, 0));
    });

    it('should add feed and app tiles', function () {
      var feed = feedTile(),
        app = appTile(),

        result = [
          [feed, feed, feed, app, app],
          [feed, feed, feed, app, app]
        ];

      this.l.add(feed);
      this.l.add(app);
      expect(this.l.matrix.get()).toEqual(result);
      expect(feed.position).toEqual(position(0, 0));
      expect(app.position).toEqual(position(3, 0));
    });

    it('should add 2 feed tiles', function () {
      var feed = feedTile(),
        f33d = feedTile(),

        result = [
          [feed, feed, feed, null, null],
          [feed, feed, feed, null, null],
          [f33d, f33d, f33d, null, null],
          [f33d, f33d, f33d, null, null]
        ];

      this.l.add(feed);
      this.l.add(f33d);
      expect(this.l.matrix.get()).toEqual(result);
      expect(feed.position).toEqual(position(0, 0));
      expect(f33d.position).toEqual(position(0, 2));
    });

    it('should add 2 feed, app and pin tiles', function () {
      var feed = feedTile(),
        f33d = feedTile(),
        pin = pinTile(),
        app = appTile(),

        result = [
          [feed, feed, feed, null, null],
          [feed, feed, feed, null, null],
          [f33d, f33d, f33d, pin, null],
          [f33d, f33d, f33d, null, null],
          [app, app, null, null, null],
          [app, app, null, null, null]
        ];

      this.l.add(feed);
      this.l.add(f33d);
      this.l.add(pin);
      this.l.add(app);
      dumpLayout(this.l);
      expect(this.l.matrix.get()).toEqual(result);
      expect(feed.position).toEqual(position(0, 0));
      expect(f33d.position).toEqual(position(0, 2));
      expect(pin.position).toEqual(position(3, 2));
      expect(app.position).toEqual(position(0, 4));
    });

    it('should add 2 apps and 2 feeds to a 4x2 layout', function () {
      this.l = new Pocketry.Layout(4, 2);
      var app = appTile(),
        aππ = appTile(),
        feed = feedTile(),
        f33d = feedTile(),


        result = [
          [app, app, aππ, aππ],
          [app, app, aππ, aππ],
          [feed, feed, feed, null],
          [feed, feed, feed, null],
          [f33d, f33d, f33d, null],
          [f33d, f33d, f33d, null]
        ];

      this.l.add(app);
      this.l.add(aππ);
      this.l.add(feed);
      this.l.add(f33d);
      dumpLayout(this.l);
      expect(this.l.matrix.get()).toEqual(result);
      expect(f33d.position).toEqual(position(0, 4));
    });

    it('should add a set of tiles to a 9x2 layout', function () {
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
        [fid(6), fid(6), fid(6), pin(7), app(9), app(9), fid(10), fid(10), fid(10)],
        [fid(6), fid(6), fid(6), pin(8), app(9), app(9), fid(10), fid(10), fid(10)],
        [app(11), app(11), null, null, null, null, null, null, null],
        [app(11), app(11), null, null, null, null, null, null, null]
      ];

      var l = this.l;
      tiles.forEach(function (tile) {
        l.add(tile);
      });
      dumpLayout(this.l);
      expect(this.l.matrix.get()).toEqual(result);
      expect(pin(7).position).toEqual(position(3, 2));
      expect(pin(8).position).toEqual(position(3, 3));
      expect(pin(10).position).toEqual(position(6, 2));
    });

    it('should add a set of tiles in rows based on rowSpan', function () {
      var l = new Pocketry.Layout(5, 2);
      var pin = pinTile();
      var pin2 = pinTile();
      var app = appTile();
      var app2 = appTile();

      var result = [
        [pin, pin2, app, app, null],
        [null, null, app, app, null],
        [app2, app2, null, null, null],
        [app2, app2, null, null, null]
      ];

      l.add(pin);
      l.add(pin2);
      l.add(app);
      l.add(app2);

      dumpLayout(l);
      expect(l.matrix.get()).toEqual(result);
    })
  });

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
        [fid(6), fid(6), fid(6), pin(7), app(9), app(9), fid(10), fid(10), fid(10)],
        [fid(6), fid(6), fid(6), pin(8), app(9), app(9), fid(10), fid(10), fid(10)],
        [app(11), app(11), null, null, null, null, null, null, null],
        [app(11), app(11), null, null, null, null, null, null, null]
      ];

      var l = this.l;
      tiles.forEach(function (tile) {
        l.add(tile);
      });
      expect(this.l.matrix.get()).toEqual(result);

      dumpLayout(this.l, 'Init matrix');

      l.move(pin(4), 9);
      l.rebuild();

      var expectedResult = [
        [app(1), app(1), pin(2), pin(3), fid(5), fid(5), fid(5), null, null],
        [app(1), app(1), null, null, fid(5), fid(5), fid(5), null, null],
        [fid(6), fid(6), fid(6), pin(7), app(9), app(9), fid(10), fid(10), fid(10)],
        [fid(6), fid(6), fid(6), pin(8), app(9), app(9), fid(10), fid(10), fid(10)],
        [pin(4), app(11), app(11), null, null, null, null, null, null],
        [null, app(11), app(11), null, null, null, null, null, null]
      ];

      dumpLayout(this.l, 'After move 4 -> 9');
      expect(l.matrix.get()).toEqual(expectedResult);
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

      /*
       □ #1	□ #1	○ #2	○ #3	▭ #5	▭ #5	▭ #5	▭ #6	▭ #6	▭ #6	○ #8
       □ #1	□ #1	○ #4	○ #7	▭ #5	▭ #5	▭ #5	▭ #6	▭ #6	▭ #6
       □ #9	□ #9	▭ #10	▭ #10	▭ #10	□ #11	□ #11
       □ #9	□ #9	▭ #10	▭ #10	▭ #10	□ #11	□ #11
       */
      //TODO proof of strange behaviour
      var result = [
        [app(1), app(1), pin(2), pin(3), fid(5), fid(5), fid(5), fid(6), fid(6), fid(6), pin(8)],
        [app(1), app(1), pin(4), pin(7), fid(5), fid(5), fid(5), fid(6), fid(6), fid(6), null],
        [app(9), app(9), fid(10), fid(10), fid(10), app(11), app(11), null, null, null, null],
        [app(9), app(9), fid(10), fid(10), fid(10), app(11), app(11), null, null, null, null]
      ];

      var l = this.l;
      tiles.forEach(function (tile) {
        l.add(tile);
      });
      dumpLayout(this.l, 'Initial matrix');
      expect(this.l.matrix.get()).toEqual(result);

      l.move(pin(7),5);
      l.rebuild();
      dumpLayout(this.l, 'Moved 7 -> 6');
    });
  })
});