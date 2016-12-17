#!/bin/bash -xe
yum install -y aws-cfn-bootstrap

/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource ECSAutoScalingLaunchConfig --region ${AWS::Region}

/opt/aws/bin/cfn-signal -e 0 --stack ${AWS::StackName} --resource AutoScalingGroup --region ${AWS::Region}
