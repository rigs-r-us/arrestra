import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const FROM_ADDRESS = 'Arrestra Alerts <alerts@arrestra.com>';

const client = new SESv2Client({ region: process.env.AWS_REGION || 'us-west-2' });

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}) {
  if (to.length === 0) return;

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_ADDRESS,
      Destination: { ToAddresses: to },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: html, Charset: 'UTF-8' },
            Text: { Data: text, Charset: 'UTF-8' },
          },
        },
      },
    })
  );
}
