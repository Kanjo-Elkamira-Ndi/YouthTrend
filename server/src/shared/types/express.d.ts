// Augment the Express Request type so TypeScript knows about
// req.user after the authenticateToken middleware runs.

export type UserRole =
  | 'super_admin'
  | 'campus_admin'
  | 'moderator'
  | 'writer'
  | 'reader';

export type UserStatus = 'active' | 'suspended' | 'banned' | 'unverified';

export interface AuthUser {
  id:        string;
  email:     string;
  role:      UserRole;
  status:    UserStatus;
  campusId:  string | null;
  fullName:  string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}