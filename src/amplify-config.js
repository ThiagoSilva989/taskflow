
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

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

// Mantém os tokens somente durante a sessão da aba.
cognitoUserPoolsTokenProvider.setKeyValueStorage(window.sessionStorage);
