var Immutable = require('immutable')
var Getter = require('../src/getter')
var evaluate = require('../src/evaluate')

describe('Getter', () => {
  it('should create an Immutable Getter Record with coerced deps', () => {
    var computed = Getter('dep1', 'dep2.val', (val1, val2) => {
      return val1 + val2;
    })

    var expected = [['dep1'], ['dep2', 'val']]
    expect(Immutable.is(computed.deps, expected))
  })

  it('should evaluate without a computeFn', () => {
    var state = Immutable.fromJS({
      foo: {
        bar: 1
      }
    })

    var getter1 = Getter('foo.bar')
    var getter2 = Getter(['foo', 'bar'])

    expect(evaluate(state, getter1)).toBe(1)
    expect(evaluate(state, getter2)).toBe(1)
  })

  it("should properly evaluate", () => {
    var state = Immutable.Map({
      dep1: 1,
      dep2: 2,
    })

    var computed = Getter('dep1', 'dep2', (val1, val2) => {
      return val1 + val2;
    })

    var result = evaluate(state, computed)

    expect(result).toBe(3)
  })

  describe("recursive getters", () => {
    var getter1
    var getter2

    beforeEach(() => {
      getter1 = Getter('dep1', 'dep2', (val1, val2) => {
        return val1 + val2;
      })

      getter2 = Getter(getter1, 'multi', (total, multi) => {
        return multi * total
      })
    })

    it("should recursively evaluate", () => {
      var state = Immutable.Map({
        dep1: 1,
        dep2: 2,
        multi: 3,
      })

      var result = evaluate(state, getter2)

      expect(result).toBe(9)
    })

    it('#flattenDeps', () => {
      expect(getter2.flatDeps).toEqual([['dep1'], ['dep2'], ['multi']])
    })
  })

  describe("#fromArgs", () => {
    it('should create a getter from arguments', () => {
      var args = ['dep1', 'dep2.val', (val1, val2) => {
        return val1 + val2
      }]

      var getter = Getter.fromArgs(args)

      var expected = [['dep1'], ['dep2', 'val']]
      expect(Immutable.is(getter.deps, expected))
    })

    it('should evaluate without a computeFn', () => {
      var state = Immutable.fromJS({
        foo: {
          bar: 1
        }
      })

      var getter1 = Getter.fromArgs(['foo.bar'])
      var getter2 = Getter.fromArgs([['foo', 'bar']])

      expect(evaluate(state, getter1)).toBe(1)
      expect(evaluate(state, getter2)).toBe(1)
    })
  })
})
