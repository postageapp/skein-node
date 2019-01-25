// == Imports ===============================================================

const rabbitmq = require('../lib/rabbitmq');

const Config = require('../lib/config');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('rabbitmq', () => {
  describe('connect()', () => {
    it('can connect to the default server', async () => {
      let config = new Config();

      assert.ok(config.driver);

      let conn = await rabbitmq.connect(config);

      assert.ok(conn);

      conn.close();
    });
  });
});
