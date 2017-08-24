"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rabbit_driver_1 = require("rabbit-driver");
const Promise = require("bluebird");
class RabbitTester {
    constructor() {
        this.drivers = [];
    }
    test() {
        setInterval(() => {
            console.log('pushed messages: ', this.pushedMessages);
        }, 1000);
        this.start_senders(10)
            .then(() => {
            this.push_messages();
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
    push_messages() {
        //start pushing messages to the the first queue
        console.log('starting to push messages');
        while (true) {
            this.drivers[0].publish(new rabbit_driver_1.AmqpMessage('message', 'this is the message'));
            this.pushedMessages++;
        }
    }
}
let tester = new RabbitTester();
tester.test();
