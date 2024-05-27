import { CacheProvider } from "@emotion/react";
import { CssBaseline, NoSsr } from "@mui/material";
import createEmotionCache from "@/utils/emotionCache";
import type { AppPropsType } from "next/dist/shared/lib/utils";
import { api } from "@/utils/api";
import { ToastContainer } from "react-toastify";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

import { Navbar } from "@/components/navbar";
import dynamic from "next/dynamic";

const clientSideEmotionCache = createEmotionCache();

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((module) => module.ReactQueryDevtools),
  {
    ssr: false,
  },
);
const App = ({ Component, pageProps: pageProps }: AppPropsType) => {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <CssBaseline />
      <Navbar />
      <main className={`px-4 mx-auto h-screen w-full overflow-y-hidden`}>
        <div className={"max-h-full h-full overflow-y-auto hide-scrollbar w-full flex justify-center"}>
          <div className={"max-w-7xl h-full w-full"}>
            <NoSsr>
              <ToastContainer />
              <ReactQueryDevtools />
            </NoSsr>
            <Component {...pageProps} />
          </div>
        </div>
      </main>
    </CacheProvider>
  );
};
export default api.withTRPC(App);
