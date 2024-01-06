import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import PropTypes from "prop-types";
import { get, post } from "src/lib/http";
import { UserEntity } from "src/types/users";

type HandlerType = "INITIALIZE" | "SIGN_IN" | "SIGN_OUT";
const HANDLERS = {
  INITIALIZE: "INITIALIZE",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserEntity | null;
};

const initialState: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const handlers = {
  [HANDLERS.INITIALIZE]: (
    state: AuthContextType,
    action: { type: HandlerType; payload: never },
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
  [HANDLERS.SIGN_IN]: (state: AuthContextType, action: { type: HandlerType; payload: never }) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  [HANDLERS.SIGN_OUT]: (state: AuthContextType, action: { type: HandlerType; payload: never }) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  },
};

const formatUser = (user: UserEntity) => {
  return {
    id: user.user_id,
    avatar: user.avatar ?? "/assets/avatars/avatar-anika-visser.png",
    name: `${user.last_name}${user.first_name}`,
    phone: user.phone,
    email: user.email,
  };
};

const reducer = (state: AuthContextType, action: { type: HandlerType; payload: never }) =>
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
  user: null,
  isLoading: false,
  isAuthenticated: true,
  authPaths: [],
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

    let user;

    try {
      const result = await get<{ data: UserEntity }>("/api/auth/sign-in");
      user = formatUser(result.data);
    } catch (err) {
      console.error(err);
    }

    if (user) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      dispatch({ type: HANDLERS.INITIALIZE, payload: user });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      dispatch({ type: HANDLERS.INITIALIZE });
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

    const user = formatUser(res.data);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dispatch({ type: HANDLERS.SIGN_IN, payload: user });
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dispatch({ type: HANDLERS.SIGN_OUT });
  };

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const values = { ...state, signIn, signUp, signOut };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
