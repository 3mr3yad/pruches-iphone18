'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { backdrop, modalPanel } from '@/lib/motion';
import { FLOW, RIYAL } from '@/lib/content';
import { formatHalalas } from '@/lib/format';
import { getOrder, verifyPayment, type OrderDetails } from '@/lib/api';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { useFocusTrap, useScrollLock } from '@/hooks/useDialog';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { Button } from '../ui/Button';
import { Spinner } from './Steps';
import { ORDER_PARAM } from './Payment';

type Phase = 'verifying' | 'paid' | 'pending' | 'failed' | 'cancelled';

type Return = {
  orderNumber: string;
  paymentId: string | null;
  /** Moyasar's own verdict from the redirect: paid / failed / initiated … */
  moyasarStatus: string | null;
  message: string | null;
};

const POLL_ATTEMPTS = 4;
const POLL_DELAY_MS = 2500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Reads Moyasar's redirect (`?order=…&id=…&status=…&message=…`) once, then cleans the URL. */
function readReturn(): Return | null {
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get(ORDER_PARAM);
  if (!orderNumber) return null;

  const url = new URL(window.location.href);
  ['id', 'status', 'message', ORDER_PARAM].forEach((key) => url.searchParams.delete(key));
  window.history.replaceState(null, '', url.toString());

  return {
    orderNumber,
    paymentId: params.get('id'),
    moyasarStatus: params.get('status'),
    message: params.get('message'),
  };
}

/** Shown after Moyasar redirects back: verifies the payment and reports the order status. */
export function PaymentResult() {
  const { openFlow } = usePurchaseFlow();
  const { reduced } = useMotionPrefs();
  const titleId = `${useId().replace(/:/g, '')}-result-title`;

  const [ret, setRet] = useState<Return | null>(null);
  const [phase, setPhase] = useState<Phase>('verifying');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const runRef = useRef(0);

  const open = ret !== null;
  const close = useCallback(() => setRet(null), []);
  useScrollLock(open);
  const panelRef = useFocusTrap<HTMLDivElement>(open, close);

  const check = useCallback(async (target: Return, verify: boolean) => {
    const run = ++runRef.current;
    setPhase('verifying');

    if (verify && target.paymentId) {
      try {
        await verifyPayment(target.paymentId, target.orderNumber);
      } catch {
        // The webhook may still mark the order paid; the status check below decides.
      }
    }

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      if (run !== runRef.current) return;
      try {
        const details = await getOrder(target.orderNumber);
        if (run !== runRef.current) return;
        setOrder(details);
        if (details.status === 'paid') return setPhase('paid');
        if (details.status === 'cancelled') return setPhase('cancelled');
      } catch {
        // Try again below.
      }
      // Moyasar already told us it failed: no point waiting for a webhook.
      if (target.moyasarStatus === 'failed') return setPhase('failed');
      if (attempt < POLL_ATTEMPTS - 1) await wait(POLL_DELAY_MS);
    }
    if (run === runRef.current) setPhase('pending');
  }, []);

  useEffect(() => {
    const found = readReturn();
    if (!found) return;
    setRet(found);
    void check(found, true);
  }, [check]);

  const retry = useCallback(() => {
    close();
    openFlow(null);
  }, [close, openFlow]);

  const content: Record<Phase, { title: string; sub: string }> = {
    verifying: { title: FLOW.result.verifying, sub: '' },
    paid: { title: FLOW.result.paidTitle, sub: FLOW.result.paidSub },
    pending: { title: FLOW.result.pendingTitle, sub: FLOW.result.pendingSub },
    failed: { title: FLOW.result.failedTitle, sub: FLOW.result.failedSub },
    cancelled: { title: FLOW.result.cancelledTitle, sub: FLOW.result.failedSub },
  };
  const { title, sub } = content[phase];

  return (
    <AnimatePresence>
      {open && ret ? (
        <div className="fixed inset-0 z-[60]" role="presentation">
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={phase === 'verifying' ? undefined : close}
            className="absolute inset-0 bg-[rgba(5,4,5,0.85)]"
          />
          <div className="absolute inset-0 grid place-items-center p-gutter">
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-busy={phase === 'verifying'}
              tabIndex={-1}
              variants={reduced ? backdrop : modalPanel}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full max-w-[460px] flex-col items-center gap-5 rounded-sheet border border-modal-line bg-modal-bg px-6 py-8 text-center shadow-modal md:px-10"
            >
              <StatusIcon phase={phase} />
              <div className="flex flex-col gap-2" aria-live="polite">
                <h2 id={titleId} className="text-2xl font-extrabold text-white md:text-[28px]">
                  {title}
                </h2>
                {sub ? <p className="text-[15px] leading-[1.8] text-modal-body">{sub}</p> : null}
                {/* Moyasar's own reason (English), as a detail under the Arabic copy. */}
                {phase === 'failed' && ret.message ? (
                  <p className="text-xs text-muted" dir="auto">
                    {ret.message}
                  </p>
                ) : null}
              </div>

              <div className="flex w-full flex-col gap-2 rounded-2xl border border-modal-tile-line bg-modal-tile px-4 py-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-body">{FLOW.result.orderLabel}</span>
                  <bdi className="font-latin text-white">{ret.orderNumber}</bdi>
                </div>
                {order?.amount ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-body">{FLOW.step3.totalLabel}</span>
                    <span className="font-bold text-white">
                      {formatHalalas(order.amount)} {RIYAL}
                    </span>
                  </div>
                ) : null}
              </div>

              {phase === 'paid' || phase === 'cancelled' ? (
                <Button className="w-full" showArrow={false} onClick={close}>
                  {FLOW.result.done}
                </Button>
              ) : phase === 'failed' ? (
                <Button className="w-full" onClick={retry}>
                  {FLOW.result.tryAgain}
                </Button>
              ) : phase === 'pending' ? (
                <div className="flex w-full flex-col gap-2.5">
                  <Button className="w-full" showArrow={false} onClick={() => void check(ret, true)}>
                    {FLOW.result.checkAgain}
                  </Button>
                  <button
                    type="button"
                    onClick={close}
                    className="min-h-11 text-sm text-modal-body transition-colors hover:text-white"
                  >
                    {FLOW.close}
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function StatusIcon({ phase }: { phase: Phase }) {
  if (phase === 'verifying') {
    return (
      <span className="grid size-16 place-items-center rounded-full bg-pink/10 text-pink">
        <Spinner className="size-7" />
      </span>
    );
  }
  const ok = phase === 'paid';
  const pending = phase === 'pending';
  return (
    <span
      aria-hidden
      className={`grid size-16 place-items-center rounded-full ${
        ok ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : pending ? 'bg-pink/10 text-pink' : 'bg-[#E36B6B]/15 text-[#F5A3A3]'
      }`}
    >
      <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {ok ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        ) : pending ? (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
          </>
        ) : (
          <path d="M7 7l10 10M17 7L7 17" />
        )}
      </svg>
    </span>
  );
}
