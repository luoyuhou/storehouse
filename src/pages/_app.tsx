import React from "react";
import Head from "next/head";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import { AuthConsumer, AuthProvider } from "@/contexts/auth-context";
import { useNProgress } from "@/hooks/use-nprogress";
import { createTheme } from "@/theme";
import { createEmotionCache } from "@/utils/create-emotion-cache";
import "simplebar-react/dist/simplebar.min.css";

const clientSideEmotionCache = createEmotionCache();

function SplashScreen() {
  return null;
}

function App(props: {
  Component: { getLayout: (e: React.ReactNode) => void };
  emotionCache?: EmotionCache | undefined;
  pageProps: Record<string, never>;
}) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useNProgress();

  const getLayout = Component.getLayout ?? ((page: never) => page);

  const theme = createTheme();

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Devias Kit</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthConsumer>
              {(auth) =>
                auth.isLoading ? <SplashScreen /> : getLayout(<Component {...pageProps} />)
              }
            </AuthConsumer>
            <ToastContainer />
          </ThemeProvider>
        </AuthProvider>
      </LocalizationProvider>
    </CacheProvider>
  );
}

export default App;
