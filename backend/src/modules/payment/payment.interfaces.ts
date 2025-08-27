export interface PaymentItem {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  quantity: number;
  price: number;
}

export interface PayerAddress {
  street_name: string;
  street_number: string;
  zip_code: string;
}

export interface PayerPhone {
  area_code: string;
  number: string;
}

export interface Payer {
  name: string;
  surname: string;
  email: string;
  phone?: PayerPhone;
  address?: PayerAddress;
}

export interface CreateOrderDto {
  items: PaymentItem[];
  payer?: Payer;
  external_reference?: string;
  order_id?: string;
  customer_id?: string;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  preference_id: string;
}

export interface WebhookNotification {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription';
  date_created: string;
  application_id: number;
  user_id: string;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}
