import https from 'https';
import fs from 'fs';
import path from 'path';

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export class EmailService {
  private static getApiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  }

  private static getFromAddress(): string {
    return process.env.RESEND_FROM_EMAIL || 'Golden Celebration Lawn <onboarding@resend.dev>';
  }

  /**
   * Sends an email via Resend API or logs it locally if API key is not present.
   */
  public static async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = this.getApiKey();
    const from = this.getFromAddress();
    const { to, subject, body } = options;

    const htmlContent = body.replace(/\n/g, '<br />');

    if (!apiKey || apiKey === 'mock' || apiKey === 'YOUR_RESEND_API_KEY') {
      // Log locally
      const logMessage = `
========================================
[MOCK EMAIL DELIVERED]
Timestamp: ${new Date().toISOString()}
From: ${from}
To: ${to}
Subject: ${subject}
----------------------------------------
${body}
========================================
`;
      console.log(logMessage);

      // Write to local logs file for auditing
      try {
        const scratchDir = path.join(__dirname, '../../scratch');
        if (!fs.existsSync(scratchDir)) {
          fs.mkdirSync(scratchDir, { recursive: true });
        }
        const logFilePath = path.join(scratchDir, 'email-logs.txt');
        fs.appendFileSync(logFilePath, logMessage);
      } catch (err) {
        console.error('Failed to write mock email to file:', err);
      }

      return { success: true, messageId: `mock-msg-${Date.now()}` };
    }

    // Call Resend API
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        from,
        to: [to],
        subject,
        html: htmlContent,
      });

      const reqOptions = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(reqOptions, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(responseBody);
              resolve({ success: true, messageId: result.id });
            } catch (err) {
              resolve({ success: true, messageId: 'unknown-id' });
            }
          } else {
            console.error(`Resend API returned status code ${res.statusCode}: ${responseBody}`);
            resolve({
              success: false,
              error: `Resend API Error (Status ${res.statusCode}): ${responseBody}`,
            });
          }
        });
      });

      req.on('error', (err) => {
        console.error('Failed to send email via Resend API:', err);
        resolve({
          success: false,
          error: `Network Error: ${err.message}`,
        });
      });

      req.write(postData);
      req.end();
    });
  }
}
