# Email Configuration Setup

## Environment Variables Required

Add the following environment variables to your `.env` file:

```bash
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Select "Security" → "2-Step Verification" → "App passwords"
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

## Testing Email Configuration

### Method 1: Admin Panel Testing (Recommended)
1. Start your development server: `yarn rw dev`
2. Log in as an admin user
3. Navigate to Admin Panel
4. Use the **Email Configuration Test** section to test basic email setup
5. Use the **Admin Notification Test** section to test admin notifications

### Method 2: Enhanced Email Testing Interface (Recommended)

Visit the comprehensive email testing page at `/email-test`:

#### Features:
- **Email Provider Detection**: Automatically identifies Gmail, Outlook, Yahoo, or other providers
- **General Email Test**: Standard email delivery testing
- **Enhanced Outlook Test**: Specialized testing with Outlook-optimized settings
- **Provider Validation**: Checks email format and provides provider-specific guidance
- **Real-time Results**: Shows delivery status, message ID, and provider information

#### Testing Steps:
1. Navigate to: `http://your-domain.com/email-test`
2. Enter your email address (preferably Outlook/Hotmail for compatibility testing)
3. Click "Validate Provider" to see provider-specific information
4. Choose between "General Test" or "Enhanced Outlook Test"
5. Check results for success/failure status and troubleshooting guidance

### Method 3: GraphQL Testing

You can test using GraphQL Playground at `/graphql`:

```graphql
# Test general email delivery
query TestEmailDelivery {
  testEmailDelivery(recipientEmail: "your-email@outlook.com") {
    success
    message
    error
    messageId
    provider
    timestamp
  }
}

# Send enhanced Outlook test
mutation SendOutlookTest {
  sendOutlookTestEmail(recipientEmail: "your-email@outlook.com") {
    success
    message
    error
    messageId
    provider
    timestamp
  }
}
```

### Method 4: API Testing
```javascript
// Test via GraphQL or API endpoint
fetch('/api/functions/testEmail', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your-test-email@gmail.com' })
})
```

### Method 5: Real-world Testing
1. Create a test user account
2. Submit various types of requests (supply, asset, vacation)
3. Check that admins receive notification emails immediately
4. Approve/reject the requests as admin
5. Verify users receive approval/rejection emails

## Email Notifications Trigger Events

The system will automatically send emails when:

### For Users:
1. **Supply Requests**:
   - ✅ Request approved
   - ❌ Request rejected

2. **Asset Requests**:
   - ✅ Request approved (with asset assignment)
   - ❌ Request rejected

3. **Vacation Requests**:
   - ✅ Request approved
   - ❌ Request rejected

### For Admins:
**Immediate notifications when users create new requests:**

1. **Supply Request Notifications** 📦:
   - New supply request submitted
   - Includes: item details, quantity, requester info, department
   - Sent to all users with ADMIN role

2. **Asset Request Notifications** 💻:
   - New asset request submitted
   - Includes: asset category, return date, requester info, reason
   - Sent to all users with ADMIN role

3. **Vacation Request Notifications** 🌴:
   - New vacation request submitted
   - Includes: dates, duration, requester info, reason
   - Sent to all users with ADMIN role

**Note**: Admin notifications are sent immediately when requests are created and help ensure quick response times for approval/rejection decisions.

## Email Templates

All emails include:
- Professional HTML templates
- Company branding 
- Request details and status
- Admin notes/reasons for rejection
- Clear call-to-action information

## Troubleshooting

### Common Issues:

1. **Authentication Error**: Check your app password is correct
2. **Connection Timeout**: Verify SMTP host and port
3. **SSL/TLS Issues**: Most providers use port 587 with STARTTLS

### Outlook-Specific Issues:

**If emails work with Gmail but not Outlook:**

1. **Check Spam/Junk Folder**: Outlook has stricter spam filtering
   - Check Outlook spam folder
   - Add sender to safe senders list
   - Check Outlook quarantine (admin panel)

2. **SMTP Configuration for Outlook**:
   ```bash
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password
   ```

3. **Outlook Security Settings**:
   - Enable "Less secure app access" in Outlook settings
   - Use app-specific passwords for Microsoft accounts
   - Check if two-factor authentication is blocking emails

4. **Domain Reputation Issues**:
   - Outlook may block emails from new/untrusted domains
   - Consider using a professional email service (SendGrid, Mailgun)
   - Set up proper SPF/DKIM records for your domain

5. **Content Filtering**:
   - Outlook may flag HTML-heavy emails
   - Our templates now include plain text versions
   - Avoid spam trigger words in subject lines

### Email Delivery Checklist:

✅ **Gmail Working**: Emails deliver successfully to Gmail accounts  
❌ **Outlook Issues**: Emails not reaching Outlook/Hotmail accounts  

**Quick Fixes to Try:**
1. Check Outlook spam/junk folder
2. Add `noreply@yourdomain.com` to Outlook safe senders
3. Try sending from a different email address
4. Use Outlook-specific SMTP settings above
5. Enable debug logging to see detailed SMTP logs

### Testing:
- Use the built-in test email function
- Check server logs for detailed error messages
- Verify environment variables are loaded correctly

## Security Notes

- Never commit SMTP credentials to version control
- Use app passwords instead of main account passwords
- Consider using environment-specific email addresses
- Monitor email sending logs for security

## Production Deployment

For production, consider:
- Using a dedicated email service (SendGrid, Mailgun, etc.)
- Setting up proper SPF/DKIM records
- Using a professional email address for the sender
- Implementing email rate limiting
