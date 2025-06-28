// Paystack TypeScript interfaces
export interface PaystackResponse {
  reference: string;
  trans: string;
  status: 'success' | 'failed' | 'cancelled';
  message: string;
  transaction: string;
  trxref: string;
  redirecturl?: string;
}

export interface PaystackCustomField {
  display_name: string;
  variable_name: string;
  value: string;
}

export interface PaystackMetadata {
  custom_fields?: PaystackCustomField[];
  [key: string]: string | number | boolean | PaystackCustomField[] | undefined;
}

export interface PaystackConfig {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
  text?: string;
  metadata?: PaystackMetadata;
  channels?: string[];
  currency?: string;
  onSuccess?: (response: PaystackResponse) => void;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
}

// PaystackButtonProps is the same as PaystackConfig for now
export type PaystackButtonProps = PaystackConfig; 