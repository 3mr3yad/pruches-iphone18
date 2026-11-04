'use client';

import { motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import {
  DAYS,
  FINISHES,
  FLOW,
  PRICE_WAFI,
  RIYAL,
  STORAGES,
  TIMES,
  type ColorId,
} from '@/lib/content';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { Check, OptionTile } from './OptionTile';

/** The modal orders the colours عنابي · أزرق جليدي · أسود; the sheet عنابي · أسود · أزرق جليدي. */
const MODAL_ORDER: Record<ColorId, string> = {
  burgundy: 'md:order-1',
  black: 'md:order-3',
  glacier: 'md:order-2',
};

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

function LabelRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: 'sheet' | 'modal';
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className={variant === 'modal' ? 'text-lg font-bold text-white' : 'text-sm font-bold text-white'}>
        {label}
      </p>
      <AnimatedValue
        value={value}
        className={variant === 'modal' ? 'text-sm text-pink' : 'text-[13px] font-semibold text-body'}
      />
    </div>
  );
}

/* ------------------------- step 1 · colour & storage ------------------------ */

export function StepColorStorage({ variant }: { variant: 'sheet' | 'modal' }) {
  const { color, storage, setColor, setStorage } = usePurchaseFlow();
  const activeColor = FINISHES.find((finish) => finish.id === color) ?? FINISHES[0];
  const activeStorage = STORAGES.find((item) => item.id === storage) ?? STORAGES[1];
  const isModal = variant === 'modal';

  return (
    <div className={`flex flex-col ${isModal ? 'gap-6' : 'gap-5'}`}>
      {/* Colour */}
      <div className="flex flex-col gap-2.5 md:gap-3">
        <LabelRow label={FLOW.step1.colorLabel} value={activeColor.name} variant={variant} />
        <div
          role="radiogroup"
          aria-label={FLOW.step1.colorLabel}
          className="flex w-full items-start gap-2.5 md:gap-3"
        >
          {FINISHES.map((finish) => {
            const selected = finish.id === color;
            return (
              <OptionTile
                key={finish.id}
                selected={selected}
                onSelect={() => setColor(finish.id)}
                label={finish.name}
                variant={variant}
                className={`h-16 flex-1 flex-col gap-1.5 md:h-[92px] md:gap-[9px] ${MODAL_ORDER[finish.id]}`}
              >
                <span
                  aria-hidden
                  className="size-[22px] rounded-full ring-1 ring-inset ring-white/25 md:size-8"
                  style={{ backgroundColor: finish.dot }}
                />
                <span
                  className={`flex items-center gap-1.5 text-[12.5px] font-bold md:text-sm ${
                    selected ? 'text-white md:text-pink' : 'text-body md:font-medium md:text-modal-body'
                  }`}
                >
                  {finish.name}
                  {selected && isModal ? <Check /> : null}
                </span>
              </OptionTile>
            );
          })}
        </div>
      </div>

      {/* Storage */}
      <div className="flex flex-col gap-2.5 md:gap-3">
        <LabelRow label={FLOW.step1.storageLabel} value={activeStorage.label} variant={variant} />
        <div
          role="radiogroup"
          aria-label={FLOW.step1.storageLabel}
          className="flex w-full items-start gap-2.5 md:gap-3"
        >
          {STORAGES.map((item) => {
            const selected = item.id === storage;
            return (
              <OptionTile
                key={item.id}
                selected={selected}
                onSelect={() => setStorage(item.id)}
                label={item.label}
                variant={variant}
                className="h-[52px] flex-1 gap-2.5 md:h-[62px]"
              >
                <span
                  className={`font-latin text-[15px] md:text-[17px] ${
                    selected ? 'text-white md:text-pink' : 'text-body md:text-white'
                  }`}
                >
                  <bdi>{item.label}</bdi>
                </span>
                {selected && isModal ? <Check className="text-pink" /> : null}
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

      {/* Summary */}
      {isModal ? (
        <div className="flex w-full flex-col gap-4">
          <div aria-hidden className="h-px w-full bg-modal-tile-line" />
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-modal-body">{FLOW.step1.summaryLabel}</p>
            <div className="flex items-center gap-2.5">
              <AnimatedValue value={activeColor.name} className="text-[15px] font-semibold text-white" />
              <span aria-hidden className="size-[3px] rounded-full bg-modal-body" />
              <AnimatedValue
                value={activeStorage.label}
                className="font-latin text-[15px] text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between rounded-2xl border border-line bg-card px-4 py-3.5">
          <div className="flex items-center gap-1 text-[13px] text-body">
            <span>اختيارك: {activeColor.name} ·</span>
            <AnimatedValue value={activeStorage.label} className="font-latin" />
          </div>
          <p className="text-xl font-extrabold text-white">
            {PRICE_WAFI} {RIYAL}
          </p>
        </div>
      )}
    </div>
  );
}

/* --------------------------- step 2 · appointment -------------------------- */

export function StepAppointment({ variant }: { variant: 'sheet' | 'modal' }) {
  const { day, time, setDay, setTime, color, storage } = usePurchaseFlow();
  const isModal = variant === 'modal';
  const activeColor = FINISHES.find((finish) => finish.id === color) ?? FINISHES[0];
  const activeStorage = STORAGES.find((item) => item.id === storage) ?? STORAGES[1];
  const activeDay = DAYS.find((item) => item.id === day);
  const activeTime = TIMES.find((item) => item.id === time);
  const summary =
    activeDay && activeTime ? `${activeDay.label} · ${activeTime.label} ${activeTime.period}` : '—';

  return (
    <div className={isModal ? 'flex flex-col gap-5' : 'flex flex-col'}>
      {/* Day */}
      <div className={isModal ? 'flex flex-col gap-2.5' : 'flex flex-col gap-2.5 pt-[18px]'}>
        <div className="flex w-full items-center justify-between">
          <p className={isModal ? 'text-lg font-bold text-white' : 'text-sm font-bold text-white'}>
            {FLOW.step2.dayLabel}
          </p>
          <p className={isModal ? 'text-sm text-pink' : 'text-xs text-body'}>
            {isModal ? (activeDay?.label ?? FLOW.step2.dayHint) : FLOW.step2.dayHint}
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label={FLOW.step2.dayLabel}
          className="grid w-full grid-cols-3 gap-2.5 md:gap-3"
        >
          {DAYS.map((item) => {
            const selected = item.id === day;
            return (
              <OptionTile
                key={item.id}
                selected={selected}
                onSelect={() => setDay(item.id)}
                label={item.label}
                variant={variant}
                className="h-11 gap-2 px-1 md:h-[54px]"
              >
                {selected && isModal ? <Check className="text-pink" /> : null}
                <span
                  className={`text-[13px] font-bold md:text-[15px] ${
                    selected ? 'text-white md:text-pink' : 'text-body md:font-medium md:text-modal-body'
                  }`}
                >
                  {item.label}
                </span>
              </OptionTile>
            );
          })}
        </div>
      </div>

      {/* Time */}
      <div className={isModal ? 'flex flex-col gap-2.5' : 'flex flex-col gap-2.5 pt-[18px]'}>
        <div className="flex w-full items-center justify-between">
          <p className={isModal ? 'text-lg font-bold text-white' : 'text-sm font-bold text-white'}>
            {FLOW.step2.timeLabel}
          </p>
          <p className={isModal ? 'text-sm text-pink' : 'text-xs text-body'}>
            {isModal ? FLOW.step2.timeHintDesktop : FLOW.step2.timeHint}
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label={FLOW.step2.timeLabel}
          className="flex w-full items-start gap-2 md:gap-3"
        >
          {TIMES.map((item) => {
            const selected = item.id === time;
            return (
              <OptionTile
                key={item.id}
                selected={selected}
                onSelect={() => setTime(item.id)}
                label={`${item.label} ${item.period}`}
                variant={variant}
                className="h-11 flex-1 flex-col px-1 md:h-16"
              >
                <span className="flex items-center gap-[7px]">
                  {selected && isModal ? <Check className="text-pink" /> : null}
                  <span
                    className={`text-[13px] font-bold leading-[1.4] md:text-lg ${
                      selected ? 'text-white md:text-pink' : 'text-body md:text-white'
                    }`}
                  >
                    {isModal ? item.label : item.short}
                  </span>
                </span>
                {isModal ? (
                  <span className={`text-xs leading-[1.5] ${selected ? 'text-pink' : 'text-modal-body'}`}>
                    {item.period}
                  </span>
                ) : null}
              </OptionTile>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {isModal ? (
        <div className="flex w-full flex-col gap-4">
          <div aria-hidden className="h-px w-full bg-modal-tile-line" />
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-modal-body">{FLOW.step2.summaryLabelDesktop}</p>
            <AnimatedValue value={summary} className="text-[15px] font-semibold text-white" />
          </div>
        </div>
      ) : (
        <div className="mt-[18px] flex w-full items-center justify-between rounded-2xl border border-line bg-card px-3.5 py-2.5">
          <div className="flex flex-col items-start gap-px">
            <p className="text-xs font-bold text-pink">{FLOW.step2.summaryLabel}</p>
            <p className="flex items-center gap-1 text-[11px] text-body">
              <span>{activeColor.name} ·</span>
              <bdi className="font-latin text-[10px]">{activeStorage.label}</bdi>
            </p>
          </div>
          <AnimatedValue value={summary} className="text-sm font-bold text-white" />
        </div>
      )}
    </div>
  );
}
