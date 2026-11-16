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
  getAddons,
  getBranches,
  getVariants,
  type Addon,
  type Branch,
  type CreateOrderBody,
  type CreatedOrder,
  type FulfillmentMethod,
  type Variant,
} from '@/lib/api';
import {
  BRANCH_LOCATIONS,
  EDITIONS,
  FINISHES,
  FLOW,
  MAX_ADDON_QUANTITY,
  MAX_PHONE_QUANTITY,
  STORAGE_TIERS,
  branchDisplayName,
  branchLocationFor,
  finishIdFor,
  type EditionId,
  type PickupTimeId,
} from '@/lib/content';
import { normalizePhone } from '@/lib/format';
import type { CountryCode } from 'libphonenumber-js/min';

/** An add-on the customer chose, with how many of it. */
export type SelectedAddon = Addon & { quantity: number };

/**
 * One iPhone line of the order: a colour/storage/edition and how many of it.
 * Labels and price are kept so the line can be shown without re-deriving it.
 */
export type PhoneLine = {
  /** variantId + colour key (a colour without its own variant shares one). */
  id: string;
  variantId: number;
  colorKey: string;
  colorLabel: string;
  dot: string | null;
  storage: string;
  editionId: EditionId;
  editionLabel: string;
  /** Halalas, per phone. */
  unitPrice: number;
  quantity: number;
};

export type Step = 1 | 2 | 3;
export type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * A colour tile. `key` is the API colour key when the API sells the colour,
 * otherwise the finish id; `orderable` is false until the API has a variant.
 */
export type ColorOption = { key: string; label: string; dot: string | null; orderable: boolean };

/**
 * A pickup branch tile. Both Wafi branches are always offered; `apiId` is the
 * order API's branch id, or null while the API doesn't list that branch yet.
 */
export type BranchOption = {
  key: string;
  apiId: number | null;
  name: string;
  address: string;
  mapUrl: string | null;
};

/** An edition tile with the price it costs in the chosen configuration (halalas). */
export type EditionOption = (typeof EDITIONS)[number] & {
  displayPrice: number;
  /** False when the catalog has editions but none for this one yet. */
  available: boolean;
};

/** A storage tile: sellable tiers carry the API price, the rest Apple's official price. */
export type StorageOption = { label: string; price: number; available: boolean };

type Form = {
  /** Regional edition (frame «الإصدار»). */
  edition: EditionId;
  method: FulfillmentMethod;
  email: string;
  /** BranchOption.key of the chosen pickup branch. */
  branchId: string | null;
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
  /** Add-on id → how many the customer wants (absent = not selected). */
  addonQty: Record<number, number>;
  /** How many of the configuration currently on screen. */
  phoneQty: number;
  /** Phones already added in other colours/sizes (the on-screen one is not in here). */
  cart: PhoneLine[];
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
  | { type: 'toggleAddon'; id: number }
  | { type: 'addonQty'; id: number; quantity: number }
  | { type: 'phoneQty'; quantity: number }
  /** Saves the on-screen phone to the cart and moves the picker to `nextColor`. */
  | { type: 'addPhone'; line: PhoneLine; nextColor: string | null }
  | { type: 'cartQty'; id: string; quantity: number }
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
  addonQty: {},
  phoneQty: 1,
  cart: [],
  edition: 'middle_east',
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

function clampPhoneQty(quantity: number, min: number): number {
  return Math.min(MAX_PHONE_QUANTITY, Math.max(min, Math.round(quantity)));
}

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
    case 'toggleAddon':
      return reducer(state, {
        type: 'addonQty',
        id: action.id,
        quantity: state.addonQty[action.id] ? 0 : 1,
      });
    case 'addonQty': {
      const quantity = Math.min(MAX_ADDON_QUANTITY, Math.max(0, Math.round(action.quantity)));
      const { [action.id]: _removed, ...rest } = state.addonQty;
      return { ...state, addonQty: quantity > 0 ? { ...rest, [action.id]: quantity } : rest };
    }
    case 'phoneQty':
      return { ...state, phoneQty: clampPhoneQty(action.quantity, 1) };
    case 'addPhone': {
      const existing = state.cart.find((line) => line.id === action.line.id);
      const cart = existing
        ? state.cart.map((line) =>
            line.id === action.line.id
              ? { ...line, quantity: clampPhoneQty(line.quantity + action.line.quantity, 1) }
              : line,
          )
        : [...state.cart, action.line];
      return {
        ...state,
        cart,
        phoneQty: 1,
        ...(action.nextColor ? { color: action.nextColor } : {}),
      };
    }
    case 'cartQty': {
      const quantity = clampPhoneQty(action.quantity, 0);
      return {
        ...state,
        cart:
          quantity > 0
            ? state.cart.map((line) => (line.id === action.id ? { ...line, quantity } : line))
            : state.cart.filter((line) => line.id !== action.id),
      };
    }
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

/** Swatch colour for an API colour key that has no finish of its own. */
function dotForKey(colorKey: string): string {
  const id = finishIdFor(colorKey);
  return FINISHES.find((finish) => finish.id === id)?.dot ?? '#6B6B70';
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
  /** Both Wafi branches, plus any other branch the API lists. */
  branchOptions: BranchOption[];
  selectedBranch: BranchOption | null;
  reloadVariants: () => void;
  /** Optional extras offered with the phone (empty if the API has none or failed). */
  addons: Addon[];
  /** The chosen add-ons with their quantity, in catalog order. */
  selectedAddons: SelectedAddon[];
  /** Sum of price × quantity over the chosen add-ons (halalas). */
  addonsTotal: number;
  /** Selects an add-on (quantity 1) or removes it. */
  toggleAddon: (id: number) => void;
  /** Sets an add-on's quantity (0 removes it; capped at MAX_ADDON_QUANTITY). */
  setAddonQuantity: (id: number, quantity: number) => void;
  colors: ColorOption[];
  activeColor: ColorOption | null;
  storages: string[];
  /** Every Pro Max tier for the active colour, sellable or not. */
  storageOptions: StorageOption[];
  activeStorage: string | null;
  /** Both editions with their price in the chosen configuration. */
  editionOptions: EditionOption[];
  activeEdition: EditionOption;
  /** What the chosen configuration costs (halalas), shown in step 1. */
  unitPrice: number | null;
  variant: Variant | null;
  /** The on-screen configuration as an order line (null until a variant resolves). */
  currentLine: PhoneLine | null;
  /** Every phone in the order: the cart plus the on-screen one, merged by variant. */
  phoneLines: PhoneLine[];
  /** Sum of unit price × quantity over phoneLines (halalas). */
  phonesTotal: number;
  /** Number of iPhones in the order. */
  phoneCount: number;
  /** False once the order holds MAX_PHONE_QUANTITY phones. */
  canAddPhone: boolean;
  setPhoneQuantity: (quantity: number) => void;
  /** Keeps the on-screen phone in the order and switches the picker to another colour. */
  addAnotherPhone: () => void;
  /** Sets a cart line's quantity (0 removes it). */
  setCartQuantity: (id: string, quantity: number) => void;
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
  const [addons, setAddons] = useState<Addon[]>([]);

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
      })
      .catch(() => setBranchesStatus('error'));
  }, []);

  useEffect(() => {
    loadVariants();
    loadBranches();
    // Add-ons are optional: if they fail to load the flow simply doesn't offer them.
    getAddons()
      .then(setAddons)
      .catch(() => setAddons([]));
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

  const selectedAddons = useMemo<SelectedAddon[]>(
    () =>
      addons
        .filter((addon) => state.addonQty[addon.id])
        .map((addon) => ({ ...addon, quantity: state.addonQty[addon.id] })),
    [addons, state.addonQty],
  );
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0);

  const colors = useMemo(() => colorOptions(variants), [variants]);
  const activeColor = useMemo(() => resolveColor(colors, state.color), [colors, state.color]);
  // Sellable sizes across all colours (every colour shares the same sizes).
  const storages = useMemo(() => [...new Set(variants.map((v) => v.storage_label))], [variants]);
  const activeStorage =
    state.storage && storages.includes(state.storage) ? state.storage : (storages[0] ?? null);
  // The API sells each (color, edition) as its own variant: only rows of the
  // chosen edition count, so variant_id alone carries the edition and price.
  const apiHasEditions = variants.some((v) => Boolean(v.edition));
  const editionSold = useCallback(
    (id: EditionId) => !apiHasEditions || variants.some((v) => v.edition === id),
    [apiHasEditions, variants],
  );
  // If the chosen edition isn't sold yet, fall back to the first one that is.
  const editionId: EditionId = editionSold(state.edition)
    ? state.edition
    : (EDITIONS.find((e) => editionSold(e.id))?.id ?? state.edition);
  const editionVariants = useMemo(
    () => (apiHasEditions ? variants.filter((v) => v.edition === editionId) : variants),
    [variants, apiHasEditions, editionId],
  );
  const editionDef = EDITIONS.find((e) => e.id === editionId) ?? EDITIONS[0];
  /** Price for a size: the API's per-edition variant, else the edition's 256GB price. */
  const priceFor = useCallback(
    (label: string, pool: Variant[], colorKey: string | undefined, fallbackEdition = editionDef) => {
      const v =
        pool.find((x) => x.color === colorKey && x.storage_label === label) ??
        pool.find((x) => x.storage_label === label);
      if (!v) return undefined;
      return apiHasEditions || label !== '256GB' ? v.price : fallbackEdition.price;
    },
    [apiHasEditions, editionDef],
  );

  const storageOptions = useMemo<StorageOption[]>(() => {
    if (!activeColor) return [];
    const priceOf = (label: string) => priceFor(label, editionVariants, activeColor.key);
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
  }, [editionVariants, activeColor, storages, priceFor]);
  // Every colour can be ordered. Until the API has a variant per colour, a
  // colour without its own falls back to the variant for the chosen size
  // (same product and price); the chosen colour still travels in the
  // payment's description and metadata (see Payment.tsx).
  const variant =
    editionVariants.find((v) => v.color === activeColor?.key && v.storage_label === activeStorage) ??
    editionVariants.find((v) => v.storage_label === activeStorage) ??
    null;

  const editionOptions = useMemo<EditionOption[]>(
    () =>
      EDITIONS.map((edition) => {
        const pool = apiHasEditions ? variants.filter((v) => v.edition === edition.id) : variants;
        return {
          ...edition,
          displayPrice: priceFor(activeStorage ?? '256GB', pool, activeColor?.key, edition) ?? edition.price,
          available: editionSold(edition.id),
        };
      }),
    [variants, apiHasEditions, activeStorage, activeColor, priceFor, editionSold],
  );
  const activeEdition = editionOptions.find((e) => e.id === editionId) ?? editionOptions[0];
  const unitPrice = variant ? activeEdition.displayPrice : null;

  const currentLine = useMemo<PhoneLine | null>(() => {
    if (!variant || !activeColor || unitPrice === null) return null;
    return {
      id: `${variant.id}:${activeColor.key}`,
      variantId: variant.id,
      colorKey: activeColor.key,
      colorLabel: activeColor.label,
      dot: activeColor.dot ?? dotForKey(activeColor.key),
      storage: variant.storage_label,
      editionId: activeEdition.id,
      editionLabel: activeEdition.label,
      unitPrice,
      quantity: state.phoneQty,
    };
  }, [variant, activeColor, activeEdition, unitPrice, state.phoneQty]);

  const phoneLines = useMemo<PhoneLine[]>(() => {
    const lines = state.cart.map((line) => ({ ...line }));
    if (currentLine) {
      const same = lines.find((line) => line.id === currentLine.id);
      if (same) same.quantity += currentLine.quantity;
      else lines.push(currentLine);
    }
    return lines;
  }, [state.cart, currentLine]);
  const phonesTotal = phoneLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const phoneCount = phoneLines.reduce((sum, line) => sum + line.quantity, 0);
  const canAddPhone = phoneCount < MAX_PHONE_QUANTITY;

  const addAnotherPhone = useCallback(() => {
    if (!currentLine || !canAddPhone) return;
    // Move the picker to the first colour not in the order yet (else keep it).
    const used = new Set([...state.cart.map((line) => line.colorKey), currentLine.colorKey]);
    const next = colors.find((option) => option.orderable && !used.has(option.key));
    dispatch({ type: 'addPhone', line: currentLine, nextColor: next?.key ?? null });
  }, [currentLine, canAddPhone, state.cart, colors]);

  const branchOptions = useMemo<BranchOption[]>(() => {
    const known = BRANCH_LOCATIONS.map((location) => {
      const api = branches.find((branch) => branch.name_ar.includes(location.match));
      return {
        key: location.match,
        apiId: api?.id ?? null,
        name: location.name,
        address: api?.address || location.address,
        mapUrl: location.mapUrl,
      };
    });
    const extra = branches
      .filter((branch) => !branchLocationFor(branch.name_ar))
      .map((branch) => ({
        key: `api-${branch.id}`,
        apiId: branch.id,
        name: branchDisplayName(branch.name_ar),
        address: branch.address || branch.city || '',
        mapUrl: null,
      }));
    return [...known, ...extra];
  }, [branches]);
  const selectedBranch = branchOptions.find((option) => option.key === state.branchId) ?? null;

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
    if (!variant || !phone || phoneLines.length === 0) return;
    // One item per variant (two colours sharing a fallback variant are summed).
    const quantities = new Map<number, number>();
    for (const line of phoneLines) {
      quantities.set(line.variantId, (quantities.get(line.variantId) ?? 0) + line.quantity);
    }
    const base = {
      items: [...quantities].map(([variant_id, quantity]) => ({ variant_id, quantity })),
      customer_name: state.name.trim(),
      customer_phone: phone,
      customer_email: state.email.trim(),
      ...(selectedAddons.length
        ? { addons: selectedAddons.map((addon) => ({ id: addon.id, quantity: addon.quantity })) }
        : {}),
    };
    const body: CreateOrderBody =
      state.method === 'pickup'
        ? {
            ...base,
            fulfillment_method: 'pickup',
            // A branch the API doesn't list yet goes out on the first listed
            // branch's id; the chosen branch still travels in the payment's
            // description and metadata (see Payment.tsx).
            branch_id: (selectedBranch?.apiId ?? branches[0]?.id) as number,
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
  }, [variant, phone, phoneLines, state, selectedBranch, branches, selectedAddons]);

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
      branchOptions,
      selectedBranch,
      reloadVariants,
      addons,
      selectedAddons,
      addonsTotal,
      toggleAddon: (id) => dispatch({ type: 'toggleAddon', id }),
      setAddonQuantity: (id, quantity) => dispatch({ type: 'addonQty', id, quantity }),
      colors,
      activeColor,
      storages,
      storageOptions,
      activeStorage,
      editionOptions,
      activeEdition,
      unitPrice,
      variant,
      currentLine,
      phoneLines,
      phonesTotal,
      phoneCount,
      canAddPhone,
      setPhoneQuantity: (quantity) => dispatch({ type: 'phoneQty', quantity }),
      addAnotherPhone,
      setCartQuantity: (id, quantity) => dispatch({ type: 'cartQty', id, quantity }),
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
      branchOptions,
      selectedBranch,
      reloadVariants,
      addons,
      selectedAddons,
      addonsTotal,
      colors,
      activeColor,
      storages,
      storageOptions,
      activeStorage,
      editionOptions,
      activeEdition,
      unitPrice,
      variant,
      currentLine,
      phoneLines,
      phonesTotal,
      phoneCount,
      canAddPhone,
      addAnotherPhone,
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
