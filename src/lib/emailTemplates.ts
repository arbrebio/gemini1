import { config } from './config';

// Email template utility functions
export async function loadEmailTemplate(templateName: string): Promise<string> {
  try {
    const templates: Record<string, { default: string }> = {
      'contact-admin': await import('../emails/contact-admin.html?raw'),
      'contact-auto-reply': await import('../emails/contact-auto-reply.html?raw'),
      'newsletter-confirmation': await import('../emails/newsletter-confirmation.html?raw')
    };

    return templates[templateName]?.default || '';
  } catch (error) {
    return '';
  }
}

export function replaceEmailVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  
  // Replace all {{variable}} placeholders with actual values
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return result;
}

export function getEmailVariables(type: 'contact' | 'newsletter', data: any = {}) {
  const baseVariables = {
    senderName: config.contact.senderName,
    adminEmail: config.contact.adminEmail,
    logo: config.company.logo,
    address: config.contact.offices[0].address,
    city: config.contact.offices[0].city,
    country: config.contact.offices[0].country,
    phone: config.contact.offices[0].phone,
    whatsappNumber: config.contact.whatsappNumber,
    timestamp: new Date().toLocaleString(),
    baseUrl: config.site.url
  };

  if (type === 'contact') {
    return {
      ...baseVariables,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      interest: data.interest || '',
      message: data.message || ''
    };
  }

  if (type === 'newsletter') {
    return {
      ...baseVariables,
      fullName: data.full_name || 'there',
      email: data.email || '',
      confirmationUrl: `${baseVariables.baseUrl}/newsletter/confirm?token=${data.confirmation_token}`,
      unsubscribeUrl: `${baseVariables.baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(data.email)}`
    };
  }

  return baseVariables;
}