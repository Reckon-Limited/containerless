"Type";
"use strict";
"AWS::IAM::Role",
    "Properties";
{
    "AssumeRolePolicyDocument";
    {
        "Statement";
        [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": [
                        "ecs.amazonaws.com"
                    ]
                },
                "Action": [
                    "sts:AssumeRole"
                ]
            }
        ];
    }
    "Path";
    "/",
        "Policies";
    [
        {
            "PolicyName": "ecs-service",
            "PolicyDocument": {
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Resource": "*",
                        "Action": [
                            "elasticloadbalancing:DeregisterInstancesFromLoadBalancer",
                            "elasticloadbalancing:DeregisterTargets",
                            "elasticloadbalancing:Describe*",
                            "elasticloadbalancing:RegisterInstancesWithLoadBalancer",
                            "elasticloadbalancing:RegisterTargets",
                            "ec2:Describe*",
                            "ec2:AuthorizeSecurityGroupIngress"
                        ]
                    }
                ]
            }
        }
    ];
}
