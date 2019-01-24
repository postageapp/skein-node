// == Imports ===============================================================

const Handler = require('../lib/handler');

// == Constants =============================================================

// == Support ===============================================================

class ExampleHandler extends Handler {
  echoSync(value) {
    return {
      value: value
    };
  }

  echoPromise(value) {
    return Promise.resolve({
      value: value
    });
  }
}

// == Tests =================================================================

describe('Handler', () => {
  it('can wrap synchronous functions that return plain values', () => {
    let handler = new ExampleHandler();

    return handler.handle(JSON.stringify({
      id: 'echoSync-001',
      method: 'echoSync',
      params: [ 'value' ]
    })).then((json) => {
      let result = JSON.parse(json);

      assert.deepEqual(result, {
        id: 'echoSync-001',
        result: { value: 'value' },
        error: null
      });
    });
  });

  it('can wrap functions that return a promise', () => {
    let handler = new ExampleHandler();

    return handler.handle(JSON.stringify({
      id: 'echoPromise-001',
      method: 'echoPromise',
      params: [ 'value' ]
    })).then((json) => {
      let result = JSON.parse(json);

      assert.deepEqual(result, {
        id: 'echoPromise-001',
        result: { value: 'value' },
        error: null
      });
    });
  });

  it('returns an error for an unknown method', () => {
    let handler = new ExampleHandler();

    return handler.handle(JSON.stringify({
      id: 'broken-001',
      method: 'broken',
      params: [ null ]
    })).then((json) => {
      let result = JSON.parse(json);

      assert.deepEqual(result, {
        id: 'broken-001',
        result: null,
        error: {
          code: -32601,
          message: "Undefined endpoint 'broken'"
        }
      });
    });
  });
});
