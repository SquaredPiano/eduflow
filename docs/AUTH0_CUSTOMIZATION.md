# Auth0 Login Page Customization Guide

## Overview
Auth0 Universal Login page customization is done through the Auth0 Dashboard, not through code. This ensures security and consistency across authentication flows.

## Accessing Customization Settings

1. **Log in to Auth0 Dashboard**: https://manage.auth0.com/
2. **Navigate to Branding** → **Universal Login**
3. **Choose your customization level**:
   - **Basic Customization** (recommended): Logo, colors, fonts
   - **Advanced Customization** (requires paid plan): Full HTML/CSS/JS control

## EduFlow Green Theme Settings

### Logo
- Upload EduFlow logo (graduation cap icon)
- Recommended size: 150x150px
- Format: PNG with transparency

### Primary Color
```
#0b8e16
```
This green color matches the EduFlow brand throughout the app.

### Background Color Options
- **Clean White**: `#FFFFFF` (recommended)
- **Subtle Green**: `#F0FDF4` (very light green background)

### Button Colors
- **Primary Button**: `#0b8e16`
- **Button Hover**: `#097a12`
- **Button Text**: `#FFFFFF`

### Font Settings
- **Font Family**: System UI / Inter
- **Heading Font**: Bold, 24px
- **Body Font**: Regular, 14px

## Basic Customization Steps

1. **Branding** → **Universal Login** → **Settings**
2. Set **Logo URL** to your hosted logo image
3. Set **Primary Color** to `#0b8e16`
4. Set **Page Background** to:
   - **Type**: Color
   - **Color**: `#FFFFFF` or `#F0FDF4`
5. Enable **Customize Login Page**
6. Click **Save Changes**

## Advanced Customization (Paid Plans Only)

If you have an Auth0 paid plan, you can fully customize the HTML/CSS:

### Custom CSS Example
```css
/* Override Auth0 default styles with EduFlow green theme */
.auth0-lock-header-logo {
  /* Your logo customization */
}

.auth0-lock-submit {
  background: #0b8e16 !important;
}

.auth0-lock-submit:hover {
  background: #097a12 !important;
}

.auth0-lock-input-email:focus,
.auth0-lock-input-password:focus {
  border-color: #0b8e16 !important;
}

/* Green accent for links */
.auth0-lock-alternative-link {
  color: #0b8e16 !important;
}

.auth0-lock-alternative-link:hover {
  color: #097a12 !important;
}
```

## Testing Your Changes

1. After saving, click **Try** in the Auth0 dashboard
2. Or test in your app: `http://localhost:3000/api/auth/login`
3. Verify:
   - ✅ Logo appears correctly
   - ✅ Green color theme matches EduFlow
   - ✅ Buttons use correct hover states
   - ✅ Forms are styled consistently

## Current Implementation

EduFlow uses **Auth0 v4 (@auth0/nextjs-auth0)** with manual implementation:
- Login: `/api/auth/login`
- Logout: `/api/auth/logout`
- Callback: `/api/auth/callback`
- Session: Cookie-based (`appSession`)

The login page styling is controlled entirely by Auth0 Universal Login settings in the Auth0 dashboard.

## Branding Consistency Checklist

- [ ] Logo matches EduFlow dashboard header
- [ ] Primary green (#0b8e16) used for buttons
- [ ] Background is clean and not distracting
- [ ] Font matches system UI (Inter/San Francisco)
- [ ] "Continue" button is prominent
- [ ] Links use green hover state
- [ ] Mobile responsive (Auth0 handles this automatically)

## Reference
- Auth0 Branding Docs: https://auth0.com/docs/customize/universal-login-pages/universal-login-page-customization
- EduFlow Primary Green: `#0b8e16`
- EduFlow Secondary Green: `#097a12`

---

**Note**: If you need more extensive customization beyond what Auth0 Universal Login provides, consider implementing a custom authentication UI (requires significantly more development work and security considerations).
