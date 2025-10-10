# 📧 Email Service Setup Guide

## Gmail SMTP Configuration

To enable email features (password reset, notifications), follow these steps:

### 1. Enable 2-Factor Authentication
- Go to [Google Account Settings](https://myaccount.google.com/)
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to [App Passwords](https://myaccount.google.com/apppasswords)
- Select "Mail" as the app
- Generate a 16-digit app password
- Copy this password (you'll need it for the .env file)

### 3. Configure Environment Variables
Add these to your `.env` file:

```bash
# Email Configuration (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password
FRONTEND_URL=http://localhost:3000
```

### 4. Test Email Service
Once configured, start your server:
```bash
npm start
```

You should see:
```
📧 Gmail SMTP email service initialized successfully
```

### 5. Test Password Reset
Try the password reset endpoint:
```bash
curl -X POST "http://localhost:3000/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Alternative: Other Email Providers

If you prefer other providers, you can modify `src/services/emailService.js`:

### Outlook/Hotmail
```javascript
service: 'outlook',
host: 'smtp-mail.outlook.com',
port: 587,
```

### Yahoo
```javascript
service: 'yahoo',
host: 'smtp.mail.yahoo.com',
port: 587,
```

### Custom SMTP
```javascript
host: 'your-smtp-server.com',
port: 587,
auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS
}
```

## Troubleshooting

### "Email service initialization failed"
- Check your Gmail credentials
- Ensure 2FA is enabled
- Verify the app password is correct (16 digits, no spaces)

### "Authentication failed"
- Make sure you're using an App Password, not your regular password
- Check that the Gmail account has 2FA enabled

### "Connection timeout"
- Check your internet connection
- Verify firewall settings allow SMTP connections on port 587

## Security Notes

- Never commit real email credentials to version control
- Use environment variables for all sensitive data
- App passwords are safer than regular passwords for SMTP
- Consider using dedicated email services for production (SendGrid, Mailgun, etc.)