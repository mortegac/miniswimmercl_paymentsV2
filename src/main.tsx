import React, { Suspense } from "react";
import ScrollToTop from "@/components/Base/ScrollToTop";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import Splash from "@/components/Base/Splash";
import ErrorBoundary from "./ErrorBoundary";
import { store } from "./stores/store";
import Router from "./router";
import "./assets/css/app.css";

import  { Amplify } from 'aws-amplify';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
// import awsExports from './aws-exports';

type AwsConfig = {
  aws_project_region: string;
  aws_appsync_graphqlEndpoint: string;
  aws_appsync_region: string;
  aws_appsync_authenticationType: string;
  aws_appsync_apiKey: string;
  aws_cognito_identity_pool_id: string;
  aws_cognito_region: string;
  aws_user_pools_id: string;
  aws_user_pools_web_client_id: string;
  oauth: {
    domain: string;
    scope: string[];
    redirectSignIn: string;
    redirectSignOut: string;
    responseType: string;
  };
  federationTarget: string;
  aws_cognito_username_attributes: string[];
  aws_cognito_social_providers: string[];
  aws_cognito_signup_attributes: string[];
  aws_cognito_mfa_configuration: string;
  aws_cognito_mfa_types: string[];
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: number;
    passwordPolicyCharacters: any[];
  };
  aws_cognito_verification_mechanisms: string[];
};

type AmplifyConfig = AwsConfig & {
  Auth?: {
    storage: Storage;
  };
};


let awsExports: AwsConfig ={
  "aws_project_region": "us-east-2",
  "aws_appsync_graphqlEndpoint": "https://vibghdaimbgfnlypijdjpufbgu.appsync-api.us-east-2.amazonaws.com/graphql",
  "aws_appsync_region": "us-east-2",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "da2-y5mbqnzliraotj2zgojiatx34a",
  "aws_cognito_identity_pool_id": "us-east-2:70055e20-cfe6-4cef-9b1c-4a0649c450d5",
  "aws_cognito_region": "us-east-2",
  "aws_user_pools_id": "us-east-2_RnbT7nPr9",
  "aws_user_pools_web_client_id": "3c7425phukqjelo0mt3833h6kj",
  "oauth": {
      "domain": "apiclientsbb306568-bb306568-prod.auth.us-east-2.amazoncognito.com",
      "scope": [
          "phone",
          "email",
          "openid",
          "profile",
          "aws.cognito.signin.user.admin"
      ],
      "redirectSignIn": "http://localhost:5173/",
      "redirectSignOut": "http://localhost:5173/",
      "responseType": "code"
  },
  "federationTarget": "COGNITO_USER_POOLS",
  "aws_cognito_username_attributes": [],
  "aws_cognito_social_providers": [
      "GOOGLE"
  ],
  "aws_cognito_signup_attributes": [
      "EMAIL"
  ],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": [
      "SMS"
  ],
  "aws_cognito_password_protection_settings": {
      "passwordPolicyMinLength": 8,
      "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": [
      "EMAIL"
  ]
};
if (process.env.NODE_ENV === "development") {
  awsExports.oauth.redirectSignIn = "http://localhost:5173/";
  awsExports.oauth.redirectSignOut = "http://localhost:5173/";
} else {
  awsExports.oauth.redirectSignIn = "https://app.miniswimmer.cl/";
  awsExports.oauth.redirectSignOut = "https://app.miniswimmer.cl/";
}

const updatedConfig: AmplifyConfig = {
  ...awsExports,
  Auth: {
    storage: window.sessionStorage
  }
};;

// Amplify.configure(awsExports);
Amplify.configure(updatedConfig);

type SameSite = 'strict' | 'lax' | 'none';
interface CookieStorageOptions {
  domain: string;
  expires: number;
  secure: boolean;
  sameSite: SameSite;
}

const cookieOptions: CookieStorageOptions = {
  domain: process.env.NODE_ENV === "development" ?'localhost':'app.miniswimmer.cl',
  expires: 365, // número de días
  secure: true,
  sameSite: 'strict' // o 'lax' o 'none'
};

cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage(cookieOptions));
  
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <Provider store={store}>
            <Suspense fallback={<Splash />}>
              <Router />
            </Suspense>
          </Provider>
          <ScrollToTop />
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>
);

