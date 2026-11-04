'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ApiError,
  createOrder,
  getBranches,
  getVariants,
  type Branch,
  type CreateOrderBody,
  type CreatedOrder,
  type FulfillmentMethod,
  type Variant,
} from '@/lib/api';
import { FINISHES, FLOW, STORAGE_TIERS, finishIdFor, type PickupTimeId } from '@/lib/content';
import { normalizePhone } from '@/lib/format';
import type { CountryCode } from 'libphonenumber-js/min';

export type Step = 1 | 2 | 3;
export type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * A colour tile. `key` is the API colour key when the API sells the colour,
 * otherwise the finish id; `orderable` is false until the API has a variant.
 */
export type ColorOption = { key: string; label: string; dot: string | null; orderable: boolean };

/** A storage tile: sellable tiers carry the API price, the rest Apple's official price. */
export type StorageOption = { label: string; price: number; available: boolean };

type Form = {
  method: FulfillmentMethod;
  email: string;
  branchId: number | null;
  pickupDate: string | null;
  pickupTime: PickupTimeId | null;
  city: string;
  district: string;
  nationalAddress: string;
  name: string;
  phone: string;
  /** ISO country of the dial code picked beside the phone input. */
  phoneCountry: CountryCode;
};

type State = Form & {
  open: boolean;
  step: Step;
  /** 1 = moved forward, -1 = went back. Drives the slide direction. */
  dir: 1 | -1;
  /** An API colour key, or a finish id picked in the Finishes section before variants load. */
  color: string;
  storage: string | null;
  showErrors: boolean;
  /** Fields the user has left at least once — gates the inline hints. */
  touched: Partial<Record<FieldKey, boolean>>;
  submitting: boolean;
  error: string | null;
  order: CreatedOrder | null;
  /** The request body `order` was created from, so an unchanged order is reused. */
  orderKey: string | null;
};

type Action =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'goto'; step: Step }
  | { type: 'color'; value: string }
  | { type: 'storage'; value: string }
  | { type: 'field'; patch: Partial<Form> }
  | { type: 'showErrors' }
  | { type: 'touch'; field: FieldKey }
  | { type: 'submit' }
  | { type: 'created'; order: CreatedOrder; key: string }
  | { type: 'failed'; error: string };

const initialState: State = {
  open: false,
  step: 1,
  dir: 1,
  color: 'burgundy',
  storage: null,
  /** Figma 494:153 preselects «الشحن». */
  method: 'shipping',
  email: '',
  branchId: null,
  pickupDate: null,
  pickupTime: null,
  city: '',
  district: '',
  nationalAddress: '',
  name: '',
  phone: '',
  phoneCountry: 'SA',
  showErrors: false,
  touched: {},
  submitting: false,
  error: null,
  order: null,
  orderKey: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open':
      return { ...state, open: true, step: 1, dir: 1, error: null, showErrors: false };
    case 'close':
      return { ...state, open: false, submitting: false };
    case 'goto':
      return {
        ...state,
        step: action.step,
        dir: action.step > state.step ? 1 : -1,
        error: null,
      };
    case 'color':
      return { ...state, color: action.value };
    case 'storage':
      return { ...state, storage: action.value };
    case 'field':
      return { ...state, ...action.patch, error: null };
    case 'showErrors':
      return { ...state, showErrors: true };
    case 'touch':
      return state.touched[action.field]
        ? state
        : { ...state, touched: { ...state.touched, [action.field]: true } };
    case 'submit':
      return { ...state, submitting: true, error: null };
    case 'created':
      return {
        ...state,
        submitting: false,
        order: action.order,
        orderKey: action.key,
        step: 3,
        dir: 1,
      };
    case 'failed':
      return { ...state, submitting: false, error: action.error };
    default:
      return state;
  }
}

/**
 * Every finish (named and ordered as in FINISHES), each tied to the API colour
 * that represents it, plus any API colour that matches no finish.
 */
function colorOptions(variants: Variant[]): ColorOption[] {
  const apiColors = new Map<string, string>();
  for (const variant of variants) {
    if (!apiColors.has(variant.color)) apiColors.set(variant.color, variant.color_label_ar);
  }
  const keys = [...apiColors.keys()];
  const finishes = FINISHES.map((finish) => {
    const key = keys.find((k) => finishIdFor(k) === finish.id);
    return { key: key ?? finish.id, label: finish.name, dot: finish.dot, orderable: Boolean(key) };
  });
  const extra = keys
    .filter((k) => !finishIdFor(k))
    .map((k) => ({ key: k, label: apiColors.get(k) ?? k, dot: null, orderable: true }));
  return [...finishes, ...extra];
}

/** Picks the API colour for `wanted`: exact key, then same finish, then the first. */
function resolveColor(options: ColorOption[], wanted: string): ColorOption | null {
  return (
    options.find((option) => option.key === wanted) ??
    options.find((option) => finishIdFor(option.key) === (finishIdFor(wanted) ?? wanted)) ??
    options[0] ??
    null
  );
}

export type FieldKey =
  | 'email'
  | 'name'
  | 'phone'
  | 'city'
  | 'district'
  | 'nationalAddress'
  | 'branchId'
  | 'pickupDate'
  | 'pickupTime';

export type FieldErrors = Partial<Record<FieldKey, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(state: State): { errors: FieldErrors; phone: string | null } {
  const errors: FieldErrors = {};
  const phone = normalizePhone(state.phone, state.phoneCountry);
  if (!EMAIL_RE.test(state.email.trim())) errors.email = FLOW.fields.email.error;
  if (state.name.trim().length < 2) errors.name = FLOW.fields.name.error;
  if (!phone) errors.phone = FLOW.fields.phone.error;
  if (state.method === 'pickup') {
    if (!state.branchId) errors.branchId = FLOW.step2.branchLabel;
    if (!state.pickupDate) errors.pickupDate = FLOW.step2.dayLabel;
    if (!state.pickupTime) errors.pickupTime = FLOW.step2.timeLabel;
  } else {
    if (!state.city.trim()) errors.city = FLOW.fields.city.error;
    if (!state.district.trim()) errors.district = FLOW.fields.district.error;
    if (!state.nationalAddress.trim()) errors.nationalAddress = FLOW.fields.nationalAddress.error;
  }
  return { errors, phone };
}

function orderErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return FLOW.networkError;
    const first = Object.values(error.fieldErrors ?? {})[0]?.[0];
    // Field messages come back in English from the API; show them as a detail.
    return first ? `${FLOW.orderError} (${first})` : FLOW.orderError;
  }
  return FLOW.orderError;
}

type FlowApi = State & {
  variants: Variant[];
  variantsStatus: LoadStatus;
  branches: Branch[];
  branchesStatus: LoadStatus;
  reloadVariants: () => void;
  colors: ColorOption[];
  activeColor: ColorOption | null;
  storages: string[];
  /** Every Pro Max tier for the active colour, sellable or not. */
  storageOptions: StorageOption[];
  activeStorage: string | null;
  variant: Variant | null;
  fieldErrors: FieldErrors;
  canContinue: boolean;
  /** Opens the flow and remembers the trigger so focus can be restored. */
  openFlow: (trigger?: HTMLElement | null) => void;
  closeFlow: () => void;
  next: () => void;
  back: () => void;
  setColor: (value: string) => void;
  setStorage: (value: string) => void;
  setField: (patch: Partial<Form>) => void;
  touchField: (field: FieldKey) => void;
};

const FlowContext = createContext<FlowApi | null>(null);

export function PurchaseFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const triggerRef = useRef<HTMLElement | null>(null);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsStatus, setVariantsStatus] = useState<LoadStatus>('loading');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesStatus, setBranchesStatus] = useState<LoadStatus>('loading');

  const loadVariants = useCallback(() => {
    setVariantsStatus('loading');
    getVariants()
      .then((rows) => {
        setVariants(rows);
        setVariantsStatus('ready');
      })
      .catch(() => setVariantsStatus('error'));
  }, []);

  const loadBranches = useCallback(() => {
    setBranchesStatus('loading');
    getBranches()
      .then((rows) => {
        setBranches(rows);
        setBranchesStatus('ready');
        // With a single branch there is nothing to choose.
        if (rows.length === 1) dispatch({ type: 'field', patch: { branchId: rows[0].id } });
      })
      .catch(() => setBranchesStatus('error'));
  }, []);

  useEffect(() => {
    loadVariants();
    loadBranches();
  }, [loadVariants, loadBranches]);

  const reloadVariants = useCallback(() => {
    loadVariants();
    loadBranches();
  }, [loadVariants, loadBranches]);

  const openFlow = useCallback(
    (trigger?: HTMLElement | null) => {
      triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
      dispatch({ type: 'open' });
      if (variantsStatus === 'error') loadVariants();
      if (branchesStatus === 'error') loadBranches();
    },
    [variantsStatus, branchesStatus, loadVariants, loadBranches],
  );

  const closeFlow = useCallback(() => {
    dispatch({ type: 'close' });
    // Hand focus back to whatever opened the flow.
    const trigger = triggerRef.current;
    if (trigger && document.contains(trigger)) {
      requestAnimationFrame(() => trigger.focus());
    }
  }, []);

  const colors = useMemo(() => colorOptions(variants), [variants]);
  const activeColor = useMemo(() => resolveColor(colors, state.color), [colors, state.color]);
  // Sellable sizes across all colours (every colour shares the same sizes).
  const storages = useMemo(() => [...new Set(variants.map((v) => v.storage_label))], [variants]);
  const activeStorage =
    state.storage && storages.includes(state.storage) ? state.storage : (storages[0] ?? null);
  const storageOptions = useMemo<StorageOption[]>(() => {
    if (!activeColor) return [];
    const priceOf = (label: string) =>
      (
        variants.find((v) => v.color === activeColor.key && v.storage_label === label) ??
        variants.find((v) => v.storage_label === label)
      )?.price;
    const tiers = STORAGE_TIERS.map(({ label, officialPrice }) => {
      const price = priceOf(label);
      return price === undefined
        ? { label, price: officialPrice, available: false }
        : { label, price, available: true };
    });
    // Any size the API sells that isn't a known tier still gets a tile.
    const extra = storages
      .filter((label) => !STORAGE_TIERS.some((tier) => tier.label === label))
      .map((label) => ({ label, price: priceOf(label) ?? 0, available: true }));
    return [...tiers, ...extra];
  }, [variants, activeColor, storages]);
  // Every colour can be ordered. Until the API has a variant per colour, a
  // colour without its own falls back to the variant for the chosen size
  // (same product and price); the chosen colour still travels in the
  // payment's description and metadata (see Payment.tsx).
  const variant =
    variants.find((v) => v.color === activeColor?.key && v.storage_label === activeStorage) ??
    variants.find((v) => v.storage_label === activeStorage) ??
    null;

  const { errors: allErrors, phone } = useMemo(() => validate(state), [state]);
  // A hint shows once its field has been left, or for every field after a submit attempt.
  const fieldErrors = useMemo(() => {
    if (state.showErrors) return allErrors;
    const shown: FieldErrors = {};
    for (const key of Object.keys(allErrors) as FieldKey[]) {
      if (state.touched[key]) shown[key] = allErrors[key];
    }
    return shown;
  }, [allErrors, state.showErrors, state.touched]);
  const formValid = Object.keys(allErrors).length === 0;

  const canContinue =
    state.step === 1 ? Boolean(variant) : state.step === 2 ? !state.submitting : false;

  const submitOrder = useCallback(async () => {
    if (!variant || !phone) return;
    const base = {
      variant_id: variant.id,
      customer_name: state.name.trim(),
      customer_phone: phone,
      customer_email: state.email.trim(),
    };
    const body: CreateOrderBody =
      state.method === 'pickup'
        ? {
            ...base,
            fulfillment_method: 'pickup',
            branch_id: state.branchId as number,
            pickup_date: state.pickupDate as string,
            pickup_time: state.pickupTime as string,
          }
        : {
            ...base,
            fulfillment_method: 'shipping',
            city: state.city.trim(),
            district: state.district.trim(),
            national_address: state.nationalAddress.trim(),
          };
    const key = JSON.stringify(body);

    // Coming back to payment without changing anything: keep the same order.
    if (state.order && state.orderKey === key && state.order.status === 'pending_payment') {
      dispatch({ type: 'goto', step: 3 });
      return;
    }

    dispatch({ type: 'submit' });
    try {
      const order = await createOrder(body);
      dispatch({ type: 'created', order, key });
    } catch (error) {
      dispatch({ type: 'failed', error: orderErrorMessage(error) });
    }
  }, [variant, phone, state]);

  const next = useCallback(() => {
    if (state.step === 1) {
      if (variant) dispatch({ type: 'goto', step: 2 });
      return;
    }
    if (state.step === 2) {
      if (state.submitting) return;
      if (!formValid) {
        dispatch({ type: 'showErrors' });
        return;
      }
      void submitOrder();
    }
  }, [state.step, state.submitting, variant, formValid, submitOrder]);

  const api = useMemo<FlowApi>(
    () => ({
      ...state,
      variants,
      variantsStatus,
      branches,
      branchesStatus,
      reloadVariants,
      colors,
      activeColor,
      storages,
      storageOptions,
      activeStorage,
      variant,
      fieldErrors,
      canContinue,
      openFlow,
      closeFlow,
      next,
      back: () => {
        if (state.step > 1) dispatch({ type: 'goto', step: (state.step - 1) as Step });
      },
      setColor: (value) => dispatch({ type: 'color', value }),
      setStorage: (value) => dispatch({ type: 'storage', value }),
      setField: (patch) => dispatch({ type: 'field', patch }),
      touchField: (field) => dispatch({ type: 'touch', field }),
    }),
    [
      state,
      variants,
      variantsStatus,
      branches,
      branchesStatus,
      reloadVariants,
      colors,
      activeColor,
      storages,
      storageOptions,
      activeStorage,
      variant,
      fieldErrors,
      canContinue,
      openFlow,
      closeFlow,
      next,
    ],
  );

  return <FlowContext.Provider value={api}>{children}</FlowContext.Provider>;
}

export function usePurchaseFlow(): FlowApi {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('usePurchaseFlow must be used inside <PurchaseFlowProvider>');
  return ctx;
}
