#!/usr/bin/env node

/**
 * Test Notification Services
 * 
 * This script tests Twilio SMS and SendGrid email configuration
 * Run: node scripts/test-notifications.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🔔 Tailtown Notification Services Test\n');
  console.log('This script will test your Twilio and SendGrid configuration.\n');

  // Check environment variables
  console.log('📋 Checking configuration...\n');

  const sendgridConfigured = !!process.env.SENDGRID_API_KEY;
  const twilioConfigured = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  console.log(`SendGrid: ${sendgridConfigured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Twilio: ${twilioConfigured ? '✅ Configured' : '❌ Not configured'}\n`);

  if (!sendgridConfigured && !twilioConfigured) {
    console.log('❌ No services configured. Please add credentials to .env file.');
    console.log('See docs/TWILIO-SENDGRID-SETUP.md for instructions.\n');
    rl.close();
    return;
  }

  // Test SendGrid
  if (sendgridConfigured) {
    console.log('📧 Testing SendGrid Email...\n');
    const testEmail = await question('Enter email address to test: ');

    if (testEmail && testEmail.includes('@')) {
      try {
        const { emailService } = require('../services/customer/dist/services/email.service');
        
        await emailService.sendEmail({
          to: testEmail,
          subject: 'Test Email from Tailtown',
          html: `
            <h1>✅ Success!</h1>
            <p>SendGrid is configured correctly and working.</p>
            <p>This is a test email sent at ${new Date().toLocaleString()}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Tailtown Pet Resort Management System<br>
              Notification Service Test
            </p>
          `
        });

        console.log('✅ Email sent successfully!');
        console.log(`   Check ${testEmail} for the test message.\n`);
      } catch (error) {
        console.error('❌ Email failed:', error.message);
        console.log('   Check your SendGrid API key and sender verification.\n');
      }
    } else {
      console.log('⏭️  Skipping email test (invalid email)\n');
    }
  }

  // Test Twilio
  if (twilioConfigured) {
    console.log('📱 Testing Twilio SMS...\n');
    const testPhone = await question('Enter phone number to test (format: +1234567890): ');

    if (testPhone && testPhone.match(/^\+?\d{10,15}$/)) {
      try {
        const { smsService } = require('../services/customer/dist/services/sms.service');
        
        const result = await smsService.sendSMS({
          to: testPhone,
          message: `✅ Tailtown SMS Test: Twilio is configured correctly! Sent at ${new Date().toLocaleTimeString()}`
        });

        if (result.success) {
          console.log('✅ SMS sent successfully!');
          console.log(`   Message ID: ${result.messageId}`);
          console.log(`   Check ${testPhone} for the test message.\n`);
        } else {
          console.error('❌ SMS failed:', result.error);
          console.log('   Check your Twilio credentials and phone number.\n');
        }
      } catch (error) {
        console.error('❌ SMS failed:', error.message);
        console.log('   Check your Twilio configuration.\n');
      }
    } else {
      console.log('⏭️  Skipping SMS test (invalid phone number)\n');
    }
  }

  // Summary
  console.log('📊 Test Summary\n');
  console.log('Configuration Status:');
  console.log(`  SendGrid: ${sendgridConfigured ? '✅ Ready' : '❌ Needs setup'}`);
  console.log(`  Twilio: ${twilioConfigured ? '✅ Ready' : '❌ Needs setup'}\n`);

  if (!sendgridConfigured || !twilioConfigured) {
    console.log('📖 Next Steps:');
    console.log('  1. Review docs/TWILIO-SENDGRID-SETUP.md');
    console.log('  2. Add missing credentials to .env file');
    console.log('  3. Restart services: pm2 restart customer-service');
    console.log('  4. Run this test again\n');
  } else {
    console.log('🎉 All notification services are configured and working!\n');
  }

  rl.close();
}

main().catch(error => {
  console.error('❌ Test failed:', error);
  rl.close();
  process.exit(1);
});
