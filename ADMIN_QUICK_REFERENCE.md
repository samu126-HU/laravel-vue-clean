# Admin Panel Quick Reference

## Default Credentials

### Admin Account
- **Email:** admin@shopnavi.com
- **Password:** password

### Regular User Account
- **Email:** user@shopnavi.com
- **Password:** password

## URLs

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin` | Statistics and overview |
| Categories | `/admin/categories` | Manage product categories |
| Shops | `/admin/shops` | Manage shop locations |
| Products | `/admin/products` | Manage products |
| Users & Roles | `/admin/users` | Manage user permissions |

## Key Features

### All Management Pages Include:
✅ Search bar with real-time filtering  
✅ Pagination (10 items per page)  
✅ Create/Edit/Delete operations  
✅ Modal-based forms  
✅ Confirmation dialogs  

## Common Commands

### Run Migrations
```bash
php artisan migrate
```

### Seed Default Users
```bash
php artisan db:seed --class=UserSeeder
```

### Build Frontend
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## API Endpoints

### Statistics
- `GET /api/admin/statistics` - Dashboard data

### Categories
- `GET /api/admin/categories?page=1&search=term` - List
- `POST /api/admin/categories` - Create
- `PUT /api/admin/categories/{id}` - Update
- `DELETE /api/admin/categories/{id}` - Delete

### Shops
- `GET /api/admin/shops?page=1&search=term` - List
- `POST /api/admin/shops` - Create
- `PUT /api/admin/shops/{id}` - Update
- `DELETE /api/admin/shops/{id}` - Delete

### Products
- `GET /api/admin/products?page=1&search=term` - List
- `POST /api/admin/products` - Create
- `PUT /api/admin/products/{id}` - Update
- `DELETE /api/admin/products/{id}` - Delete

### Users
- `GET /api/admin/users?page=1&search=term` - List
- `PUT /api/admin/users/{id}/role` - Update role

## Database Structure

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Login email (unique)
- `password` - Hashed password
- `is_admin` - Boolean (0=user, 1=admin)
- `created_at` - Registration date
- `updated_at` - Last update

## Making a User Admin

### Via Database
```sql
UPDATE users SET is_admin = 1 WHERE email = 'user@example.com';
```

### Via Admin Panel
1. Log in as admin
2. Go to "Users & Roles"
3. Click "Make Admin" on the user
4. Confirm the action

## Composables Reference

| Composable | Purpose | Methods |
|------------|---------|---------|
| `useAdminStatistics` | Dashboard data | `fetchStatistics()` |
| `useAdminCategories` | Categories CRUD | `fetchCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()` |
| `useAdminShops` | Shops CRUD | `fetchShops()`, `createShop()`, `updateShop()`, `deleteShop()` |
| `useAdminProducts` | Products CRUD | `fetchProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()` |
| `useAdminUsers` | User management | `fetchUsers()`, `updateUserRole()` |

## Theme Classes

| Class | Purpose |
|-------|---------|
| `theme-background` | Page background |
| `theme-surface` | Card/panel background |
| `theme-text` | Primary text color |
| `theme-text-secondary` | Secondary text color |
| `theme-btn-primary` | Primary button style |
| `theme-btn-secondary` | Secondary button style |

## Middleware

### AdminMiddleware
- **Path:** `app/Http/Middleware/AdminMiddleware.php`
- **Alias:** `admin`
- **Checks:** Authentication + `is_admin` column
- **Redirect:** Home page with error message

## File Locations

### Controllers
```
app/Http/Controllers/Admin/
```

### Composables
```
resources/js/composables/useAdmin*.js
```

### Pages
```
resources/js/pages/Admin/
```

### Layout
```
resources/js/layouts/AdminLayout.vue
```

### Middleware
```
app/Http/Middleware/AdminMiddleware.php
```

## Common Issues & Solutions

### Issue: Cannot access admin panel
**Solution:** Ensure `is_admin = 1` in database

### Issue: 404 on admin routes
**Solution:** Run `npm run build` to compile assets

### Issue: Middleware not working
**Solution:** Check `bootstrap/app.php` has admin middleware alias

### Issue: Modal not showing
**Solution:** Clear browser cache and rebuild frontend

### Issue: Search not working
**Solution:** Check API routes return JSON with pagination

## Security Checklist

✅ All admin routes protected with middleware  
✅ AdminMiddleware checks authentication  
✅ AdminMiddleware checks is_admin column  
✅ Unauthorized users redirected  
✅ CSRF protection on forms  
✅ Request validation in controllers  
✅ Confirmation for destructive actions  

## Best Practices

1. **Always** use the composables for API calls
2. **Never** bypass middleware protection
3. **Always** validate user input in controllers
4. **Always** use confirmation dialogs for delete actions
5. **Always** show loading states during API calls
6. **Always** handle errors gracefully
7. **Always** use theme classes for styling

## Quick Testing Checklist

- [ ] Can log in as admin
- [ ] Can access `/admin`
- [ ] Dashboard shows statistics
- [ ] Can create category
- [ ] Can edit category
- [ ] Can delete category
- [ ] Can search categories
- [ ] Pagination works on categories
- [ ] Same tests for shops
- [ ] Same tests for products
- [ ] Can toggle user roles
- [ ] Non-admin cannot access admin panel
- [ ] Admin panel link shows in nav for admin users
- [ ] Admin panel link hidden for regular users

---

**Last Updated:** 2025-12-16  
**Laravel Version:** 10.x  
**Vue Version:** 3.x  
**Inertia.js Version:** Latest
