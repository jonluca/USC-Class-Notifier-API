import { storage } from "@wxt-dev/storage";
import { useEffect, useRef, useState } from "react";

interface DefinedStorageItem<T> {
  getValue: () => Promise<T>;
  setValue: (value: T) => Promise<void>;
  watch: (callback: (newValue: T, oldValue: T | null) => void) => () => void;
}

type StorageUpdater<T> = T | ((currentValue: T) => T);

export const extensionEnabledStorage = storage.defineItem<boolean>("local:extensionEnabled", {
  fallback: true,
});

export const showConflictsStorage = storage.defineItem<boolean>("local:showConflicts", {
  fallback: true,
});

export const showUnitsStorage = storage.defineItem<boolean>("local:showUnits", {
  fallback: true,
});

export function useStorageItem<T>(item: DefinedStorageItem<T>, initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    let isMounted = true;

    item.getValue().then((storedValue) => {
      if (isMounted) {
        setValue(storedValue);
      }
    });

    const unwatch = item.watch((newValue) => {
      if (isMounted) {
        setValue(newValue);
      }
    });

    return () => {
      isMounted = false;
      unwatch();
    };
  }, [item]);

  const updateValue = async (nextValue: StorageUpdater<T>) => {
    const resolvedValue =
      typeof nextValue === "function" ? (nextValue as (currentValue: T) => T)(valueRef.current) : nextValue;
    await item.setValue(resolvedValue);
  };

  return [value, updateValue] as const;
}
