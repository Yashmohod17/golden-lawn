export interface BroadcastInput {
  title: string;
  message: string;
  category?: string;
  priority?: string;
  targetRole?: string; // OWNER, MANAGER, STAFF, CUSTOMER, ALL
}

export function validateBroadcastInput(input: any): { error?: string; value?: BroadcastInput } {
  const { title, message, category, priority, targetRole } = input;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return { error: 'Notification title is required and must be a string' };
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { error: 'Notification message is required and must be a string' };
  }

  const allowedCategories = ['BOOKING', 'PAYMENT', 'EVENT', 'SYSTEM'];
  const finalCategory = category ? String(category).toUpperCase() : 'SYSTEM';
  if (category && !allowedCategories.includes(finalCategory)) {
    return { error: `Category must be one of: ${allowedCategories.join(', ')}` };
  }

  const allowedPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const finalPriority = priority ? String(priority).toUpperCase() : 'LOW';
  if (priority && !allowedPriorities.includes(finalPriority)) {
    return { error: `Priority must be one of: ${allowedPriorities.join(', ')}` };
  }

  const allowedRoles = ['OWNER', 'MANAGER', 'STAFF', 'CUSTOMER', 'ALL'];
  const finalTargetRole = targetRole ? String(targetRole).toUpperCase() : 'ALL';
  if (targetRole && !allowedRoles.includes(finalTargetRole)) {
    return { error: `Target role must be one of: ${allowedRoles.join(', ')}` };
  }

  return {
    value: {
      title: title.trim(),
      message: message.trim(),
      category: finalCategory,
      priority: finalPriority,
      targetRole: finalTargetRole
    }
  };
}

export interface PreferenceInput {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
}

export function validatePreferenceInput(input: any): { error?: string; value?: PreferenceInput } {
  const { emailEnabled, inAppEnabled } = input;
  const value: PreferenceInput = {};

  if (emailEnabled !== undefined) {
    if (typeof emailEnabled !== 'boolean') {
      return { error: 'emailEnabled must be a boolean' };
    }
    value.emailEnabled = emailEnabled;
  }

  if (inAppEnabled !== undefined) {
    if (typeof inAppEnabled !== 'boolean') {
      return { error: 'inAppEnabled must be a boolean' };
    }
    value.inAppEnabled = inAppEnabled;
  }

  if (emailEnabled === undefined && inAppEnabled === undefined) {
    return { error: 'At least one preference setting must be provided' };
  }

  return { value };
}

export interface TemplateUpdateInput {
  subject?: string;
  body?: string;
}

export function validateTemplateUpdate(input: any): { error?: string; value?: TemplateUpdateInput } {
  const { subject, body } = input;
  const value: TemplateUpdateInput = {};

  if (subject !== undefined) {
    if (typeof subject !== 'string' || !subject.trim()) {
      return { error: 'Subject must be a non-empty string' };
    }
    value.subject = subject.trim();
  }

  if (body !== undefined) {
    if (typeof body !== 'string' || !body.trim()) {
      return { error: 'Body must be a non-empty string' };
    }
    value.body = body.trim();
  }

  if (subject === undefined && body === undefined) {
    return { error: 'At least one template field must be provided' };
  }

  return { value };
}
