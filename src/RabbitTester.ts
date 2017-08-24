import {RabbitDriver,AmqpMessage,Socket,RabbitChannelOptions,RabbitConfig} from 'rabbit-driver'
import * as Promise from 'bluebird';


class RabbitTester {
    drivers:RabbitDriver.pushworker[];
    testQueue: RabbitDriver.pushworker;
    pushedMessages: number;

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
            })
    }
    start_senders(max_queues:number): Promise<any> {
        let pushedMessages = 0;

        for(let i=0; i<max_queues; i++) {
            let config:RabbitConfig = {
                rabbitmq: {
                    hostname: 'amqp://localhost'
                }
            };

            let channelOpts: RabbitChannelOptions = {name: 'queue-'+ i, server: {persistent: true}, client: {prefetch: 1}};
            let driver = new RabbitDriver.pushworker(config, channelOpts, false);
            this.drivers.push(driver);
        }

        return Promise.each(this.drivers, (driver) => {
            return driver.init();
        })
    }
    push_messages() {
        //start pushing messages to the the first queue
        console.log('starting to push messages');
        while(true) {
            this.drivers[0].publish(new AmqpMessage('message', 'this is the message'));
            this.pushedMessages++;
        }
    }
}


let tester = new RabbitTester();
tester.test();