/*jslint sloppy:true, nomen:true */
/*global describe, it, expect, Matrix, beforeEach */
describe('Matrix suite', function () {
  var arr, m;

  function id(x) {
    return x;
  }

  beforeEach(function () {
    arr = [
      [1, 2, 3, 4, 5],
      [9, 8, 7, 6, 5]
    ];

    m = new Matrix(arr);
  });

  it('should have a Matrix constructor', function () {
    expect(Matrix).toBeDefined();
  });

  it('should wrap an array matrix ', function () {
    expect(new Matrix(arr)._).toEqual(arr);
  });

  it('should get an element by index', function () {
    expect(new Matrix(arr).get(1, 0)).toEqual(9);
  });

  it('should has selection methods to choose rows and columns', function () {
    expect(m.rows(1).isRowSelected(1)).toBeTruthy();
    expect(m.rows(1).isRowSelected(0)).toBeFalsy();
    expect(m.rows(0).isRowSelected(0)).toBeTruthy();
    expect(m.rows(0).isRowSelected(1)).toBeFalsy();
  });

  it('should has map method returning the mapped matrix values', function () {
    var sub = [
      2, 3, 4
    ];

    m.rows(0).cols(1, 3).map(id)[0].forEach(function (val, idx) {
      expect(val).toBe(sub[idx]);
    });

  });

  it('method `some` should return true ' +
    'if predicate match on any matrix value',
    function () {
      expect(m.rows(1).cols(0, 3).some(function (val) {
        return val === 7;
      })).toBeTruthy();
    });

  it('method `some` should return false ' +
    'if predicate does not match on some matrix value',
    function () {
      expect(m.rows(1).cols(0, 3).some(function (val) {
        return val === 1;
      })).toBeFalsy();
    });

  it('method `each` should iterate over each selected matrix value', function () {
    m.rows(0).cols(1, 3).each(function (val, rowIdx, colIdx) {
      expect(m.get(rowIdx, colIdx)).toEqual(val);
    });
  });

  it('`each` iterator should overwrite wrapped values', function () {
    m.rows(0, 0).cols(0, 0).each(function (val, rowId, colId, put) {
      put(101);
    });

    expect(m.get(0, 0)).toEqual(101);
  });

  it('`each` should write into empty virtual cells', function () {
    m = new Matrix();

    var arr = [
      [1, 1],
      [2, 2]
    ];

    m.rows(0, 1).cols(0, 1).each(function (val, rid, cid, put) {
      put(rid + 1);
    });

    expect(m.get()).toEqual(arr);
  });


  it('should have method to set values', function () {
    m.put(1, 1, 101);
    expect(m.get(1, 1)).toEqual(101);
  });

  it('should have method to get matrix size', function () {
    expect(m.size()).toEqual([arr.length, arr[0].length]);
  });

  it('should have method to add rows', function () {
    var oldSize = m.size(),
      newSize = [
        oldSize[0] + 1,
        oldSize[1]
      ];
    expect(m.appendRow().size()).toEqual(newSize);
  });

  it('should append specified row to the matrix', function () {
    var row = [12, 13, 14, 15, 16];
    m.appendRow(row);
    expect(m.rows(2, 2).map(id)[0]).toEqual(row);
  });

  it('method `get` should return value when specified 2 args', function () {
    expect(m.get(1, 1)).toEqual(arr[1][1]);
  });

  it('method `get` should return a row when specified 1 arg', function () {
    expect(m.get(1)).toEqual(arr[1]);
  });

  it('method `get` should return an array matrix' +
    ' when no args specified ',
    function () {
      expect(m.get()).toBe(arr);
    });

});