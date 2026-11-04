/**
 * Client for the Wafi iPhone 18 order API.
 *
 * Every endpoint sends `Access-Control-Allow-Origin: *`, so the static site
 * calls it straight from the browser. Amounts are in halalas (599900 = 5,999 SAR).
 */

export const API_BASE = 'https://wafii.sa/wafiservices/api/iphone18';
/** Verify lives one level up from the iPhone 18 routes. */
export const VERIFY_URL = 'https://wafii.sa/wafiservices/api/moyasar/verify';

export type Variant = {
  id: number;
  color: string;
  color_label_ar: string;
  storage_label: string;
  /** Halalas. */
  price: number;
};

export type Branch = {
  id: number;
  name_ar: string;
  city: string | null;
  address: string | null;
};

export type FulfillmentMethod = 'pickup' | 'shipping';

export type CreateOrderBody = {
  variant_id: number;
  customer_name: string;
  customer_phone: string;
  /** Required by the API; used for the post-payment confirmation e-mail. */
  customer_email: string;
  fulfillment_method: FulfillmentMethod;
} & (
  | { fulfillment_method: 'pickup'; branch_id: number; pickup_date: string }
  | { fulfillment_method: 'shipping'; city: string; district: string; national_address: string }
);

export type OrderStatus = 'pending_payment' | 'paid' | 'cancelled' | (string & {});

export type CreatedOrder = {
  order_number: string;
  /** Halalas. */
  amount: number;
  currency: string;
  status: OrderStatus;
};

export type OrderDetails = CreatedOrder & Record<string, unknown>;

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError('network', 0);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Empty or non-JSON body.
  }

  if (!response.ok) {
    const body = (payload ?? {}) as { message?: string; errors?: Record<string, string[]> };
    throw new ApiError(body.message ?? `HTTP ${response.status}`, response.status, body.errors);
  }
  return payload as T;
}

/** List endpoints wrap their rows in `{ data: [...] }`; accept a bare array too. */
function unwrap<T>(payload: { data: T[] } | T[]): T[] {
  return Array.isArray(payload) ? payload : (payload?.data ?? []);
}

/** Single-object endpoints may or may not wrap in `{ data }`. */
function unwrapOne<T>(payload: T | { data: T }): T {
  return payload && typeof payload === 'object' && 'data' in payload
    ? (payload as { data: T }).data
    : (payload as T);
}

export async function getVariants(): Promise<Variant[]> {
  return unwrap(await request<{ data: Variant[] }>(`${API_BASE}/variants`));
}

export async function getBranches(): Promise<Branch[]> {
  return unwrap(await request<{ data: Branch[] }>(`${API_BASE}/branches`));
}

export async function createOrder(body: CreateOrderBody): Promise<CreatedOrder> {
  return unwrapOne(
    await request<CreatedOrder>(`${API_BASE}/orders`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );
}

export async function getOrder(orderNumber: string): Promise<OrderDetails> {
  return unwrapOne(
    await request<OrderDetails>(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}`),
  );
}

export async function verifyPayment(paymentId: string, orderNumber: string): Promise<unknown> {
  return request(VERIFY_URL, {
    method: 'POST',
    body: JSON.stringify({ id: paymentId, client_reference: orderNumber }),
  });
}
