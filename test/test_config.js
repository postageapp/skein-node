// == Imports ===============================================================

const path = require('path');

const Config = require('../lib/config');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Config', () => {
  it('can provide a default configuration', () => {
    var config = new Config();

    assert.ok(config);

    assert.equal(config.username, 'guest');
    assert.equal(config.driver, 'amqplib');
  });

  it('can read an arbitrary JSON file', () => {
    var configPath = path.resolve(__dirname, './data/skein-example.json');

    var config = new Config(configPath);

    assert.ok(config);

    assert.equal(config.username, 'default_username');
    assert.equal(config.password, 'example_password');
    assert.equal(config.host, 'example_host');
  });

  it('has a configuration file it can read', () => {
    var configPath = path.resolve(__dirname, './data/skein-example.json');

    assert.isTrue(Config.exist(configPath));
    assert.isTrue(Config.exist());
    assert.isFalse(Config.exist('.invalid'));
  });
});
