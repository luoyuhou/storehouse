import "src/styles/globals.css";
import "src/styles/common.css";
import React from "react";
import Head from "next/head";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import { AuthConsumer, AuthProvider } from "src/contexts/auth-context";
import { useNProgress } from "src/hooks/use-nprogress";
import { createTheme } from "src/theme";
import { createEmotionCache } from "src/utils/create-emotion-cache";
import "simplebar-react/dist/simplebar.min.css";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "src/contexts/socket";

const clientSideEmotionCache = createEmotionCache();

function SplashScreen() {
  return null;
}

function App(props: {
  Component: { getLayout: (e: React.JSX.Element) => JSX.Element };
  emotionCache?: EmotionCache | undefined;
  pageProps: Record<string, never>;
}) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useNProgress();

  const getLayout = Component.getLayout ?? ((page: React.JSX.Element) => page);

  const theme = createTheme();

  const render = (isLoading: boolean) => {
    if (isLoading) {
      return <SplashScreen />;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return getLayout(<Component {...pageProps} />);
  };

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Devias Kit</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <SocketProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AuthConsumer>{(auth) => render(auth.isLoading)}</AuthConsumer>
              <ToastContainer />
            </ThemeProvider>
          </SocketProvider>
        </AuthProvider>
      </LocalizationProvider>
    </CacheProvider>
  );
}

export default App;
