export declare class Listener {
    name: string;
    vpcId: string;
    port: number;
    path: string;
    constructor(name: string, vpcId: string, port: number, path: string);
    readonly listenerRuleName: string;
    readonly targetGroupName: string;
    generateResources(): any;
    mapping(): {
        'ContainerName': string;
        'ContainerPort': number;
        'TargetGroupArn': {
            'Ref': string;
        };
    };
}
