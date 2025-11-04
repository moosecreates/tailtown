# Email Notifications System

## Overview

The Tailtown email notification system uses SendGrid to send automated emails to customers for various events such as reservation confirmations, reminders, and status changes.

## Features

### Supported Email Types

1. **Reservation Confirmation**
   - Sent when a reservation is created or confirmed
   - Includes reservation details, pet names, service info, date/time
   - Provides what-to-bring checklist

2. **Reservation Reminder**
   - Sent before the reservation date
   - Reminds customers of upcoming appointments
   - Includes all reservation details

3. **Reservation Status Change**
   - Sent when reservation status changes
   - Supports: CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, COMPLETED
   - Color-coded based on status

4. **Welcome Email**
   - Sent to new customers
   - Introduces the business and services
   - Provides next steps

5. **Custom/Test Emails**
   - Send custom HTML emails for testing
   - Useful for marketing campaigns

## Setup

### 1. Get SendGrid API Key

1. Sign up for a SendGrid account at https://sendgrid.com
2. Navigate to Settings > API Keys
3. Create a new API key with "Mail Send" permissions
4. Copy the API key

### 2. Configure Environment Variables

Add to `/services/customer/.env`:

```bash
# Email Configuration (SendGrid)
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Business Name
```

### 3. Verify Sender Email

In SendGrid:
1. Go to Settings > Sender Authentication
2. Verify your sender email address
3. Or set up domain authentication for better deliverability

## API Endpoints

All endpoints require tenant context (X-Tenant-Subdomain header or subdomain).

### Get Email Configuration Status

```http
GET /api/emails/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isConfigured": true,
    "fromEmail": "noreply@tailtown.com",
    "fromName": "Tailtown Pet Resort",
    "provider": "SendGrid"
  }
}
```

### Send Test Email

```http
POST /api/emails/test
Content-Type: application/json

{
  "to": "customer@example.com",
  "subject": "Test Email",
  "message": "This is a test message"
}
```

### Send Reservation Confirmation

```http
POST /api/emails/reservation-confirmation/:reservationId
```

**Example:**
```bash
curl -X POST http://localhost:4004/api/emails/reservation-confirmation/abc123 \
  -H "X-Tenant-Subdomain: dev"
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation email sent successfully",
  "sentTo": "customer@example.com"
}
```

### Send Reservation Reminder

```http
POST /api/emails/reservation-reminder/:reservationId
```

**Example:**
```bash
curl -X POST http://localhost:4004/api/emails/reservation-reminder/abc123 \
  -H "X-Tenant-Subdomain: dev"
```

### Send Welcome Email

```http
POST /api/emails/welcome/:customerId
```

**Example:**
```bash
curl -X POST http://localhost:4004/api/emails/welcome/customer123 \
  -H "X-Tenant-Subdomain: dev"
```

## Usage Examples

### From Backend Code

```typescript
import { emailService } from './services/email.service';

// Send reservation confirmation
await emailService.sendReservationConfirmation({
  reservation: reservationWithCustomerAndPets,
  businessName: 'Happy Tails Pet Resort',
  businessEmail: 'info@happytails.com',
  businessPhone: '(555) 123-4567',
});

// Send custom email
await emailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Special Promotion',
  html: '<h1>20% Off This Weekend!</h1><p>Book now...</p>',
});
```

### Automatic Triggers

You can integrate email sending into your reservation workflow:

```typescript
// In reservation controller after creating reservation
const reservation = await prisma.reservation.create({
  data: reservationData,
  include: {
    pet: true,
    service: { select: { name: true } },
  },
});

// Fetch customer
const customer = await prisma.customer.findUnique({
  where: { id: reservation.customerId },
});

// Send confirmation email
if (customer?.email) {
  const reservationWithData = {
    ...reservation,
    customer,
    pets: reservation.pet ? [reservation.pet] : [],
  };
  
  await emailService.sendReservationConfirmation({
    reservation: reservationWithData,
    businessName: tenant.businessName,
  });
}
```

## Email Templates

All emails use responsive HTML templates with:
- Professional header with business branding
- Clean, readable content area
- Mobile-friendly design
- Consistent styling across all email types

### Template Customization

To customize email templates, edit `/services/customer/src/services/email.service.ts`:

1. Locate the email method (e.g., `sendReservationConfirmation`)
2. Modify the HTML template in the `html` variable
3. Maintain responsive design principles
4. Test on multiple email clients

## Best Practices

### 1. Email Deliverability

- **Verify your domain** in SendGrid for better deliverability
- **Use a professional from address** (e.g., noreply@yourdomain.com)
- **Avoid spam triggers** in subject lines and content
- **Include unsubscribe links** for marketing emails

### 2. Error Handling

The email service gracefully handles errors:
- Logs warnings if SendGrid is not configured
- Throws errors for failed sends
- Provides detailed error messages

```typescript
try {
  await emailService.sendEmail(options);
} catch (error) {
  console.error('Failed to send email:', error);
  // Handle error appropriately
}
```

### 3. Testing

Before going to production:

1. **Test with real email addresses**
   ```bash
   curl -X POST http://localhost:4004/api/emails/test \
     -H "Content-Type: application/json" \
     -H "X-Tenant-Subdomain: dev" \
     -d '{"to":"your@email.com","subject":"Test","message":"Testing SendGrid"}'
   ```

2. **Check spam folders** to ensure delivery
3. **Test on multiple email clients** (Gmail, Outlook, Apple Mail)
4. **Verify mobile responsiveness**

### 4. Rate Limiting

SendGrid has rate limits based on your plan:
- Free tier: 100 emails/day
- Essentials: 40,000-100,000 emails/month
- Pro: 1.5M+ emails/month

Monitor your usage in the SendGrid dashboard.

## Troubleshooting

### Emails Not Sending

1. **Check API Key**
   ```bash
   curl http://localhost:4004/api/emails/config
   ```
   Verify `isConfigured: true`

2. **Check SendGrid Dashboard**
   - Go to Activity Feed in SendGrid
   - Look for delivery errors
   - Check bounce/block lists

3. **Verify Sender Email**
   - Ensure sender email is verified in SendGrid
   - Check domain authentication status

### Emails Going to Spam

1. **Set up domain authentication** (SPF, DKIM, DMARC)
2. **Avoid spam trigger words** in subject/content
3. **Include physical address** in footer
4. **Add unsubscribe link** for marketing emails
5. **Maintain good sender reputation**

### Common Errors

**"SendGrid API key not configured"**
- Add `SENDGRID_API_KEY` to `.env` file
- Restart the service

**"Failed to send email: Unauthorized"**
- Verify API key is correct
- Check API key permissions in SendGrid

**"Customer email not found"**
- Ensure customer has an email address in database
- Check customer record

## Monitoring

### Email Logs

All email sends are logged:
```
[Email Service] Email sent to customer@example.com: Reservation Confirmed
```

### SendGrid Analytics

Monitor in SendGrid dashboard:
- Delivery rates
- Open rates (if tracking enabled)
- Click rates
- Bounce rates
- Spam reports

## Future Enhancements

- [ ] Email templates stored in database
- [ ] Visual email template editor
- [ ] Scheduled email sending
- [ ] Email preferences per customer
- [ ] Bulk email campaigns
- [ ] A/B testing for email content
- [ ] Advanced analytics and reporting
- [ ] SMS notifications integration
- [ ] Multi-language support

## Related Documentation

- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)
- [Reservation System](./reservation-system.md)
- [Customer Management](./customer-management.md)
