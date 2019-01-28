// == Imports ===============================================================

const path = require('path');

const Config = require('../lib/config');

// == Constants =============================================================

// == Support ===============================================================

// == Tests =================================================================

describe('Config', () => {
  it('can provide a default configuration', () => {
    let config = new Config();

    assert.ok(config);

    assert.equal(config.username, 'guest');
    assert.equal(config.driver, 'amqplib');
  });

  it('can read an arbitrary JSON file', () => {
    let configPath = path.resolve(__dirname, './data/skein-example.json');

    let config = new Config(configPath);

    assert.ok(config);

    assert.equal(config.username, 'default_username');
    assert.equal(config.password, 'example_password');

    assert.equal(config.host, 'example_host');

    assert.equal(config.uri(), 'amqp://default_username:example_password@example_host/');
  });

  it('can properly URI encode with a minimal config', () => {
    let config = new Config({ });

    assert.equal(config.uri(), 'amqp://localhost/');

    assert.equal(config.driver, 'amqplib');
  })

  it('can properly URI encode values in configuration', () => {
    let configPath = path.resolve(__dirname, './data/skein-encoding-example.json');

    let config = new Config(configPath);

    assert.ok(config);

    assert.equal(config.uri(), 'amqp://User%20Name:%25%26pas%24word@example_host.example.net:65380/vhostN');

    assert.equal(config.driver, 'amqplib');
  });

  it('has a configuration file it can read', () => {
    let configPath = path.resolve(__dirname, './data/skein-example.json');

    assert.isTrue(Config.exist(configPath));
    assert.isTrue(Config.exist());
    assert.isFalse(Config.exist('.invalid'));
  });
});
