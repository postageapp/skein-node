// == Imports ===============================================================

const rabbitmq = require('../lib/rabbitmq');

const Config = require('../lib/config');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('rabbitmq', () => {
  describe('connect()', () => {
    it('can connect to the default server', () => {
      var config = new Config();

      assert.ok(config.driver);

      return rabbitmq.connect(config).then((conn) => {
        assert.ok(conn);
      });
    });
  });
});
