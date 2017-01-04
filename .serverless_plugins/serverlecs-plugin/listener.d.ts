export declare class Listener {
    name: string;
    vpcId: string;
    port: number;
    pathPattern: string;
    priority: number;
    constructor(name: string, opts: any);
    readonly listenerRuleName: string;
    readonly targetGroupName: string;
    generateResources(): any;
    mapping(): {
        'ContainerName': string;
        'ContainerPort': number;
        'TargetGroupArn': {
            'Ref': string;
        };
    }[];
}
