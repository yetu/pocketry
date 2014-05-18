/*jslint sloppy:true, nomen:true */
/*global jasmine, describe, xdescribe, it, xit, expect, beforeEach,
 Matrix */
describe('Matrix', function () {
  var arr, m;

  function id(x) {
    return x;
  }

  beforeEach(function () {
    arr = [
      [1, 2, 3, 4, 5],
      [9, 8, 7, 6, 5],
      [10, 11, 12, 13, 14]
    ];

    m = new Matrix(arr);
  });

  it('should have a Matrix constructor', function () {
    expect(Matrix).toBeDefined();
  });

  it('should wrap an array matrix ', function () {
    expect(new Matrix(arr)._).toEqual(arr);
  });

  describe('.get', function () {
    it('should get an element by index', function () {
      expect(new Matrix(arr).get(1, 0)).toEqual(9);
    });

    it('should get an undefined value on virtual element', function () {
      expect(m.get(100, 100)).toBeUndefined();
    });

    it('should return value when specified 2 args', function () {
      expect(m.get(1, 1)).toEqual(arr[1][1]);
    });

    it('should return a row when specified 1 arg', function () {
      expect(m.get(1)).toEqual(arr[1]);
    });

    it('should return an array matrix when no args specified ',
      function () {
        expect(m.get()).toEqual(arr);
      });

    it('should return correct array when cells are empty', function () {
      arr = [
        [null, null],
        [null, null]
      ];

      m = new Matrix(arr);

      expect(m.get()).toEqual(arr);
    });
  });

  it('should have method to set values', function () {
    m.put(1, 1, 101);
    expect(m.get(1, 1)).toEqual(101);
  });

  it('.map should iterate and write each real matrix cell', function () {
    var result = [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1]
    ];

    expect(m.map(function (val) {
      return 1;
    }).get()).toEqual(result);
  });

  it('should have method to get matrix size', function () {
    expect(m.size()).toEqual([arr.length, arr[0].length]);
  });

  it('.each should iterate over all matrix values', function () {
    var iterations = 0;
    m.each(function (val, rowId, colId) {
      expect(val).toEqual(arr[rowId][colId]);
      iterations++;
    });
    expect(iterations).toEqual(m.size()[0] * m.size()[1]);
  });

  describe('.some', function () {
    it('method `some` should return true ' +
      'if predicate match on any matrix value',
      function () {
        expect(m.some(function (val) {
          return val === 7;
        })).toBeTruthy();
      });

    it('method `some` should return false ' +
      'if predicate does not match on some matrix value',
      function () {
        expect(m.some(function (val) {
          return val === 11111;
        })).toBeFalsy();
      });
  });

  describe('MatrixSelection', function () {
    it('.val should get the current selection values', function () {
      expect(m.rows(100).cols(100).val()).toBeUndefined();
    });

    describe('.each', function () {
      it('should iterate over all selected values (real and virtual)', function () {
        var iterations = 0;
        m.rows(0, 9).cols(1, 3).each(function (val, row, col) {
          expect(m.get(row, col)).toEqual(val);
          iterations++;
        });
        expect(iterations).toEqual(30);
      });
    });

    describe('.map', function () {
      it('should return a matrix instance', function () {
        expect(m.rows(0).cols(0).map(function () {
          return 1;
        })).toEqual(jasmine.any(Matrix));
        return;
      });

      it('should write each function result value to each cell', function () {
        arr[0] = [1, 1, 1, 1, 1];
        expect(m.rows(0).map(function () {
          return 1;
        }).get()).toEqual(arr);
      });

      it('.map.matrix.get() should return correct array', function () {
        arr = [
          [1, 1],
          [1, 1]
        ];

        m = new Matrix();
        m.rows(0, 1).cols(0, 1).map(function () {
          return 1;
        });
        expect(m.get()).toEqual(arr);
      });

      it('should create empty cell when no function is specified', function () {
        var m = new Matrix(),
          result = [
            [null, null],
            [null, null]
          ];

        m.rows(0, 1).cols(0, 1).map();
        expect(m.get()).toEqual(result);
      });
    });

    describe('.some', function () {
      it('should return true if predicate match on any matrix value',
        function () {
          expect(m.rows(1).cols(0, 3).some(function (val) {
            return val === 7;
          })).toBeTruthy();
        });

      it('should return false if predicate does not match on some matrix value',
        function () {
          expect(m.rows(1).cols(0, 3).some(function (val) {
            return val === 1;
          })).toBeFalsy();
        });
    });
  });
});