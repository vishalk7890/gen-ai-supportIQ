// src/aws-exports.js
const awsConfig = {
  aws_project_region: 'us-east-1',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_kmixUr4yq', // e.g., us-east-1_abc123xyz
  aws_user_pools_web_client_id: '7qqdba5o1co51g0at68hu16d8p', // your app client ID
  oauth: {
    domain: 'pca-1755221929659628847.auth.us-east-1.amazoncognito.com', // Cognito domain
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: 'http://localhost:3000/callback',
    redirectSignOut: 'http://localhost:3000/',
    responseType: 'code', // or 'token' depending on flow
  },
};

export default awsConfig;