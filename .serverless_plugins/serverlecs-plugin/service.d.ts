export declare class Service {
    service: any;
    resources: any;
    constructor(opts: any);
    readonly taskDefinitionName: string;
    readonly logGroupName: string;
    readonly elbRoleName: string;
    readonly elbRolePolicyName: string;
    generateResources(): any;
    loadBalancers: () => {
        'ContainerName': any;
        'ContainerPort': any;
        'TargetGroupArn': {
            'Ref': string;
        };
    }[];
    loadBalancer: (container: any) => {
        'ContainerName': any;
        'ContainerPort': any;
        'TargetGroupArn': {
            'Ref': string;
        };
    };
    definitions: () => {
        'Name': any;
        'Essential': string;
        'Image': any;
        'Memory': any;
        'PortMappings': {
            'ContainerPort': any;
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
    }[];
    definition: (container: any) => {
        'Name': any;
        'Essential': string;
        'Image': any;
        'Memory': any;
        'PortMappings': {
            'ContainerPort': any;
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
