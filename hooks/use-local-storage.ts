"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";

import { useEventCallback } from "@/hooks/use-event-callback";
import { useEventListener } from "@/hooks/use-event-listener";

declare global {
  interface WindowEventMap {
    "local-storage": CustomEvent;
  }
}

type UseLocalStorageOptions<T> = {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === "undefined";

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const {
    initializeWithValue = true,
    serializer: customSerializer,
    deserializer: customDeserializer,
  } = options;

  const [defaultValue] = useState<T>(
    initialValue instanceof Function ? (initialValue as () => T) : () => initialValue
  );

  const serializer = useCallback<(value: T) => string>(
    (value) => {
      if (customSerializer) {
        return customSerializer(value);
      }

      return JSON.stringify(value);
    },
    [customSerializer]
  );

  const deserializer = useCallback<(value: string) => T>(
    (value) => {
      if (customDeserializer) {
        return customDeserializer(value);
      }
      if (value === "undefined") {
        return undefined as unknown as T;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return defaultValue;
      }

      return parsed as T;
    },
    [customDeserializer, defaultValue]
  );

  const readValue = useCallback((): T => {
    if (IS_SERVER) {
      return defaultValue;
    }

    try {
      const raw = window.localStorage.getItem(key);
      return raw ? deserializer(raw) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [defaultValue, key, deserializer]);

  const [storedValue, setStoredValue] = useState(() => {
    if (initializeWithValue) {
      return readValue();
    }

    return defaultValue;
  });

  const setValue: Dispatch<SetStateAction<T>> = useEventCallback((value) => {
    if (IS_SERVER) {
      console.warn(
        `Tried setting localStorage key "${key}" even though environment is not a client`
      );
    }

    try {
      const newValue = value instanceof Function ? value(readValue()) : value;

      window.localStorage.setItem(key, serializer(newValue));

      setStoredValue(newValue);

      window.dispatchEvent(new StorageEvent("local-storage", { key }));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  });

  const removeValue = useEventCallback(() => {
    if (IS_SERVER) {
      console.warn(
        `Tried removing localStorage key "${key}" even though environment is not a client`
      );
    }

    window.localStorage.removeItem(key);

    setStoredValue(defaultValue);

    window.dispatchEvent(new StorageEvent("local-storage", { key }));
  });

  useEffect(() => {
    // react-doctor-disable-next-line react-doctor/no-pass-data-to-parent
    setStoredValue(readValue());
  }, [readValue]);

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
        return;
      }
      setStoredValue(readValue());
    },
    [key, readValue]
  );

  useEventListener("storage", handleStorageChange);

  useEventListener("local-storage", handleStorageChange);

  return [storedValue, setValue, removeValue];
}

export type { UseLocalStorageOptions };
