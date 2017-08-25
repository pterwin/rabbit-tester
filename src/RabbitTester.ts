import {RabbitDriver,AmqpMessage,Socket,RabbitChannelOptions,RabbitConfig} from 'rabbit-driver'
import * as Promise from 'bluebird';

interface Stats {
    sentMessages: number,
    numberOfClients: number,
}
class RabbitTester {
    drivers:RabbitDriver.pushworker[];
    testQueue: RabbitDriver.pushworker;
    pushedMessages: number;
    stats: Stats;
    rabbit_host: string;

    constructor() {
        this.drivers = [];
        this.stats = {
            sentMessages: 0,
            numberOfClients: 0
        }

    }
    test() {
        this.rabbit_host = 'amqp://localhost';
        setInterval(() => {
            console.log('stats: ', this.stats);
        },2000);
        this.start_senders(10)
            .then(() => {
                this.push_messages(100);
            })
            .then(() => {
                this.start_consumers(10);
            })
    }
    start_senders(max_queues:number): Promise<any> {
        let pushedMessages = 0;

        for(let i=0; i<max_queues; i++) {
            let config:RabbitConfig = {
                rabbitmq: {
                    hostname: this.rabbit_host
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
    push_messages(batchLength: number) {
        //start pushing messages to the the first queue
        setInterval(() => {
            for(let i=0; i<batchLength; i++) {
                this.drivers[0].publish(new AmqpMessage('message', 'this is the message'));
                this.stats.sentMessages++;
            }
        }, 100);
    }

    start_consumers(max_queues: number) {
        // start sending consumers
        let currentConsumers = 0;
        setInterval(() => {
            let drivers: RabbitDriver.pushworker[] = [];
            for(let i=0; i<max_queues; i++) {
                let config:RabbitConfig = {
                    rabbitmq: {
                        hostname: this.rabbit_host
                    }
                };
                let channelOpts: RabbitChannelOptions = {name: 'queue-'+ i, server: {persistent: true}, client: {prefetch: 1}};
                let driver = new RabbitDriver.pushworker(config, channelOpts, false);
                drivers.push(driver);
            }

            Promise.each(drivers, (driver) => {
                return driver.init();
            }).then(() => {
                this.stats.numberOfClients+=max_queues;
            })
        }, 1000);
    }
}

let tester = new RabbitTester();
tester.test();