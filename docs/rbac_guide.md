# Role-Based Access Control (RBAC) Guide

This system strictly separates users into three roles: **Adopter**, **Shelter**, and **Admin**. This guide explains how the security works and how to maintain it.

## 1. The Three Roles
| Role | Purpose | Landing Page (Dashboard) |
| :--- | :--- | :--- |
| **Adopter** | Browse pets, apply for adoption | `/` (Home) |
| **Shelter** | Manage pets, review applications | `/shelter/dashboard` |
| **Admin** | Oversee shelters and system stats | `/admin/dashboard` |

## 2. How Protection Works (Frontend)
We use a special component called `<ProtectedRoute>` to wrap every page in `App.tsx`.

### The Code Logic (`ProtectedRoute.tsx`)
It checks the logged-in user's `type`. If they try to access a forbidden page, it performs a **Smart Redirect**:
-   **Adopter** tries accessing `/shelter/*` → Bounced to Home.
-   **Shelter** tries accessing `/profile` → Bounced to `/shelter/dashboard`.
-   **Admin** tries accessing `/adopt/*` → Bounced to `/admin/dashboard`.

*This prevents users from seeing "404 Not Found" or a blank screen; they are just gently guided back to their lane.*

### How to protect a new route
When adding a new page in `App.tsx`, wrap it like this:

```tsx
<Route 
  path="/shelter/new-feature" 
  element={
    <ProtectedRoute allowedRoles={['shelter']}>
      <NewFeaturePage />
    </ProtectedRoute>
  } 
/>
```

## 3. Backend Security (API)
The backend `authMiddleware.js` enforces the same rules for data access.
-   `verifyToken`: Checks if the user is logged in.
-   `requireShelter`: Rejects unrelated users with "Access denied. Shelter only."
-   `requireAdmin`: Rejects unrelated users with "Access denied. Admin only."

## 4. Maintenance
-   **Adding a Role**: Update `AuthContext.tsx`, `ProtectedRoute.tsx`, and the backend middleware.
-   **Changing Access**: Just change the `allowedRoles` array in `App.tsx`. For example, if Admins should also see Shelter dashboards, change `allowedRoles={['shelter']}` to `allowedRoles={['shelter', 'admin']}`.
