'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import {
  FINISHES,
  FLOW,
  FULFILLMENTS,
  PICKUP_DAYS_SHOWN,
  PICKUP_TIMES,
  RIYAL,
  SHIPPING_FEE,
  finishIdFor,
  isRiyadh,
} from '@/lib/content';
import { formatHalalas, upcomingPickupDays } from '@/lib/format';
import { usePurchaseFlow, type FieldKey } from '@/hooks/usePurchaseFlow';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { OptionTile } from './OptionTile';
import { Field } from './Field';
import { CountryCodeSelect } from './CountryCodeSelect';

type Variant = 'sheet' | 'modal';

/** Swatch colour for an API colour key; unknown colours get a neutral grey. */
function dotFor(colorKey: string): string {
  const id = finishIdFor(colorKey);
  return FINISHES.find((finish) => finish.id === id)?.dot ?? '#6B6B70';
}

/** A value that re-animates whenever it changes, for the summary rows. */
function AnimatedValue({ value, className }: { value: string; className?: string }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.span
      key={value}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.25, ease: EASE }}
      className={className}
    >
      <bdi>{value}</bdi>
    </motion.span>
  );
}

function LabelRow({ label, value, variant }: { label: string; value?: string; variant: Variant }) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className={variant === 'modal' ? 'text-base font-bold text-white' : 'text-sm font-bold text-white'}>
        {label}
      </p>
      {value ? (
        <AnimatedValue
          value={value}
          className={variant === 'modal' ? 'text-sm text-pink' : 'text-[13px] font-semibold text-body'}
        />
      ) : null}
    </div>
  );
}

function StatusBox({
  children,
  variant,
  tone = 'muted',
}: {
  children: React.ReactNode;
  variant: Variant;
  tone?: 'muted' | 'error';
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex w-full flex-col items-center gap-3 rounded-2xl border px-4 py-6 text-center text-sm ${
        variant === 'modal' ? 'border-modal-tile-line bg-modal-tile' : 'border-line-2 bg-card'
      } ${tone === 'error' ? 'text-[#F5A3A3]' : 'text-body'}`}
    >
      {children}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

/* ------------------------- step 1 · colour & storage ------------------------ */

export function StepColorStorage({ variant }: { variant: Variant }) {
  const {
    variantsStatus,
    reloadVariants,
    colors,
    activeColor,
    storages,
    activeStorage,
    variant: selected,
    setColor,
    setStorage,
    method,
    setField,
    storageOptions,
  } = usePurchaseFlow();
  const activeFulfillment = FULFILLMENTS.find((item) => item.id === method) ?? FULFILLMENTS[1];
  const isModal = variant === 'modal';

  if (variantsStatus === 'loading') {
    return (
      <StatusBox variant={variant}>
        <Spinner className="text-pink" />
        {FLOW.step1.loading}
      </StatusBox>
    );
  }

  if (variantsStatus === 'error' || colors.length === 0) {
    return (
      <StatusBox variant={variant} tone={variantsStatus === 'error' ? 'error' : 'muted'}>
        {variantsStatus === 'error' ? FLOW.step1.loadError : FLOW.step1.empty}
        <button
          type="button"
          onClick={reloadVariants}
          className="min-h-11 rounded-pill border border-white/20 px-5 text-sm font-bold text-white"
        >
          {FLOW.step1.retry}
        </button>
      </StatusBox>
    );
  }

  // Same price for every colour, so show it even before a colour has its variant.
  const shownPrice = selected?.price ?? storageOptions.find((o) => o.available && o.label === activeStorage)?.price;
  const price = shownPrice === undefined ? '—' : formatHalalas(shownPrice);



  return (
    <div className={`flex flex-col ${isModal ? 'gap-4 [@media(max-height:860px)]:gap-3' : 'gap-5'}`}>
      {/* Colour */}
      <div className="flex flex-col gap-2.5 md:gap-2">
        <LabelRow label={FLOW.step1.colorLabel} value={activeColor?.label} variant={variant} />
        <div
          role="radiogroup"
          aria-label={FLOW.step1.colorLabel}
          className="grid w-full grid-cols-4 gap-2 md:gap-3"
        >
          {colors.map((option) => {
            const isSelected = option.key === activeColor?.key;
            return (
              <OptionTile
                key={option.key}
                selected={isSelected}
                onSelect={() => setColor(option.key)}
                label={option.label}
                variant={variant}
                className="h-[74px] flex-col gap-1 px-1 md:h-[78px] [@media(min-width:768px)_and_(max-height:860px)]:h-[70px]"
              >
                <span
                  aria-hidden
                  className="size-[22px] shrink-0 rounded-full ring-1 ring-inset ring-white/25 md:size-7"
                  style={{ backgroundColor: option.dot ?? dotFor(option.key) }}
                />
                <span
                  className={`flex items-center gap-1 text-center text-[12px] font-bold leading-tight md:text-[13px] ${
                    isSelected ? 'text-white md:text-pink' : 'text-body md:font-medium md:text-modal-body'
                  }`}
                >
                  {option.label}
                </span>
              </OptionTile>
            );
          })}
        </div>
      </div>

      {/* Storage */}
      <div className="flex flex-col gap-2.5 md:gap-2">
        <LabelRow label={FLOW.step1.storageLabel} value={activeStorage ?? undefined} variant={variant} />
        <div
          role="radiogroup"
          aria-label={FLOW.step1.storageLabel}
          className={`grid w-full gap-2.5 md:gap-3 ${isModal ? 'grid-cols-4' : 'grid-cols-2'}`}
        >
          {storageOptions.map((option) => {
            const isSelected = option.available && option.label === activeStorage;
            const priceText = `${formatHalalas(option.price)} ${RIYAL}`;
            return (
              <OptionTile
                key={option.label}
                selected={isSelected}
                disabled={!option.available}
                onSelect={() => setStorage(option.label)}
                label={
                  option.available
                    ? `${option.label} · ${priceText}`
                    : `${option.label} · ${FLOW.step1.unavailable} · ${priceText}`
                }
                variant={variant}
                className="h-[58px] flex-col gap-0.5 px-1"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`font-latin text-[15px] md:text-base ${
                      isSelected ? 'text-white md:text-pink' : 'text-body md:text-white'
                    }`}
                  >
                    <bdi>{option.label}</bdi>
                  </span>
                </span>
                <span
                  className={`text-[10.5px] leading-tight md:text-[11px] ${
                    option.available ? (isSelected ? 'text-pink' : 'text-body') : 'text-muted'
                  }`}
                >
                  {option.available ? (
                    priceText
                  ) : (
                    <>
                      {FLOW.step1.unavailable} · {priceText}
                    </>
                  )}
                </span>
              </OptionTile>
            );
          })}
        </div>
        <p
          className={`w-full text-start text-muted ${
            isModal ? 'text-[11px] leading-[1.5]' : 'text-[12.5px]'
          }`}
        >
          {FLOW.step1.storageNote}
        </p>
      </div>

      {/* Fulfillment method — frame 494:153 */}
      <div className="flex flex-col gap-2.5 md:gap-2">
        <LabelRow label={FLOW.step1.fulfillmentLabel} value={activeFulfillment.label} variant={variant} />
        <div
          role="radiogroup"
          aria-label={FLOW.step1.fulfillmentLabel}
          className="flex w-full items-start gap-2.5 md:gap-3"
        >
          {FULFILLMENTS.map((item) => {
            const isSelected = item.id === method;
            return (
              <OptionTile
                key={item.id}
                selected={isSelected}
                onSelect={() => setField({ method: item.id })}
                mark="inline"
                label={item.label}
                variant={variant}
                className="h-[52px] flex-1 gap-2.5 px-2 md:h-[50px]"
              >
                <span
                  className={`text-[13px] md:text-[15px] ${
                    isSelected ? 'font-bold text-white md:text-pink' : 'font-medium text-body md:text-white'
                  }`}
                >
                  {item.label}
                </span>
              </OptionTile>
            );
          })}
        </div>
        <p
          className={`w-full text-start text-muted ${
            isModal ? 'text-[11px] leading-[1.5]' : 'text-[12.5px]'
          }`}
        >
          {FLOW.step1.fulfillmentNotes[method]}
        </p>
      </div>

      {/* Summary */}
      {isModal ? (
        <div className="flex w-full flex-col gap-4">
          <div aria-hidden className="h-px w-full bg-modal-tile-line" />
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-modal-body">{FLOW.step1.summaryLabel}</p>
            <div className="flex items-center gap-2.5">
              <AnimatedValue value={activeColor?.label ?? ''} className="text-[15px] font-semibold text-white" />
              <span aria-hidden className="size-[3px] rounded-full bg-modal-body" />
              <AnimatedValue value={activeStorage ?? ''} className="font-latin text-[15px] text-white" />
              <span aria-hidden className="size-[3px] rounded-full bg-modal-body" />
              <AnimatedValue value={`${price} ${RIYAL}`} className="text-[15px] font-bold text-pink" />
            </div>
          </div>
          <div className="-mt-2 flex w-full items-center justify-between text-[13px]">
            <p className="text-modal-body">{FLOW.step1.shippingLine}</p>
            <AnimatedValue
              value={method === 'shipping' ? `+ ${formatHalalas(SHIPPING_FEE)} ${RIYAL}` : FLOW.step1.shippingFree}
              className="text-white"
            />
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between rounded-2xl border border-line bg-card px-4 py-3.5">
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-1 text-[13px] text-body">
              <span>اختيارك: {activeColor?.label} ·</span>
              <AnimatedValue value={activeStorage ?? ''} className="font-latin" />
            </div>
            <AnimatedValue
              value={
                method === 'shipping'
                  ? `${FLOW.step1.shippingLine} + ${formatHalalas(SHIPPING_FEE)} ${RIYAL}`
                  : FLOW.step1.shippingFree
              }
              className="text-[11.5px] text-muted"
            />
          </div>
          <AnimatedValue value={`${price} ${RIYAL}`} className="text-xl font-extrabold text-white" />
        </div>
      )}
    </div>
  );
}

/* ------------------------------ step 2 · fields ----------------------------- */

type TextKey = 'email' | 'name' | 'phone' | 'city' | 'district' | 'nationalAddress';

const AUTOCOMPLETE: Record<TextKey, string> = {
  email: 'email',
  name: 'name',
  phone: 'tel-national',
  city: 'address-level2',
  district: 'address-level3',
  nationalAddress: 'street-address',
};

/** Wires one form field to the flow state, with its copy from FLOW.fields. */
function FlowField({ field, variant }: { field: TextKey; variant: Variant }) {
  const flow = usePurchaseFlow();
  const copy = FLOW.fields[field];
  const common = {
    label: copy.label,
    placeholder: copy.placeholder,
    value: flow[field],
    onChange: (value: string) => flow.setField({ [field]: value }),
    onBlur: () => flow.touchField(field as FieldKey),
    error: flow.fieldErrors[field] ?? null,
    autoComplete: AUTOCOMPLETE[field],
    variant,
  };

  if (field === 'phone') {
    // Number on the right, country code on the left (the addon follows the
    // input in the DOM, so RTL places it to the left).
    return (
      <Field
        {...common}
        type="tel"
        inputMode="tel"
        dir="ltr"
        addon={
          <CountryCodeSelect
            value={flow.phoneCountry}
            onChange={(phoneCountry) => flow.setField({ phoneCountry })}
            label={FLOW.dialCodeLabel}
            variant={variant}
          />
        }
      />
    );
  }
  if (field === 'email') {
    return <Field {...common} type="email" inputMode="email" dir="ltr" />;
  }
  return <Field {...common} />;
}

function OrderError({ error }: { error: string | null }) {
  return error ? (
    <p
      role="alert"
      className="rounded-2xl border border-[#E36B6B]/40 bg-[#E36B6B]/10 px-4 py-3 text-sm text-[#F5A3A3]"
    >
      {error}
    </p>
  ) : null;
}

/* --------------------------- step 2 · shipping form ------------------------ */

/**
 * Frame 494:176. Figma's «الدولة» row is replaced by المدينة · الحي, which the
 * order API requires (shipping is Saudi-only, +966).
 */
export function StepShipping({ variant }: { variant: Variant }) {
  const { error, city } = usePurchaseFlow();
  const isModal = variant === 'modal';

  return (
    <div className={`flex w-full flex-col ${isModal ? 'gap-3' : 'gap-3.5'}`}>
      <InfoNote variant={variant}>
        {isRiyadh(city) ? FLOW.shipping.riyadhNote : FLOW.shipping.deliveryNote}
      </InfoNote>
      <FlowField field="email" variant={variant} />
      <FlowField field="name" variant={variant} />
      <div className={`grid grid-cols-2 gap-3`}>
        <FlowField field="city" variant={variant} />
        <FlowField field="district" variant={variant} />
      </div>
      <FlowField field="phone" variant={variant} />
      <FlowField field="nationalAddress" variant={variant} />
      <OrderError error={error} />
    </div>
  );
}

/* --------------------------- step 2 · branch pickup ------------------------ */

const PinIcon = () => (
  <svg viewBox="0 0 14 16" width={12} height={14} aria-hidden>
    <path
      d="M7 15s5-4.6 5-8.5A5 5 0 0 0 2 6.5C2 10.4 7 15 7 15z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="7" cy="6.5" r="1.8" fill="currentColor" />
  </svg>
);

/** A one-line info strip above a step's fields. */
function InfoNote({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  return (
    <p
      className={`w-full rounded-xl border px-3.5 py-2.5 text-start text-xs leading-[1.6] text-body ${
        variant === 'modal' ? 'border-modal-tile-line bg-modal-tile' : 'border-line-2 bg-card'
      }`}
    >
      {children}
    </p>
  );
}

function SectionError({ show }: { show: boolean }) {
  return show ? <span className="text-xs font-semibold text-pink">مطلوب</span> : null;
}

export function StepPickup({ variant }: { variant: Variant }) {
  const {
    branchId,
    pickupDate,
    pickupTime,
    branches,
    branchesStatus,
    branchOptions,
    selectedBranch,
    fieldErrors,
    setField,
    error,
  } = usePurchaseFlow();
  const isModal = variant === 'modal';
  const days = useMemo(() => upcomingPickupDays(PICKUP_DAYS_SHOWN), []);

  return (
    <div className={`flex flex-col ${isModal ? 'gap-4' : 'gap-[18px]'}`}>
      {/* Branch */}
      <div className="flex flex-col gap-2.5">
        <div className="flex w-full items-center justify-between">
          <LabelRow label={FLOW.step2.branchLabel} variant={variant} />
          <SectionError show={Boolean(fieldErrors.branchId)} />
        </div>
        {branchesStatus === 'loading' ? (
          <StatusBox variant={variant}>
            <Spinner className="text-pink" />
            {FLOW.step2.branchesLoading}
          </StatusBox>
        ) : branchesStatus === 'error' ? (
          <StatusBox variant={variant} tone="error">
            {FLOW.step2.branchesError}
          </StatusBox>
        ) : branches.length === 0 ? (
          <StatusBox variant={variant}>{FLOW.step2.noBranches}</StatusBox>
        ) : (
          <div role="radiogroup" aria-label={FLOW.step2.branchLabel} className="flex flex-col gap-2.5">
            {branchOptions.map((branch) => {
              const isSelected = branch.key === branchId;
              const detail = branch.address;
              return (
                <OptionTile
                  key={branch.key}
                  selected={isSelected}
                  onSelect={() => setField({ branchId: branch.key })}
                  mark="inline"
                  label={branch.name}
                  variant={variant}
                  className={`w-full justify-start gap-3 px-4 ${isModal ? 'min-h-12 py-2' : 'min-h-14 py-2.5'}`}
                >
                  <span className="flex flex-col items-start gap-0.5 text-start">
                    <span
                      className={`text-[14px] font-bold md:text-[15px] ${
                        isSelected ? 'text-white md:text-pink' : 'text-white'
                      }`}
                    >
                      {branch.name}
                    </span>
                    {detail ? <span className="text-xs text-muted">{detail}</span> : null}
                  </span>
                </OptionTile>
              );
            })}
          </div>
        )}
        {selectedBranch?.mapUrl ? (
          <a
            href={selectedBranch.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-pink underline-offset-4 hover:underline"
          >
            <PinIcon />
            {FLOW.step2.mapLink}
          </a>
        ) : null}
      </div>

      {/* Day */}
      <div className="flex flex-col gap-2.5">
        <div className="flex w-full items-center justify-between">
          <p className={isModal ? 'text-base font-bold text-white' : 'text-sm font-bold text-white'}>
            {FLOW.step2.dayLabel}
          </p>
          {fieldErrors.pickupDate ? (
            <SectionError show />
          ) : (
            <p className={isModal ? 'text-sm text-pink' : 'text-xs text-body'}>{FLOW.step2.dayHint}</p>
          )}
        </div>
        <div
          role="radiogroup"
          aria-label={FLOW.step2.dayLabel}
          className={`grid w-full gap-2.5 ${isModal ? 'grid-cols-6 gap-2' : 'grid-cols-3'}`}
        >
          {days.map((day) => {
            const isSelected = day.iso === pickupDate;
            return (
              <OptionTile
                key={day.iso}
                selected={isSelected}
                onSelect={() => setField({ pickupDate: day.iso })}
                label={`${day.weekday} ${day.date}`}
                variant={variant}
                className="h-14 flex-col gap-0.5 px-1"
              >
                <span
                  className={`text-[13px] font-bold md:text-[14px] ${
                    isSelected ? 'text-white md:text-pink' : 'text-body md:text-white'
                  }`}
                >
                  {day.weekday}
                </span>
                <span className={`text-[11px] md:text-xs ${isSelected ? 'text-pink' : 'text-muted'}`}>
                  {day.date}
                </span>
              </OptionTile>
            );
          })}
        </div>
      </div>

      {/* Time — the API's pickup_time */}
      <div className="flex flex-col gap-2.5">
        <div className="flex w-full items-center justify-between">
          <p className={isModal ? 'text-base font-bold text-white' : 'text-sm font-bold text-white'}>
            {FLOW.step2.timeLabel}
          </p>
          {fieldErrors.pickupTime ? (
            <SectionError show />
          ) : (
            <p className={isModal ? 'text-sm text-pink' : 'text-xs text-body'}>{FLOW.step2.timeHint}</p>
          )}
        </div>
        <div role="radiogroup" aria-label={FLOW.step2.timeLabel} className="grid w-full grid-cols-2 gap-2.5">
          {PICKUP_TIMES.map((slot) => {
            const isSelected = slot.id === pickupTime;
            return (
              <OptionTile
                key={slot.id}
                selected={isSelected}
                onSelect={() => setField({ pickupTime: slot.id })}
                mark="inline"
                label={slot.range}
                variant={variant}
                className="h-12 gap-2 px-2"
              >
                <span
                  className={`text-[13px] font-bold md:text-[14px] ${
                    isSelected ? 'text-white md:text-pink' : 'text-body md:text-white'
                  }`}
                >
                  {slot.range}
                </span>
              </OptionTile>
            );
          })}
        </div>
      </div>

      {/* Contact */}
      <div className={`flex flex-col ${isModal ? 'gap-3' : 'gap-3.5'}`}>
        <LabelRow label={FLOW.step2.contactLabel} variant={variant} />
        {/* The modal sets e-mail and name side by side so the step fits without scrolling. */}
        <div className={isModal ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3.5'}>
          <FlowField field="email" variant={variant} />
          <FlowField field="name" variant={variant} />
        </div>
        <FlowField field="phone" variant={variant} />
      </div>

      <OrderError error={error} />
    </div>
  );
}
