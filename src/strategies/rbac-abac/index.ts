// TODO(rbac-abac): Implement Role-Based and Attribute-Based Access Control
// LEARN: RBAC assigns permissions to roles, and roles to users (e.g., admin, editor,
//   viewer). ABAC extends this with attribute-based policies (e.g., "allow if
//   user.department === resource.department AND time is within business hours").
//   Understand: the difference between authentication and authorization, permission
//   models, policy engines, and how middleware enforces access control.
// REF: https://csrc.nist.gov/publications/detail/sp/800-162/final (ABAC guide)
// REF: https://en.wikipedia.org/wiki/Role-based_access_control

// Endpoints to implement:
//   GET    /authz/roles              — List all roles
//   POST   /authz/roles              — Create a role with permissions
//   PUT    /authz/users/:id/roles    — Assign roles to a user
//   GET    /authz/check              — Check if current user has a permission
//
// Middleware to implement:
//   requireRole("admin")             — RBAC middleware
//   requirePermission("posts:write") — Fine-grained permission check
//   evaluatePolicy(policy)           — ABAC policy evaluation
//
// Required packages: (none — implement from scratch for learning)
//
// Database changes needed:
//   - roles table: id, name, description, permissions (jsonb)
//   - user_roles table: userId, roleId (many-to-many)

export {};
