const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://www.haemologix.in';

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '');
