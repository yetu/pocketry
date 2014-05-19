/*jslint sloppy:true */
/*global describe, xdescribe, it, xit, expect, beforeEach, afterEach,
 Matrix, Pocketry */
describe('Layout suite', function () {

  function collectSelectionDump(selection, collector) {
    var arr = [];
    for (var i = 0; i < selection.matrix.size()[0]; i++) {
      for (var j = 0; j < selection.matrix.size()[1]; j++) {
        if (!arr[i]) {
          arr[i] = []
        }
        arr[i][j] = '_';
        if (i >= selection.row.start && i < selection.row.end &&
          j >= selection.col.start && j < selection.col.end) {
          arr[i][j] = 'X';
        }
      }
    }
    collector.push(arr);
  }

  function serializeDump(collector) {
    var result = '\n';
    var mess = [];
    collector.forEach(function (arr) {
      arr.forEach(function (row, rowId) {
        if (!mess[rowId]) {
          mess[rowId] = [];
        }
        var str = row.join('');
        str += ' ';
        mess[rowId].push(str)
      });
    });

    mess.forEach(function (row) {
      result += row.join('');
      result += '\n';
    });
    return result;
  }

  beforeEach(function () {
    this.colCount = 5;
    this.rowSpan = 2;
    this.l = new Pocketry.Layout(this.colCount, this.rowSpan);
  });

  it('should create underlying matrix ' +
    'with respect to rowSpan and colCount',
    function () {
      expect(this.l.matrix).toBeDefined();

      var sz = this.l.matrix.size();
      expect(sz[0]).toBe(this.rowSpan);
      expect(sz[1]).toBe(this.colCount);
    });

  it('.extend should add rows to matrix accroding to rowSpan', function () {
    var oldSize = this.l.matrix.size();
    this.l.extend();
    expect(this.l.matrix.size()[0]).toEqual(oldSize[0] + this.rowSpan);
  });

  describe('.walk', function () {
    var iterations,
      dump;

    beforeEach(function () {
      iterations = 0;
      dump = [];
    });

    afterEach(function () {
      console.log(serializeDump(dump));
    });

    function countIterations(selection) {
      collectSelectionDump(selection, dump);
      iterations++;
    }

    function stopAfter3(selection) {
      iterations++;
      return iterations === 3;
    }

    it('should iterate over 10 cells if stepSize = 1x1',
      function () {
        this.l.walk(countIterations, [1, 1]);
        expect(iterations).toBe(10);
      });

    it('should iterate over 8 cells if stepSize = 2x1',
      function () {
        this.l.walk(countIterations, [2, 1]);
        expect(iterations).toBe(8);
      });

    it('should iterate over 2 cells if stepSize = 5x1',
      function () {
        this.l.walk(countIterations, [5, 1]);
        expect(iterations).toBe(2);
      });

    it('should iterate over 4 cells if stepSize = 2x2',
      function () {
        this.l.walk(countIterations, [2, 2]);
        expect(iterations).toBe(4);
      });

    it('should iterate over 3 cells if stepSize = 3x2',
      function () {
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(3);
      });

    it('should iterate over 9 cells if stepSize = 3x2 and matrix size = 4x5',
      function () {
        this.l.extend();
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(9);
      });

    it('should stop when predicate returns true',
      function () {
        this.l.walk(stopAfter3);
        expect(iterations).toBe(3);
      });
  });

  describe('.add', function () {

    function tileCreator(type) {
      return function () {
        return Object.create(type);
      }
    }

    function position(x, y) {

      return {x: x, y: y};
    }

    var appTile = tileCreator(Pocketry.TILES.app);
    var pinTile = tileCreator(Pocketry.TILES.pin);
    var feedTile = tileCreator(Pocketry.TILES.feed);

    it('should add single pin to the layout', function () {

      var pin = pinTile();

      var result = [
        [pin, null, null, null, null],
        [null, null, null, null, null]
      ];

      this.l.add(pin);
      expect(this.l.matrix.get()).toEqual(result);
      expect(pin.position).toEqual(position(0, 0));
    });

    it('should add pin and app tiles', function () {
      var pin = pinTile();
      var app = appTile();

      var result = [
        [pin, app, app, null, null],
        [null, app, app, null, null]
      ];

      this.l.add(pin);
      this.l.add(app);
      expect(this.l.matrix.get()).toEqual(result);
      expect(pin.position).toEqual(position(0,0));
      expect(app.position).toEqual(position(1,0));
    });

    it('should add feed and app tiles', function () {
      var feed = feedTile();
      var app = appTile();

      var result = [
        [feed, feed, feed, app, app],
        [feed, feed, feed, app, app]
      ];

      this.l.add(feed);
      this.l.add(app);
      expect(this.l.matrix.get()).toEqual(result);
      expect(feed.position).toEqual(position(0,0));
      expect(app.position).toEqual(position(3,0));
    });

    it('should add 2 feed tiles', function () {
      var feed = feedTile();
      var f33d = feedTile();

      var result = [
        [feed, feed, feed, null, null],
        [feed, feed, feed, null, null],
        [f33d, f33d, f33d, null, null],
        [f33d, f33d, f33d, null, null]
      ];

      this.l.add(feed);
      this.l.add(f33d);
      expect(this.l.matrix.get()).toEqual(result);
      expect(feed.position).toEqual(position(0,0));
      expect(f33d.position).toEqual(position(0,2));
    });

    it('should add 2 feed, app and pin tiles', function () {
      var feed = feedTile();
      var f33d = feedTile();
      var pin = pinTile();
      var app = appTile();

      var result = [
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
      expect(feed.position).toEqual(position(0,0));
      expect(f33d.position).toEqual(position(0,2));
      expect(pin.position).toEqual(position(3,0));
      expect(app.position).toEqual(position(3,1));
    });
  });
});