/*jslint sloppy:true */
/*global describe, xdescribe, it, xit, expect, beforeEach, afterEach,
 Matrix, Pocketry */
describe('Layout suite', function () {
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
});