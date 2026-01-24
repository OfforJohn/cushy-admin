// premiumFeaturesPayload.ts
// This file exports the default Premium Features payload structure for dynamic use.

export interface PremiumFeature {
  icon: string;
  text: string;
  color: string;
}

export interface PremiumPayload {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  backgroundColor: string;
  badges: string[];
  features: PremiumFeature[];
  cta: {
    text: string;
    icon: string;
  };
  route: string;
}

export const defaultPremiumPayload: PremiumPayload = {
  title: '',
  subtitle: '',
  description: '',
  icon: '',
  backgroundColor: '',
  badges: [],
  features: [],
  cta: {
    text: '',
    icon: ''
  },
  route: ''
};
