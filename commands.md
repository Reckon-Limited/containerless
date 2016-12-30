aws ecr get-authorization-token --region ap-southeast-2 --output text --query authorizationData[].authorizationToken | base64 -d | cut -d: -f2


cloudformation create-stack --stack-name blah --template-body file:///Users/toby.hede/src/serverl-ecs/cfn/cluster.yml --capabilities CAPABILITY_IAM --parameters file:///Users/toby.hede/src/serverl-ecs/cfn/params.json


cloudformation create-stack --stack-name vtha --template-body file:///Users/toby.hede/src/serverl-ecs/cfn/cluster.yml --capabilities CAPABILITY_IAM --parameters file:///Users/toby.hede/src/serverl-ecs/cfn/params.json

cloudformation create-stack --stack-name blah --template-body file:///Users/toby.hede/src/serverl-ecs/.serverless/cloudformation-template-update-stack.json
