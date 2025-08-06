# Authentication Configuration Checklist

## Your Netlify Site Details:
- **Site URL**: https://2creativeapp.netlify.app
- **Admin URL**: https://app.netlify.com/projects/2creativeapp

## ✅ **1. Supabase Configuration**
Go to your Supabase project dashboard:

### Site URL Setting:
- Navigate to: **Authentication** → **Settings** → **Site URL**
- Set to: `https://2creativeapp.netlify.app`

### Redirect URLs:
- Navigate to: **Authentication** → **Settings** → **Redirect URLs**
- Add these URLs (one per line):
  ```
  https://2creativeapp.netlify.app/login
  https://2creativeapp.netlify.app/
  ```

## ✅ **2. Azure AD App Registration**
Go to Azure Portal → App registrations → Your app:

### Authentication Settings:
- Navigate to: **Authentication** → **Redirect URIs**
- Platform: **Web**
- Add redirect URI: `https://2creativeapp.netlify.app/login`

### Make sure these settings are correct:
- **ID tokens**: ✓ Enabled
- **Access tokens**: ✓ Enabled
- **Implicit grant and hybrid flows**: ✓ Both checked

## ✅ **3. Netlify Environment Variables** (Already Set)
The following environment variables are already configured:
- ✅ SUPABASE_URL
- ✅ SUPABASE_KEY  
- ✅ SUPABASE_AUTH_REDIRECT_URL (just added)

## **4. Test Authentication Flow**

After completing steps 1-2 above:

1. **Deploy your app**: `netlify deploy --prod`
2. **Test login**: Go to https://2creativeapp.netlify.app/login
3. **Click "Sign in with Microsoft"**
4. **Complete Microsoft login**
5. **Should redirect to**: https://2creativeapp.netlify.app/ (home page)

## **Common Issues & Solutions**

### Issue: Still redirecting to localhost
**Solution**: Make sure both Supabase Site URL and Azure AD redirect URI are updated

### Issue: CORS errors
**Solution**: Ensure Supabase Redirect URLs include your Netlify domain

### Issue: "Invalid redirect URI"
**Solution**: Double-check Azure AD redirect URI matches exactly: `https://2creativeapp.netlify.app/login`

### Issue: Authentication completes but redirects to login again
**Solution**: Check browser console for errors and ensure all environment variables are set in Netlify

## **Debug Commands**

Check Netlify environment variables:
```bash
netlify env:list
```

Check current deployment:
```bash
netlify status
```

Deploy to production:
```bash
netlify deploy --prod
```
