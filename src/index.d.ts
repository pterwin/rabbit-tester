declare module 'rabbit-driver' {
    interface RabbitConfig {
        rabbitmq: {
            hostname: string;
        }
    }

    interface RabbitChannelOptions {
        name: string,
        client: {
            prefetch: number
        },
        server: {
            persistent: boolean;
        }
    }

    interface MessageInfo {
        type: string;
        body: any;
    }

    export class AmqpMessage {
        type: string;
        body: any;
        constructor(type: string, body: any);
        toObject():any;
        fromObject(obj: MessageInfo):void;
    }

    class Socket {
        ack(): void;
    }
    interface callbacktype { (message: AmqpMessage, client: Socket): void }

    class Driver {
        constructor(config: RabbitConfig, options: RabbitChannelOptions, startClient?: boolean);
        init(): Promise<any>;
        publish(message: AmqpMessage);
        on(event_type: string, callback: callbacktype);
    }

    export namespace RabbitDriver {
        class pushworker extends Driver {}
        class pubsub extends Driver {}
        class pushpull extends Driver {}
    }
}

declare module 'logger' {
    class  Logger {
        constructor(appname: string);
        log(level: string, ...message: any[]): void;
        raw(...message: any[]): void;
        debug(...message: any[]): void;
        info(...message: any[]): void;
        warn(...message: any[]): void;
        error(...message: any[]): void;
        critical(...message: any[]): void;
    }
    export = Logger;
}