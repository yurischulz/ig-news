import Stripe from 'stripe';
import { version } from '../../package.json';

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY,
  {
    apiVersion: process.env.STRIPE_API_VERSION,
    appInfo: {
      name: process.env.STRIPE_APP_NAME,
      version: version
    }
  }
);