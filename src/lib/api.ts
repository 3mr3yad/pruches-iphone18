/**
 * Client for the Wafi iPhone 18 order API.
 *
 * The API allows CORS from https://iphone18.wafi.sa only (localhost is
 * blocked). Amounts are in halalas (599900 = 5,999 SAR). The order's
 * `amount` is final: the backend adds the 4900 shipping fee itself.
 */

/** Override with NEXT_PUBLIC_API_BASE (e.g. a local backend) for testing; defaults to production. */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://wafii.sa/wafiservices/api/iphone18';
/** Verify lives one level up from the iPhone 18 routes. */
export const VERIFY_URL = 'https://wafii.sa/wafiservices/api/moyasar/verify';
/** The customer's printable tax invoice (a backend page, not an API route). */
export const INVOICE_BASE = 'https://wafii.sa/wafiservices/iphone18/invoice';

/**
 * Link to a paid order's invoice. The backend unlocks it with the Moyasar
 * payment id (from Moyasar's redirect), since order numbers are guessable.
 */
export function invoiceUrl(orderNumber: string, paymentId: string): string {
  return `${INVOICE_BASE}/${encodeURIComponent(orderNumber)}?p=${encodeURIComponent(paymentId)}`;
}

export type Variant = {
  id: number;
  color: string;
  color_label_ar: string;
  storage_label: string;
  /** Halalas. */
  price: number;
  /**
   * Regional edition: "middle_east" | "international". Each (color, edition)
   * pair is its own row with its own id and price, so the chosen edition is
   * carried by `variant_id` alone. Optional only so an older catalog without
   * editions still loads (the page then prices from EDITIONS in content.ts).
   */
  edition?: string | null;
};

/** An optional extra sold with the phone. Price in halalas, set by the backend. */
export type Addon = {
  id: number;
  /** Stable key used to pick the photo (ADDONS_META in content.ts). */
  key: string;
  name_ar: string;
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
  /** Optional extras with quantities; the backend prices them and adds them to the order's amount. */
  addons?: { id: number; quantity: number }[];
} & (
  | {
      fulfillment_method: 'pickup';
      branch_id: number;
      pickup_date: string;
      /** "20:00" or "21:00" (the API accepts 18:00–21:00). */
      pickup_time: string;
    }
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

export type OrderDetails = CreatedOrder & {
  pickup_time?: string | null;
  /** pickup_date + pickup_time, for display. */
  pickup_at?: string | null;
} & Record<string, unknown>;

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

export async function getAddons(): Promise<Addon[]> {
  const addons = unwrap(await request<{ data: Addon[] }>(`${API_BASE}/addons`));
  // The API names the EarPods «… USB-C – إيربودز»; drop the trailing «– إيربودز».
  return addons.map((addon) => ({
    ...addon,
    name_ar: addon.name_ar.replace(/\s*[-–—]?\s*إيربودز\s*/g, ' ').trim(),
  }));
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
