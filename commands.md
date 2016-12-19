aws ecr get-authorization-token --region ap-southeast-2 --output text --query authorizationData[].authorizationToken | base64 -d | cut -d: -f2
