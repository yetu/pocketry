/*jslint sloppy:true, nomen:true */
/*global jasmine, describe, xdescribe, it, xit,
 expect, beforeEach, afterEach,
 Pocketry */
describe('Layout.prototype._nextScanStep', function () {
  var nextStep = Pocketry.Layout.prototype._nextScanStep;

  function prepareStep(stepSize, iteratee) {
    var fn = function (stepNumber) {
      return nextStep(stepNumber, stepSize, iteratee);
    };
    fn.cursor = function (row, col) {
      return {
        row: {
          start: row,
          end: row + stepSize[1]
        },
        col: {
          start: col,
          end: col + stepSize[0]
        }
      };
    };
    return fn;
  }

  describe('iterating over 10x3 matrix with [3,2] step', function () {
    var matrix = new Pocketry.Layout(3, 10).matrix,
      step = prepareStep([3, 2], matrix.selection);

    it('should point cursor at step 0 to [0,0]', function () {
      expect(step(0)).toEqual(step.cursor(0, 0));
    });

    it('should point cursor at step 1 to [1,0]', function () {
      expect(step(1)).toEqual(step.cursor(1, 0));
    });

    it('should point cursor at step 2 to [2,0]', function () {
      expect(step(2)).toEqual(step.cursor(2, 0));
    });

    it('should point cursor at step 3 to [3,0]', function () {
      expect(step(3)).toEqual(step.cursor(3, 0));
    });

    it('should point cursor at step 7 to [7,0]', function () {
      expect(step(7)).toEqual(step.cursor(7, 0));
    });

    it('should point cursor at step 8 to [8,0]', function () {
      expect(step(8)).toEqual(step.cursor(8, 0));
    });
  });

  describe('iterating over 2x5 matrix with [2,1] step', function () {
    var matrix = new Pocketry.Layout(5, 2).matrix,
      step = prepareStep([2, 1], matrix.selection);

    it('should point cursor at step 0 to [0,0]', function () {
      expect(step(0)).toEqual(step.cursor(0, 0));
    });

    it('should point cursor at step 1 to [0,1]', function () {
      expect(step(1)).toEqual(step.cursor(0, 1));
    });

    it('should point cursor at step 2 to [1,0]', function () {
      expect(step(2)).toEqual(step.cursor(1, 0));
    });

    it('should point cursor at step 3 to [1,1]', function () {
      expect(step(3)).toEqual(step.cursor(1, 1));
    });

    it('should point cursor at step 6 to [1,2]', function () {
      expect(step(6)).toEqual(step.cursor(1, 2));
    });

    it('should point cursor at step 7 to [7,0]', function () {
      expect(step(7)).toEqual(step.cursor(1, 3));
    });
  });
});