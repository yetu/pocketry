/*jslint sloppy:true, nomen:true */
/*global jasmine, describe, xdescribe, it, xit,
 expect, beforeEach, afterEach,
 Pocketry */
describe('Layout Scan algo', function () {
  describe('.walk', function () {
    var iterations,
      steps,
      _ = '_', // helper var
      dump;

    beforeEach(function () {
      iterations = 0;
      dump = [];
      steps = [];

      this.colCount = 5;
      this.rowSpan = 2;
      this.l = new Pocketry.Layout(this.colCount, this.rowSpan);
    });

    function collectSelectionDump(selection, collector) {
      var arr = [];
      for (var i = 0; i < selection.matrix.size()[0]; i++) {
        for (var j = 0; j < selection.matrix.size()[1]; j++) {
          if (!arr[i]) {
            arr[i] = []
          }
          arr[i][j] = _;
          if (i >= selection.row.start && i < selection.row.end &&
            j >= selection.col.start && j < selection.col.end) {
            arr[i][j] = 'X';
          }
        }
      }
      collector.push(arr);
    }

    function collectSteps(selection, idx, collector) {
      var arr = collector;
      for (var i = 0; i < selection.matrix.size()[0]; i++) {
        for (var j = 0; j < selection.matrix.size()[1]; j++) {
          if (!arr[i]) {
            arr[i] = []
          }
          if (arr[i][j] === undefined) {
            arr[i][j] = _;
          }
          if (i === selection.row.start && j === selection.col.start) {
            arr[i][j] = idx + 1;
          }
        }
      }
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

    function serialize(arr) {
      var result = '\n';
      arr.forEach(function (row) {
        row.forEach(function (col) {
          if (col === _) {
            result += '  _';
          } else {
            result += (col < 10 ? '  ' : ' ') + col;
          }
        });
        result += '\n';
      });
      return result;
    }

    afterEach(function () {
      console.log(serializeDump(dump));
      console.log(serialize(steps));
    });

    function countIterations(selection) {
      collectSelectionDump(selection, dump);
      collectSteps(selection, iterations, steps);
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

        var expectedSteps = [
          [1, 3, 5, 7, 9],
          [2, 4, 6, 8, 10]
        ];
        expect(steps).toEqual(expectedSteps);
      });

    it('should iterate over 8 cells if stepSize = 2x1',
      function () {
        this.l.walk(countIterations, [2, 1]);
        expect(iterations).toBe(8);

        var expectedSteps = [
          [1, 3, 5, 7, _],
          [2, 4, 6, 8, _]
        ];
        expect(steps).toEqual(expectedSteps);
      });

    it('should iterate over 2 cells if stepSize = 5x1',
      function () {
        this.l.walk(countIterations, [5, 1]);
        expect(iterations).toBe(2);

        var expectedSteps = [
          [1, _, _, _, _],
          [2, _, _, _, _]
        ];
        expect(steps).toEqual(expectedSteps);
      });

    it('should iterate over 4 cells if stepSize = 2x2',
      function () {
        this.l.walk(countIterations, [2, 2]);
        expect(iterations).toBe(4);

        var expectedSteps = [
          [1, 2, 3, 4, _],
          [_, _, _, _, _]
        ];
        expect(steps).toEqual(expectedSteps);
      });

    it('should iterate over 3 cells if stepSize = 3x2',
      function () {
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(3);

        var expectedSteps = [
          [1, 2, 3, _, _],
          [_, _, _, _, _]
        ];
        expect(steps).toEqual(expectedSteps);
      });

    it('should iterate over 6 cells if stepSize = 3x2 and matrix size = 5x2 with 1 extend',
      function () {
        this.l.extend();
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(6);

        var expectedSteps = [
          [1, 2, 3, _, _],
          [_, _, _, _, _],
          [4, 5, 6, _, _],
          [_, _, _, _, _]
        ];
        expect(steps).toEqual(expectedSteps);

      });

    it('should iterate over 9 cells if stepSize = 3x2 and matrix size = 5x2 with 2 extends',
      function () {
        this.l.extend();
        this.l.extend();
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(9);

        var expectedSteps = [
          [1, 2, 3, _, _],
          [_, _, _, _, _],
          [4, 5, 6, _, _],
          [_, _, _, _, _],
          [7, 8, 9, _, _],
          [_, _, _, _, _]
        ];
        expect(steps).toEqual(expectedSteps);
      });

    it('should iterate over 16 cells if stepSize = 3x2 and matrix size = 3x10',
      function () {
        this.l = new Pocketry.Layout(10, 3);
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(16);

        var expectedSteps = [
          [1, 3, 5, 7, 9, 11, 13, 15, _, _],
          [2, 4, 6, 8, 10, 12, 14, 16, _, _],
          [_, _, _, _, _, _, _, _, _, _]
        ];

        expect(steps).toEqual(expectedSteps);
      });

    it('should iterate over 9 cells if stepSize = 3x2 and matrix size = 10x3',
      function () {
        this.l = new Pocketry.Layout(3, 10);
        this.l.walk(countIterations, [3, 2]);
        expect(iterations).toBe(9);

        var expectedSteps = [
          [1, _, _],
          [2, _, _],
          [3, _, _],
          [4, _, _],
          [5, _, _],
          [6, _, _],
          [7, _, _],
          [8, _, _],
          [9, _, _],
          [_, _, _]
        ];

        expect(steps).toEqual(expectedSteps);
      });

    it('should iterate over 9 cells if stepSize = 2x2 and matrix size = 4x4',
      function () {
        this.l = new Pocketry.Layout(4, 4);
        this.l.walk(countIterations, [2, 2]);
        expect(iterations).toBe(9);

        var expectedSteps = [
          [1, 4, 7, _],
          [2, 5, 8, _],
          [3, 6, 9, _],
          [_, _, _, _]
        ];

        expect(steps).toEqual(expectedSteps);
      });

    it('should stop when predicate returns true',
      function () {
        this.l.walk(stopAfter3);
        expect(iterations).toBe(3);
      });
  });

});