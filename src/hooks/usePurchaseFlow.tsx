'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { BASE_PRICE } from '@/lib/format';
import type { ColorId, DayId, StorageId, TimeId } from '@/lib/content';

export type Order = {
  color: ColorId;
  storage: StorageId;
  day: DayId;
  time: TimeId;
  price: number;
};

type State = {
  open: boolean;
  step: 1 | 2;
  /** 1 = moved forward, -1 = went back. Drives the slide direction. */
  dir: 1 | -1;
  color: ColorId;
  storage: StorageId;
  day: DayId | null;
  time: TimeId | null;
};

type Action =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'color'; value: ColorId }
  | { type: 'storage'; value: StorageId }
  | { type: 'day'; value: DayId }
  | { type: 'time'; value: TimeId };

/** Figma default selection: عنابي · 512 GB · السبت · ٧:٠٠ مساءً. */
const initialState: State = {
  open: false,
  step: 1,
  dir: 1,
  color: 'burgundy',
  storage: '512',
  day: 'sat',
  time: '19',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open':
      return { ...state, open: true, step: 1, dir: 1 };
    case 'close':
      return { ...state, open: false };
    case 'next':
      return state.step === 1 ? { ...state, step: 2, dir: 1 } : state;
    case 'back':
      return state.step === 2 ? { ...state, step: 1, dir: -1 } : state;
    case 'color':
      return { ...state, color: action.value };
    case 'storage':
      return { ...state, storage: action.value };
    case 'day':
      return { ...state, day: action.value };
    case 'time':
      return { ...state, time: action.value };
    default:
      return state;
  }
}

type FlowApi = State & {
  price: number;
  canContinue: boolean;
  /** Opens the flow and remembers the trigger so focus can be restored. */
  openFlow: (trigger?: HTMLElement | null) => void;
  closeFlow: () => void;
  next: () => void;
  back: () => void;
  setColor: (value: ColorId) => void;
  setStorage: (value: StorageId) => void;
  setDay: (value: DayId) => void;
  setTime: (value: TimeId) => void;
};

const FlowContext = createContext<FlowApi | null>(null);

export function PurchaseFlowProvider({
  children,
  onContinue,
}: {
  children: ReactNode;
  onContinue?: (order: Order) => void;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openFlow = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    dispatch({ type: 'open' });
  }, []);

  const closeFlow = useCallback(() => {
    dispatch({ type: 'close' });
    // Hand focus back to whatever opened the flow.
    const trigger = triggerRef.current;
    if (trigger && document.contains(trigger)) {
      requestAnimationFrame(() => trigger.focus());
    }
  }, []);

  const canContinue = state.step === 1 ? true : Boolean(state.day && state.time);

  const next = useCallback(() => {
    dispatch({ type: 'next' });
  }, []);

  const api = useMemo<FlowApi>(() => {
    const price = BASE_PRICE;
    return {
      ...state,
      price,
      canContinue,
      openFlow,
      closeFlow,
      next: () => {
        if (state.step === 1) {
          next();
          return;
        }
        if (state.day && state.time) {
          const order: Order = {
            color: state.color,
            storage: state.storage,
            day: state.day,
            time: state.time,
            price,
          };
          // TODO: hand the order to checkout. Checkout itself is out of scope.
          onContinue?.(order);
          // eslint-disable-next-line no-console
          console.log('[wafi] onContinue', order);
        }
      },
      back: () => dispatch({ type: 'back' }),
      setColor: (value) => dispatch({ type: 'color', value }),
      setStorage: (value) => dispatch({ type: 'storage', value }),
      setDay: (value) => dispatch({ type: 'day', value }),
      setTime: (value) => dispatch({ type: 'time', value }),
    };
  }, [state, canContinue, openFlow, closeFlow, next, onContinue]);

  return <FlowContext.Provider value={api}>{children}</FlowContext.Provider>;
}

export function usePurchaseFlow(): FlowApi {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('usePurchaseFlow must be used inside <PurchaseFlowProvider>');
  return ctx;
}
