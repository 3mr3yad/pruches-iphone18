'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FLOW, PRODUCT_NAME_AR, RIYAL } from '@/lib/content';
import { formatHalalas } from '@/lib/format';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { Spinner } from './Steps';
import './moyasar-theme.css';

/**
 * Moyasar Payment Form (https://docs.moyasar.com/guides/card-payments/basic-integration).
 *
 * Configure through build-time env vars (Cloudflare → Settings → Variables):
 *   NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY  pk_test_… / pk_live_…   (required)
 *   NEXT_PUBLIC_MOYASAR_METHODS          creditcard,stcpay,applepay (default: creditcard)
 */
const MPF_VERSION = '1.14.0';
const MPF_JS = `https://cdn.moyasar.com/mpf/${MPF_VERSION}/moyasar.js`;
const MPF_CSS = `https://cdn.moyasar.com/mpf/${MPF_VERSION}/moyasar.css`;

/**
 * Publishable keys are public by design (they can only create payments), so a
 * default lives here: the LIVE key, so production charges real cards.
 * For local testing put the test key in .env.local (git-ignored):
 *   NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=pk_test_…
 * Never put the secret key (sk_…) in this site — it belongs on the backend only.
 */
const DEFAULT_PUBLISHABLE_KEY = 'pk_live_C331tnRE2myosC83BCLuB1e8qBsDvnHyRZzE3cXH';
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;
const METHODS = (process.env.NEXT_PUBLIC_MOYASAR_METHODS ?? 'creditcard')
  .split(',')
  .map((method) => method.trim())
  .filter(Boolean);

/**
 * ⚠️ TEMPORARY — live payment test. While set, Moyasar charges this amount
 * (halalas: 100 = 1 SAR) instead of the order's amount. Set back to `null`
 * after the test to charge the real order amount again.
 */
const TEST_CHARGE_HALALAS: number | null = 100;

/** Query param carrying the order number back from Moyasar's redirect. */
export const ORDER_PARAM = 'order';

declare global {
  interface Window {
    Moyasar?: { init: (config: Record<string, unknown>) => void };
  }
}

let mpfPromise: Promise<void> | null = null;

function loadMpf(): Promise<void> {
  if (window.Moyasar) return Promise.resolve();
  if (mpfPromise) return mpfPromise;

  if (!document.querySelector(`link[href="${MPF_CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MPF_CSS;
    document.head.appendChild(link);
  }

  mpfPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MPF_JS;
    script.async = true;
    script.onload = () => (window.Moyasar ? resolve() : reject(new Error('Moyasar missing')));
    script.onerror = () => {
      mpfPromise = null;
      script.remove();
      reject(new Error('Moyasar failed to load'));
    };
    document.body.appendChild(script);
  });
  return mpfPromise;
}

function callbackUrl(orderNumber: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set(ORDER_PARAM, orderNumber);
  return url.toString();
}

export function StepPayment({ variant }: { variant: 'sheet' | 'modal' }) {
  const { order, variant: device, activeColor } = usePurchaseFlow();
  const formClass = `mysr-form-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const isModal = variant === 'modal';

  useEffect(() => {
    if (!order || !PUBLISHABLE_KEY) return;
    let cancelled = false;
    const host = hostRef.current;
    setStatus('loading');

    loadMpf()
      .then(() => {
        if (cancelled || !window.Moyasar) return;
        const description = [PRODUCT_NAME_AR, activeColor?.label, device?.storage_label, order.order_number]
          .filter(Boolean)
          .join(' · ');

        window.Moyasar.init({
          element: `.${formClass}`,
          amount: TEST_CHARGE_HALALAS ?? order.amount,
          currency: order.currency || 'SAR',
          description,
          publishable_api_key: PUBLISHABLE_KEY,
          callback_url: callbackUrl(order.order_number),
          methods: METHODS,
          language: 'ar',
          supported_networks: ['mada', 'visa', 'mastercard'],
          // Lets the backend match a webhook to the order even if verify never runs.
          metadata: { order_number: order.order_number },
          ...(METHODS.includes('applepay')
            ? {
                apple_pay: {
                  country: 'SA',
                  label: 'عالم وافي',
                  validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
                },
              }
            : {}),
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      if (host) host.innerHTML = '';
    };
  }, [order, device, activeColor, formClass]);

  if (!order) return null;

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`flex w-full flex-col gap-2 rounded-2xl border px-4 py-3.5 ${
          isModal ? 'border-modal-tile-line bg-modal-tile' : 'border-line bg-card'
        }`}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-body">{FLOW.step3.orderLabel}</span>
          <bdi className="font-latin text-white">{order.order_number}</bdi>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-body">{FLOW.step3.totalLabel}</span>
          <span className="text-xl font-extrabold text-white">
            {formatHalalas(TEST_CHARGE_HALALAS ?? order.amount)} {RIYAL}
          </span>
        </div>
      </div>

      {!PUBLISHABLE_KEY ? (
        <p role="alert" className="rounded-2xl border border-[#E36B6B]/40 bg-[#E36B6B]/10 px-4 py-3 text-sm text-[#F5A3A3]">
          {FLOW.step3.missingKey}
        </p>
      ) : (
        <>
          {status === 'loading' ? (
            <p role="status" className="flex items-center justify-center gap-3 py-4 text-sm text-body">
              <Spinner className="text-pink" />
              {FLOW.step3.loading}
            </p>
          ) : null}
          {status === 'error' ? (
            <p role="alert" className="rounded-2xl border border-[#E36B6B]/40 bg-[#E36B6B]/10 px-4 py-3 text-sm text-[#F5A3A3]">
              {FLOW.step3.loadError}
            </p>
          ) : null}
          {/* Moyasar's form, re-skinned in the flow's colours by moyasar-theme.css (styling only). */}
          <div
            className={`mpf-theme rounded-2xl border p-4 text-white ${
              isModal ? 'border-modal-tile-line bg-modal-tile' : 'mpf-theme--sheet border-line bg-card'
            } ${status === 'ready' ? '' : 'hidden'}`}
            dir="rtl"
          >
            <div ref={hostRef} className={formClass} />
          </div>
        </>
      )}
    </div>
  );
}
