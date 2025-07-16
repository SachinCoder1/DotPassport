/**
 * Represents the shape of the decoded JWT payload attached to req.user
 */
export interface UserMiddlewareType {
  /**
   * The user’s unique identifier (Mongo _id)
   */
  id: string;

  /**
   * Issued-at timestamp (seconds since epoch)
   */
  iat?: number;

  /**
   * Expiration timestamp (seconds since epoch)
   */
  exp?: number;
}
