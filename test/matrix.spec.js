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
    expect(m.rows(1, 1).isRowSelected(1)).toBeTruthy();
    expect(m.rows(1, 1).isRowSelected(0)).toBeFalsy();
    expect(m.rows(0, 0).isRowSelected(0)).toBeTruthy();
    expect(m.rows(0, 0).isRowSelected(1)).toBeFalsy();
  });

  it('should has map method returning the mapped matrix values', function () {
    var sub = [
      2, 3, 4
    ];

    m.rows(0, 0).cols(1, 3).map(id)[0].forEach(function (val, idx) {
      expect(val).toBe(sub[idx]);
    });

  });

  it('method `some` should return true ' +
    'if predicate match on any matrix value', function () {
    expect(m.rows(1, 1).cols(0, 3).some(function (val) {
      return val === 7;
    })).toBeTruthy();
  });

  it('method `some` should return false ' +
    'if predicate does not match on some matrix value', function () {
    expect(m.rows(1, 1).cols(0, 3).some(function (val) {
      return val === 1;
    })).toBeFalsy();
  });

  it('method `each` should iterate over each selected matrix value', function () {
    m.rows(0, 0).cols(1, 3).each(function (val, rowIdx, colIdx) {
      expect(m.get(rowIdx, colIdx)).toEqual(val);
    });
  });
});