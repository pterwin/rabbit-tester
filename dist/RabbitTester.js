"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rabbit_driver_1 = require("rabbit-driver");
const Promise = require("bluebird");
class RabbitTester {
    constructor() {
        this.drivers = [];
    }
    test() {
        this.start_senders(10)
            .then(() => {
            this.push_messages(100);
        })
            .then(() => {
            this.start_consumers(10);
        });
    }
    start_senders(max_queues) {
        let pushedMessages = 0;
        for (let i = 0; i < max_queues; i++) {
            let config = {
                rabbitmq: {
                    hostname: 'amqp://localhost'
                }
            };
            let channelOpts = { name: 'queue-' + i, server: { persistent: true }, client: { prefetch: 1 } };
            let driver = new rabbit_driver_1.RabbitDriver.pushworker(config, channelOpts, false);
            this.drivers.push(driver);
        }
        return Promise.each(this.drivers, (driver) => {
            return driver.init();
        });
    }
    push_messages(batchLength) {
        //start pushing messages to the the first queue
        let currentBatch = 0;
        setInterval(() => {
            console.log('pushing batch: ', currentBatch + 1);
            for (let i = 0; i < batchLength; i++) {
                this.drivers[0].publish(new rabbit_driver_1.AmqpMessage('message', 'this is the message'));
                this.pushedMessages++;
            }
            currentBatch++;
        }, 100);
    }
    start_consumers(max_queues) {
        // start sending consumers
        let currentConsumers = 0;
        setInterval(() => {
            for (let i = 0; i < max_queues; i++) {
                let config = {
                    rabbitmq: {
                        hostname: 'amqp://localhost'
                    }
                };
                let channelOpts = { name: 'queue-' + i, server: { persistent: true }, client: { prefetch: 1 } };
                let driver = new rabbit_driver_1.RabbitDriver.pushworker(config, channelOpts, false);
                this.drivers.push(driver);
            }
            currentConsumers += max_queues;
            console.log('sent consumers: ', currentConsumers);
        }, 1000);
    }
}
let tester = new RabbitTester();
tester.test();
