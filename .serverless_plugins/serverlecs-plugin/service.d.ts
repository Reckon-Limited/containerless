import { Listener } from './listener';
export interface ServiceOpts {
    clusterId: string;
    name: string;
    count: number;
    port: number;
    memory: number;
    image: string;
}
export declare class Service {
    opts: ServiceOpts;
    resources: any;
    listener: Listener;
    constructor(opts: any);
    readonly taskDefinitionName: string;
    readonly logGroupName: string;
    readonly name: string;
    generateResources(): any;
    definition: () => {
        'Name': string;
        'Essential': string;
        'Image': string;
        'Memory': number;
        'PortMappings': {
            'ContainerPort': number;
        }[];
        'LogConfiguration': {
            'LogDriver': string;
            'Options': {
                'awslogs-group': {
                    'Ref': string;
                };
                'awslogs-region': {
                    'Ref': string;
                };
                'awslogs-stream-prefix': {
                    'Ref': string;
                };
            };
        };
    };
}
