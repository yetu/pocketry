/*jslint sloppy:true */
/*global describe, xdescribe, it, xit, expect, beforeEach, afterEach,
 Matrix, Pocketry */
describe('Layout suite', function () {

  function dumpSelection(selection) {
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
    var str = '\n';
    arr.forEach(function (row) {
      str += row.join('');
      str += '\n';
    });
    console.log(str);
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
    var iterations = 0;
    beforeEach(function () {
      iterations = 0;
    });

    function countIterations(selection) {
      dumpSelection(selection);
      iterations++;
    }

    function stopAfter3(selection) {
      iterations++;
      return iterations === 3;
    }

    it('.walk should iterate over 10 cells if stepSize = 1x1',
      function () {
        this.l.walk(undefined, countIterations, [1, 1]);
        expect(iterations).toBe(10);
      });

    it('.walk should iterate over 8 cells if stepSize = 2x1',
      function () {
        this.l.walk(undefined, countIterations, [2, 1]);
        expect(iterations).toBe(8);
      });

    it('.walk should iterate over 2 cells if stepSize = 5x1',
      function () {
        this.l.walk(undefined, countIterations, [5, 1]);
        expect(iterations).toBe(2);
      });

    it('.walk should iterate over 4 cells if stepSize = 2x2',
      function () {
        this.l.walk(undefined, countIterations, [2, 2]);
        expect(iterations).toBe(4);
      });

    it('.walk should iterate over 3 cells if stepSize = 3x2',
      function () {
        this.l.walk(undefined, countIterations, [3, 2]);
        expect(iterations).toBe(3);
      });

    it('.walk should stop when predicate returns true',
      function () {
        this.l.walk(undefined, stopAfter3);
        expect(iterations).toBe(3);
      });
  });

  describe('.add', function () {

    function tileCreator(type) {
      return function () {
        return Object.create(type);
      }
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
      expect(this.l.matrix.get()).toEqual(result)
    });
  });
});