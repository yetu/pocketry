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

    it('should iterate over 15 cells if stepSize = 3x2 and matrix size = 5x6',
      function () {
        this.l.extend();
        this.l.extend();
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(15);
      });

    it('should iterate over 16 cells if stepSize = 3x2 and matrix size = 3x10',
      function () {
        this.l = new Pocketry.Layout(10, 3);
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(16);
      });

    it('should iterate over 9 cells if stepSize = 3x2 and matrix size = 10x3',
      function () {
        this.l = new Pocketry.Layout(3, 10);
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(9);
      });

    it('should stop when predicate returns true',
      function () {
        this.l.walk(stopAfter3);
        expect(iterations).toBe(3);
      });
  });
});