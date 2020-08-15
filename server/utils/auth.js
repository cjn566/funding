import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import jwtAuthz from 'express-jwt-authz'

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH0_DOMAIN + '.well-known/jwks.json'
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_DOMAIN,
  algorithms: ['RS256']
})

/**
 * Returns an authorization function configured to check the custom
 * 'permissions' attribute in the JWT that is set by Auth0 RBAC.
 */
const checkPermission = (permissions) => {
  const perms = permissions.split(',')
  return jwtAuthz(perms,
    { customScopeKey: 'permissions' })
}

export const CheckJwt = checkJwt
export const CheckPermission = checkPermission
