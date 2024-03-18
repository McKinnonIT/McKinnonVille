function getServiceAccountToken() {
    var jwtHeader = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    var jwtClaimSet = Utilities.base64EncodeWebSafe(JSON.stringify({
        iss: CLIENT_EMAIL,
        scope: SCOPES.join(' '),
        aud: TOKEN_URI,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
    }));

    var jwtSignatureInput = jwtHeader + '.' + jwtClaimSet;
    var signature = Utilities.computeRsaSha256Signature(jwtSignatureInput, PRIVATE_KEY);
    var jwtSignature = Utilities.base64EncodeWebSafe(signature);

    var jwt = jwtHeader + '.' + jwtClaimSet + '.' + jwtSignature;

    var tokenResponse = UrlFetchApp.fetch(TOKEN_URI, {
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        payload: {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        },
    });

    var accessToken = JSON.parse(tokenResponse.getContentText()).access_token;
    return accessToken;
}

