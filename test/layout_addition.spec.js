/*jslint sloppy:true, nomen:true */
/*global jasmine, describe, xdescribe, it, xit,
 expect, beforeEach, afterEach,
 Pocketry */
describe('.add', function () {
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

  function dumpLayout(layout) {
    var arr = layout.matrix.get().map(function (row) {
      return row.map(function (tile) {
        return tile ? tile.id : 0;
      });
    });
    var str = '\n';
    arr.forEach(function (row) {
      row.forEach(function (val) {
        str += (val ? val : 0);
      });
      str += '\n';
    });
    console.log(str);
  }

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
        [feed, feed, feed, pin, null],
        [feed, feed, feed, app, app],
        [f33d, f33d, f33d, app, app],
        [f33d, f33d, f33d, null, null]
      ];

    this.l.add(feed);
    this.l.add(f33d);
    this.l.add(pin);
    this.l.add(app);
    expect(this.l.matrix.get()).toEqual(result);
    expect(feed.position).toEqual(position(0, 0));
    expect(f33d.position).toEqual(position(0, 2));
    expect(pin.position).toEqual(position(3, 0));
    expect(app.position).toEqual(position(3, 1));
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
      appTile(),
    ];

    function o(tileId) {
      return tiles[tileId - 1];
    }

    var app = pin = fid = o;


    var result = [
      [app(1), app(1), pin(2), pin(3), fid(5), fid(5), fid(5), app(11), app(11)],
      [app(1), app(1), pin(4), pin(7), fid(5), fid(5), fid(5), app(11), app(11)],
      [fid(6), fid(6), fid(6), pin(8), app(9), app(9), fid(10), fid(10), fid(10)],
      [fid(6), fid(6), fid(6), null, app(9), app(9), fid(10), fid(10), fid(10)]
    ];

    var l = this.l;
    tiles.forEach(function (tile) {
      l.add(tile);
    });
    dumpLayout(this.l);
    expect(this.l.matrix.get()).toEqual(result);
    expect(fid(11).position).toEqual(position(7, 0));
  })
});