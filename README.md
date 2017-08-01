# Skein

This is a JSON-RPC library for [RabbitMQ](https://www.rabbitmq.com) and other
[AMQP](http://amqp.org) compatible servers.

## Usage

Installation should be simple with NPM:

    npm install skein-rpc --save

Once installed, using it in a client application is simple:

    const Skein = require('skein-rpc');

    var client = Skein.client();

    client.example().then((result) => {
      console.log(results)
    });
