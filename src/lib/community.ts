import { env } from './env';

export const supportEmail = env.NEXT_PUBLIC_SUPPORT_EMAIL;
export const whatsappLearningCommunityUrl =
  env.NEXT_PUBLIC_WHATSAPP_LEARNING_COMMUNITY_URL ??
  env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL ??
  '';
export const whatsappTribeCommunityUrl = env.NEXT_PUBLIC_WHATSAPP_TRIBE_COMMUNITY_URL;
export const whatsappSupportUrl = env.NEXT_PUBLIC_WHATSAPP_SUPPORT_URL ?? '';

export const whatsappCommunityUrl = whatsappLearningCommunityUrl;
