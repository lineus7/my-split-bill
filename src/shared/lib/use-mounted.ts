import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns false during SSR & first client render, true after hydration.
 * SSR-safe pengganti pola `useState(false) + useEffect(() => setMounted(true))`,
 * tanpa melanggar rule `react-hooks/set-state-in-effect`.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
