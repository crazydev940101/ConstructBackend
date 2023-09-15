import { PassportStatic } from "passport";
import { OAuth2Strategy } from "passport-google-oauth";
import passportJwt, { VerifyCallbackWithRequest } from 'passport-jwt';
import { config } from "../config/config";
import { OIDCStrategy, VerifyCallback } from "passport-azure-ad";

export const ConfigPassport = (passport: PassportStatic) => {

  passport.use(
    new OAuth2Strategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: `${config.host}/api/v1/auth/user/google/callback`,
      },
      function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
      }
    )
  );
  
  passport.use(
    new passportJwt.Strategy(
      {
        secretOrKey: config.accessTokenSecretKey,
        jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken()
      },
      function (payload: any, done: any): VerifyCallbackWithRequest {
        return done(null, payload);
      }
    )
  );
  
  passport.use(
    new OIDCStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${config.azureTenantId}/v2.0/.well-known/openid-configuration`,
        clientID: config.azureClientId,
        clientSecret: config.azureClientSecret,
        passReqToCallback: false,
        responseType: "code",
        responseMode: "form_post",
        redirectUrl: `${config.host}/api/v1/auth/user/azure/callback`,
        allowHttpForRedirectUrl: true,
        scope: ['profile', 'offline_access', 'email'],
        loggingLevel: "info",
        validateIssuer: false,
        // issuer: '<your_issuer_url>',
        cookieEncryptionKeys: [ 
          { 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
          { 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
        ],
        nonceMaxAmount: 5,
      },
      async (
        iss: any,
        sub: any,
        profile: any,
        done: VerifyCallback
      ) => {
        if (!profile.oid) {
          return done(new Error("No oid found"), null);
        }
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    )
  );
  
};
