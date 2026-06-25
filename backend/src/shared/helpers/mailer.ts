import { logger } from '../../app/logger';

/**
 * Mail transport stub. In development it logs the message (so verification /
 * reset links are visible in the console). Wire a real SMTP/provider in prod.
 */
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export const sendMail = async (message: MailMessage): Promise<void> => {
  // TODO(mail): integrate a real provider (nodemailer/SES/Resend) for production.
  logger.info('📧 [mail:stub] outgoing email', {
    to: message.to,
    subject: message.subject,
    text: message.text,
  });
  await Promise.resolve();
};
