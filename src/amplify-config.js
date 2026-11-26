
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_GuFrIt5CW',
      userPoolClientId: '2gov5v9ealqn893vkje1bmg3be',
      loginWith: {
        email: true,
      },
    },
  },
});
