import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import PropTypes from "prop-types";
import { boolean } from "yup";
import { post } from "@/lib/http";
import { UserEntity } from "@/types/users";

const HANDLERS = {
  INITIALIZE: "INITIALIZE",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const handlers = {
  [HANDLERS.INITIALIZE]: (
    state: Record<string, never>,
    action: { payload: Record<string, never> },
  ) => {
    const user = action.payload;

    return {
      ...state,
      ...// if payload (user) is provided, then is authenticated
      (user
        ? {
            isAuthenticated: true,
            isLoading: false,
            user,
          }
        : {
            isLoading: false,
          }),
    };
  },
  [HANDLERS.SIGN_IN]: (
    state: Record<string, never>,
    action: { payload: Record<string, never> },
  ) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  [HANDLERS.SIGN_OUT]: (state: any) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  },
};

const reducer = (state: Record<string, never>, action: any) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

// The role of this context is to propagate authentication state through the App tree.

export const AuthContext = createContext({
  signIn: async (phone: string, password: string) => {},
  signUp: async (args: {
    first_name: string;
    last_name: string;
    phone: string;
    password: string;
  }) => {},
  signOut: () => {},
  isLoading: false,
});

export function AuthProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;

    try {
      isAuthenticated = window.sessionStorage.getItem("authenticated") === "true";
    } catch (err) {
      console.error(err);
    }

    if (isAuthenticated) {
      const user = {
        id: "5e86809283e28b96d2d38537",
        avatar: "/assets/avatars/avatar-anika-visser.png",
        name: "Anika Visser",
        email: "anika.visser@devias.io",
      };

      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: user,
      });
    } else {
      dispatch({
        type: HANDLERS.INITIALIZE,
      });
    }
  };

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const signIn = async (phone: string, password: string) => {
    const res = await post<{
      data: UserEntity;
    }>({
      url: "/api/auth/local/sign-in",
      config: {},
      payload: { phone, password },
    });
    window.sessionStorage.setItem("authenticated", "true");

    const user = {
      id: res.data.user_id,
      avatar: res.data.avatar ?? "/assets/avatars/avatar-anika-visser.png",
      name: `${res.data.last_name}${res.data.first_name}`,
      phone: res.data.phone,
      email: res.data.email,
    };

    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: user,
    });
  };

  const signUp = async (args: {
    first_name: string;
    last_name: string;
    phone: string;
    password: string;
  }) => {
    return post({
      url: "/api/auth/local/sign-up",
      config: {},
      payload: args,
    });
  };

  const signOut = () => {
    dispatch({
      type: HANDLERS.SIGN_OUT,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
