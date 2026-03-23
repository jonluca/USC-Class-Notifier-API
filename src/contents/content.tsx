import React, { useEffect, useState } from "react";
import { initExtension } from "@/extension/extension";
import { AppContext, context, useScheduleHelperContext } from "@/extension/context";
import { CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import NotificationModal from "@/extension/notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/extension/data";
import { ToastContainer } from "react-toastify";
import {
  extensionEnabledStorage,
  showConflictsStorage,
  showUnitsStorage,
  useStorageItem,
} from "@/extension/storage";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [styleCache] = useState(() =>
    createCache({
      key: "wxt-mui-cache",
      prepend: true,
      container: document.head ?? document.documentElement,
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={styleCache}>
          <AppContext.Provider value={context}>{children}</AppContext.Provider>
        </CacheProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const ExtensionLogic = () => {
  const [enabled] = useStorageItem(extensionEnabledStorage, true);
  const [showConflicts] = useStorageItem(showConflictsStorage, true);
  const [showUnits] = useStorageItem(showUnitsStorage, true);
  const selectedClass = useScheduleHelperContext((state) => state.selectedClass);
  useEffect(() => {
    initExtension({
      enabled,
      showConflicts,
      showUnits,
    });
  }, [enabled, showConflicts, showUnits]);
  if (!selectedClass) {
    return null;
  }
  return <NotificationModal />;
};

const ExtensionView = () => {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments); // eslint-disable-line
    };
    window.gtag("js", new Date());
  }, []);
  return (
    <Providers>
      <CssBaseline />
      <ToastContainer />
      <ExtensionLogic />
    </Providers>
  );
};

export default ExtensionView;
