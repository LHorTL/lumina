import * as React from "react";

const readHash = (fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const raw = window.location.hash.replace(/^#\/?/, "");
  return raw || fallback;
};

/**
 * Minimal hash router for the playground.
 * URL shape: `#/button`, `#/typography`, ...
 */
export function useHashRoute(
  fallback: string,
  isValid?: (id: string) => boolean
): [string, (id: string) => void] {
  const [id, setId] = React.useState<string>(() => {
    const initial = readHash(fallback);
    return isValid && !isValid(initial) ? fallback : initial;
  });

  React.useEffect(() => {
    const sync = () => {
      const next = readHash(fallback);
      if (isValid && !isValid(next)) {
        window.location.hash = `/${fallback}`;
        return;
      }
      setId(next);
    };
    window.addEventListener("hashchange", sync);
    if (!window.location.hash) {
      window.location.hash = `/${id}`;
    }
    return () => window.removeEventListener("hashchange", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = React.useCallback((next: string) => {
    if (`#/${next}` !== window.location.hash) {
      window.location.hash = `/${next}`;
    }
  }, []);

  return [id, go];
}
