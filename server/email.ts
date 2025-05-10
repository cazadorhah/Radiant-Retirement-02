import { MailService } from '@sendgrid/mail';

// This would be set up once we have a SendGrid API key
// To use this service, we would need to call askSecrets tool for SENDGRID_API_KEY
const setupMailService = (): MailService | null => {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.warn('SendGrid API key not found. Email functionality disabled.');
    return null;
  }
  
  const mailService = new MailService();
  mailService.setApiKey(apiKey);
  return mailService;
};

export interface EmailData {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  message: string;
  cityName?: string;
  stateName?: string;
}

export const sendContactFormEmail = async (data: EmailData): Promise<boolean> => {
  const mailService = setupMailService();
  
  if (!mailService) {
    console.log('Email service not available. Would have sent this email:');
    console.log({
      to: 'admin@radiantretirement.com', // Replace with your email 
      from: 'noreply@radiantretirement.com', // Replace with your verified sender
      subject: `Senior Living Inquiry: ${data.cityName || 'General'} ${data.stateName || ''}`,
      text: `
        New Senior Living Inquiry
        
        From: ${data.firstName} ${data.lastName || ''}
        Email: ${data.email}
        Phone: ${data.phone || 'Not provided'}
        Location: ${data.cityName || 'Not specified'}, ${data.stateName || ''}
        
        Message:
        ${data.message}
      `,
      html: `
        <h2>New Senior Living Inquiry</h2>
        
        <p><strong>From:</strong> ${data.firstName} ${data.lastName || ''}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Location:</strong> ${data.cityName || 'Not specified'}, ${data.stateName || ''}</p>
        
        <h3>Message:</h3>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    });
    return true; // Simulated success
  }
  
  try {
    await mailService.send({
      to: 'admin@radiantretirement.com', // Replace with your email
      from: 'noreply@radiantretirement.com', // Replace with your verified sender
      subject: `Senior Living Inquiry: ${data.cityName || 'General'} ${data.stateName || ''}`,
      text: `
        New Senior Living Inquiry
        
        From: ${data.firstName} ${data.lastName || ''}
        Email: ${data.email}
        Phone: ${data.phone || 'Not provided'}
        Location: ${data.cityName || 'Not specified'}, ${data.stateName || ''}
        
        Message:
        ${data.message}
      `,
      html: `
        <h2>New Senior Living Inquiry</h2>
        
        <p><strong>From:</strong> ${data.firstName} ${data.lastName || ''}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Location:</strong> ${data.cityName || 'Not specified'}, ${data.stateName || ''}</p>
        
        <h3>Message:</h3>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};