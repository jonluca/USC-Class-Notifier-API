import type { PlasmoCSConfig } from "plasmo";
import { useStorage } from "@plasmohq/storage/hook";
import React, { useEffect, useState } from "react";
import { initExtension } from "~/extension/extension";
import { extensionEnabledKey, showConflictsKey, showUnitsKey } from "~/constants";
import { AppContext, context, useScheduleHelperContext } from "~/extension/context";
// @ts-ignore
import cssText from "data-text:~/styles/globals.css";
// @ts-ignore
import toastifyStyles from "data-text:react-toastify/dist/ReactToastify.css";

import { CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import NotificationModal from "~/extension/notification";
import "https://www.googletagmanager.com/gtag/js?id=G-057WK9KK0E";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "~/extension/data";
import { ToastContainer } from "react-toastify";

export const config: PlasmoCSConfig = {
  matches: ["*://classes.usc.edu/*/classes/*", "*://webreg.usc.edu/*"],
  all_frames: true,
};
const styleElement = document.createElement("style");

const styleCache = createCache({
  key: "plasmo-mui-cache",
  prepend: true,
  container: styleElement,
});

export const getStyle = () => {
  styleElement.textContent += cssText;
  styleElement.textContent += toastifyStyles;
  return styleElement;
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

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
  const [enabled] = useStorage(extensionEnabledKey);
  const [showConflicts] = useStorage(showConflictsKey);
  const [showUnits] = useStorage(showUnitsKey);
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
      <style dangerouslySetInnerHTML={{ __html: toastifyStyles }} />
      <CssBaseline />
      <ToastContainer />
      <ExtensionLogic />
    </Providers>
  );
};

export default ExtensionView;
