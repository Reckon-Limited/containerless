import { Cluster } from './cluster';
import { Resource } from './resource';
import { Service } from './service';
export declare class Listener implements Resource {
    service: Service;
    cluster: Cluster;
    priority: number;
    constructor(service: Service, cluster: Cluster);
    calculatePriority(): number;
    readonly listenerName: string;
    readonly targetGroupName: string;
    readonly healthcheckPath: string;
    required(): number | "";
    generate(): any;
    generateForProtocol(protocol: string): {
        'Type': string;
        "DependsOn": string[];
        'Properties': {
            'Actions': {
                'TargetGroupArn': {
                    'Ref': string;
                };
                'Type': string;
            }[];
            'Conditions': {
                'Field': string;
                'Values': string[];
            }[];
            'ListenerArn': {
                'Ref': string;
            };
            'Priority': number;
        };
    };
    readonly mapping: {
        'ContainerName': string;
        'ContainerPort': number;
        'TargetGroupArn': {
            'Ref': string;
        };
    }[];
}
export declare function reset(): void;
