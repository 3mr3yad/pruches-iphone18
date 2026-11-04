'use client';

import { useCallback, useId } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react';
import { EASE, SHEET_SPRING, backdrop, modalPanel, stepSlide } from '@/lib/motion';
import { FINISHES, FLOW, PRODUCT_NAME_LATIN, finishIdFor } from '@/lib/content';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { useFocusTrap, useScrollLock } from '@/hooks/useDialog';
import { useIsDesktopDialog } from '@/hooks/useViewport';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { Button } from '../ui/Button';
import { Spinner, StepColorStorage, StepPickup, StepShipping } from './Steps';
import { StepPayment } from './Payment';

const CloseIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 18 18" width={size} height={size} aria-hidden>
    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const BackArrow = () => (
  <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden>
    <path
      d="M2 8h12M9.5 2.5L15 8l-5.5 5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function PurchaseDialog() {
  const flow = usePurchaseFlow();
  const {
    open,
    step,
    dir,
    closeFlow,
    next,
    back,
    canContinue,
    activeColor,
    activeStorage,
    submitting,
    method,
  } = flow;
  const dragControls = useDragControls();

  /** «الشحن» routes step 2 to the shipping form (494:212); pickup keeps branch & day. */
  const isShipping = step === 2 && method === 'shipping';
  const isDesktop = useIsDesktopDialog();
  const { reduced } = useMotionPrefs();
  const uid = useId().replace(/:/g, '');

  useScrollLock(open);
  const panelRef = useFocusTrap<HTMLDivElement>(open, closeFlow);

  const finishId = activeColor ? finishIdFor(activeColor.key) : null;
  const activeFinish = FINISHES.find((finish) => finish.id === finishId) ?? FINISHES[0];
  const colorName = activeColor?.label ?? activeFinish.name;
  const titleId = `${uid}-flow-title`;

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      // Drag down past 120px, or flick hard, to dismiss.
      if (info.offset.y > 120 || info.velocity.y > 700) closeFlow();
    },
    [closeFlow],
  );

  const stepContent =
    step === 1 ? FLOW.step1 : step === 3 ? FLOW.step3 : isShipping ? FLOW.shipping : FLOW.step2;
  const sheetSub = 'subShort' in stepContent ? stepContent.subShort : stepContent.sub;
  const variants = stepSlide(dir);

  const stepBody = (variant: 'sheet' | 'modal') => (
    <AnimatePresence mode="wait" initial={false} custom={dir}>
      <motion.div
        key={step}
        initial={reduced ? { opacity: 0 } : variants.hidden}
        animate={reduced ? { opacity: 1, x: 0 } : variants.show}
        exit={reduced ? { opacity: 0 } : variants.exit}
        className="w-full"
      >
        {step === 1 ? (
          <StepColorStorage variant={variant} />
        ) : step === 2 ? (
          isShipping ? (
            <StepShipping variant={variant} />
          ) : (
            <StepPickup variant={variant} />
          )
        ) : (
          <StepPayment variant={variant} />
        )}
      </motion.div>
    </AnimatePresence>
  );

  // Step 3 hands over to Moyasar's own pay button.
  const continueButton =
    step === 3 ? null : (
      <Button
        size="md"
        className="w-full"
        disabled={!canContinue}
        showArrow={!submitting}
        onClick={next}
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2.5">
            <Spinner />
            {FLOW.submitting}
          </span>
        ) : step === 2 ? (
          isShipping ? FLOW.shipping.save : FLOW.step2.proceed
        ) : (
          FLOW.continue
        )}
      </Button>
    );

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <motion.div
            key="backdrop"
            variants={backdrop}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={closeFlow}
            className="absolute inset-0 bg-[rgba(0,0,0,0.62)] md:bg-[rgba(5,4,5,0.79)]"
          />

          {isDesktop ? (
            /* ------------------------------ modal ------------------------------ */
            <div className="absolute inset-0 grid place-items-center p-6 [@media(max-height:860px)]:p-3">
              <motion.div
                key="modal"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                variants={reduced ? backdrop : modalPanel}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex max-h-[94vh] w-full max-w-[1120px] overflow-hidden rounded-sheet border border-modal-line bg-modal-bg shadow-modal"
              >
                {/* RTL: configuration leads so it sits on the right, portrait on the left. */}
                <div className="flex flex-1 flex-col no-scrollbar items-start gap-4 overflow-y-auto overscroll-contain ps-8 pe-10 pb-6 pt-6 [@media(max-height:860px)]:gap-3 [@media(max-height:860px)]:pb-4 [@media(max-height:860px)]:pt-4">
                  <div className="flex w-full flex-col gap-0.5 text-start">
                    <div className="flex w-full items-center justify-between">
                      <p className="font-latin text-base text-pink">{PRODUCT_NAME_LATIN}</p>
                      {step > 1 ? (
                        <button
                          type="button"
                          onClick={back}
                          className="inline-flex min-h-9 items-center gap-1.5 text-[13px] text-modal-body transition-colors duration-200 ease-quint hover:text-white"
                        >
                          <BackArrow />
                          {FLOW.step2.back}
                        </button>
                      ) : null}
                    </div>
                    <h2
                      id={titleId}
                      className="text-[28px] font-extrabold leading-[1.4] text-white [@media(max-height:860px)]:text-2xl"
                    >
                      {stepContent.title}
                    </h2>
                    <p className="text-sm leading-[1.7] text-modal-body">{stepContent.sub}</p>
                  </div>

                  {stepBody('modal')}

                  <div className="mt-1 flex w-full flex-col gap-2.5">
                    {continueButton}
                    <p className="w-full text-center text-xs leading-[1.6] text-muted">
                      {FLOW.note}
                    </p>
                  </div>
                </div>

                <div className="relative hidden w-[420px] shrink-0 overflow-hidden bg-modal-rail lg:block">
                  {/* Figma 463:261 — 696x624 at left -138 / top 48 inside the 420x760 rail. */}
                  <Image
                    src="/images/hero.webp"
                    alt={`آيفون 18 برو ماكس باللون ${colorName}`}
                    width={1440}
                    height={960}
                    sizes="420px"
                    className="absolute left-[-32.86%] top-[6.32%] h-[82.1%] w-[165.71%] max-w-none object-cover"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-y-0 start-0 w-[70px] bg-gradient-to-r from-transparent to-modal-bg"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[190px] bg-gradient-to-b from-transparent to-modal-rail"
                  />
                  <button
                    type="button"
                    onClick={closeFlow}
                    aria-label={FLOW.close}
                    className="absolute left-6 top-6 inline-flex size-10 items-center justify-center rounded-pill border border-white/[0.19] bg-[rgba(17,13,17,0.7)] text-white transition-colors duration-200 ease-quint hover:bg-[rgba(17,13,17,0.95)]"
                  >
                    <CloseIcon />
                  </button>
                  <div className="absolute inset-x-8 bottom-[70px] flex flex-col items-center gap-2 text-center">
                    <p className="text-[23px] font-bold text-white">{colorName}.</p>
                    <p className="text-[13px] text-modal-body">{FLOW.previewCaption}</p>
                    {step > 1 && activeStorage ? (
                      <p className="font-latin text-[13px] text-modal-body">
                        <bdi>{activeStorage}</bdi>
                      </p>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            /* ------------------------------- sheet ------------------------------ */
            <motion.div
              key="sheet"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              initial={reduced ? { opacity: 0 } : { y: '100%' }}
              animate={reduced ? { opacity: 1 } : { y: '0%' }}
              exit={reduced ? { opacity: 0 } : { y: '100%' }}
              transition={reduced ? { duration: 0.15 } : SHEET_SPRING}
              drag={reduced ? false : 'y'}
              dragControls={dragControls}
              /* A drag panel calls preventDefault on pointerdown, which stops
                 inputs from taking focus on touch. Once a step has inputs,
                 the drag starts from the handle only. */
              dragListener={step === 1}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={onDragEnd}
              className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-sheet border-t border-sheet-line bg-sheet px-gutter pb-[30px] pt-2.5"
            >
              <div
                onPointerDown={(event) => {
                  if (!reduced) dragControls.start(event);
                }}
                className="flex touch-none items-start justify-center pb-4"
              >
                <span aria-hidden className="h-[5px] w-10 rounded-[9px] bg-[#3a3338]" />
              </div>

              {/* RTL: thumbnail first (right), close last (left). */}
              <div className="flex w-full items-center gap-3.5">
                <div className="relative h-[78px] w-16 shrink-0 overflow-hidden rounded-[14px] bg-[#1a1016]">
                  {/* Figma 463:992 — 87x78 at left -11.5 inside the 64x78 thumb. */}
                  <Image
                    src="/images/hero.webp"
                    alt=""
                    width={1440}
                    height={960}
                    aria-hidden
                    sizes="88px"
                    className="absolute left-[-17.97%] top-0 h-full w-[135.94%] max-w-none object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 text-start">
                  {step > 1 ? (
                    <p className="text-[11px] font-bold text-pink">{stepContent.kicker}</p>
                  ) : null}
                  <h2 id={titleId} className="text-xl font-extrabold text-white">
                    {stepContent.title}
                  </h2>
                  <p className="text-[13px] text-body">
                    {sheetSub}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={closeFlow}
                    aria-label={FLOW.close}
                    className="inline-flex size-10 items-center justify-center rounded-pill bg-white/[0.06] text-white"
                  >
                    <CloseIcon size={16} />
                  </button>
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={back}
                      aria-label={FLOW.step2.back}
                      className="inline-flex size-10 items-center justify-center rounded-pill bg-white/[0.06] text-body"
                    >
                      <BackArrow />
                    </button>
                  ) : null}
                </div>
              </div>

              <motion.div
                layout={!reduced}
                transition={reduced ? { duration: 0.15 } : { duration: 0.3, ease: EASE }}
                className="mt-[22px]"
              >
                {stepBody('sheet')}
              </motion.div>

              <div className="mt-3.5 flex flex-col gap-2.5">
                {continueButton}
                <p className="w-full text-center text-[12.5px] text-muted">{FLOW.note}</p>
              </div>
            </motion.div>
          )}
        </div>
      ) : null}
    </AnimatePresence>
  );
}
