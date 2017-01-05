import { Cluster } from './cluster';
import { Resource } from './resource';
import { Service } from './Service';
export declare class Listener implements Resource {
    service: Service;
    cluster: Cluster;
    priority: number;
    constructor(service: Service, cluster: Cluster);
    readonly listenerRuleName: string;
    readonly targetGroupName: string;
    required(): number | "";
    resources(): any;
    readonly mapping: {
        'ContainerName': string;
        'ContainerPort': number;
        'TargetGroupArn': {
            'Ref': string;
        };
    }[];
}
