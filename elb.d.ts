import { Cluster } from './cluster';
import { Resource } from './resource';
export declare class ELB implements Resource {
    cluster: Cluster;
    constructor(cluster: Cluster);
    readonly name: string;
    generate(): {
        'ContainerlessELB': {
            'Type': string;
            'Properties': {
                'Scheme': string;
                'LoadBalancerAttributes': {
                    'Key': string;
                    'Value': number;
                }[];
                'Subnets': string;
                'SecurityGroups': (string | {
                    'Ref': string;
                })[];
            };
        };
        'ContainerlessListener': {
            'Type': string;
            "DependsOn": string;
            'Properties': {
                'DefaultActions': {
                    'Type': string;
                    'TargetGroupArn': {
                        'Ref': string;
                    };
                }[];
                'LoadBalancerArn': {
                    'Ref': string;
                };
                'Port': string;
                'Protocol': string;
            };
        };
        'ContainerlessDefaultTargetGroup': {
            'Type': string;
            'DependsOn': string;
            'Properties': {
                'Port': number;
                'Protocol': string;
                'VpcId': string;
            };
        };
    };
}
