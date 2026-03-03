import { auth } from '@/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  User
} from 'firebase/auth';

import useFetch from '@/hooks/useFetch';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserInfo {
  uid: User['uid'] | null ;
  email: User['email'] | null;
  firstName: string | null;
  lastName: string | null;
  token: string | null;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  email: string | null;
  fetchSignInMethods:(email: string) => Promise<string[]>;
  signUp: (email: string, password: string) => Promise<{ user: any, token: string }>;
  signIn: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<{ userData: any }>;
  googleSignUp: () => Promise<{ userData: any }>;
  logout: () => Promise<void>;
  googleSignInAndVerify: () => Promise<{ userData: any }>;
  signInWithTemporaryToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>("");
  const [googleLoggedIn, setGoogleLoggedIn] = useState(true);

  const {
    refetch: checkProviders
  } = useFetch('/api/auth/providers', {
    method: 'GET',
    autoFetch: false,
    withAuth: false,
  });

  const {
    refetch: checkEmail
  } = useFetch('/api/users/exists', {
    method: 'GET',
    autoFetch: false,
    withAuth: false,
  });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: `${process.env.EXPO_PUBLIC_WEB_CLIENT_ID}`, 
      offlineAccess: true, 
      forceCodeForRefreshToken: true, 
      scopes: ['profile', 'email'],
    });
  }, []);

  if (googleLoggedIn) {
    
  }

useEffect(() => {
  if (googleLoggedIn) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const forgotPasswordInProgress = await SecureStore.getItemAsync("forgotPasswordInProgress");
        if (forgotPasswordInProgress === "true") {
          setLoading(false);
          return;
        }

        const firebaseToken = await firebaseUser.getIdToken();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(" ")[0] || null,
          lastName: firebaseUser.displayName?.split(" ")[1] || null,
          token: firebaseToken,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

  return unsubscribe;
  }
}, []);

  const googleSignInAndVerify = async () => {
    try {
      // Get Google info without touching Firebase
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const rawGoogleEmail = result.data?.user?.email;

      if (!rawGoogleEmail) {
        throw new Error("No email found from Google account.");
      }

      const googleEmail = rawGoogleEmail.trim().toLowerCase();

      const emailResponse = await checkEmail({ params: { email: googleEmail } });

      if (!emailResponse || emailResponse.error) {
        throw new Error(emailResponse?.error?.message || "Error checking email.");
      }

      const emailAvailable = emailResponse?.data?.available;

      if (!emailAvailable) {
        const providersResponse = await checkProviders({
          params: { email: googleEmail },
        });

        if (!providersResponse || providersResponse.error) {
          throw new Error(providersResponse?.error?.message || "Error checking providers.");
        }

        const providers = providersResponse?.data?.providers || [];
        const hasGoogleProvider = providers.includes('google.com');

        console.log("Providers for this email:", providers);

        if (!hasGoogleProvider) {
          await GoogleSignin.signOut();
          throw new Error(
            "This email is registered with a password. Please sign in using email and password instead."
          );
        }
      }

      const idToken = result.data?.idToken;
      if (!idToken) throw new Error('No ID token returned from Google');

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      const firebaseUser = userCredential.user;
      const firebaseToken = await firebaseUser.getIdToken();
      await SecureStore.setItemAsync("firebaseToken", firebaseToken);

      const googleUser = result.data?.user;

      const userData: UserInfo = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: googleUser?.givenName || null,
        lastName: googleUser?.familyName || null,
        token: firebaseToken
      };

      setUser(userData);
      setGoogleLoggedIn(true);
      return { userData };

    } catch (error: any) {
      console.error("Verification Error:", error.message);
      await GoogleSignin.signOut();
      setUser(null);
      setGoogleLoggedIn(false);
      return { userData: null };
    }
  };


  const fetchSignInMethods = async (email: string) => {
    return await fetchSignInMethodsForEmail(auth, email);
  };

  const signInWithTemporaryToken = async (token: string) => {
    await signInWithCustomToken(auth, token);
  }

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const token = await userCredential.user.getIdToken();

    setEmail(email);

    return {
      user: userCredential.user,
      token,
    };
  };

  const signIn = async (email: string, password: string) => {
    setEmail(email);

    await signInWithEmailAndPassword(auth, email, password);
  };

  const googleSignIn = async (): Promise<{ userData: UserInfo }> => {
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      if (!idToken) throw new Error('No ID token returned from Google');

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      const firebaseUser = userCredential.user;
      const firebaseToken = await firebaseUser.getIdToken();
      await SecureStore.setItemAsync("firebaseToken", firebaseToken);
      const googleUser = result.data?.user;

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: googleUser?.givenName || null,
        lastName: googleUser?.familyName || null,
        token: firebaseToken
      });

      setEmail(email);

      const userData: UserInfo = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: googleUser?.givenName || null,
        lastName: googleUser?.familyName || null,
        token: firebaseToken,
      };

      return { userData };

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const googleSignUp = async (): Promise<{ userData: UserInfo }> => {
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      if (!idToken) throw new Error("No ID token returned from Google");

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;
      const firebaseToken = await firebaseUser.getIdToken();
      await SecureStore.setItemAsync("firebaseToken", firebaseToken);
      const googleUser = result.data?.user;

      console.log("SignUp" + firebaseUser.email);

      const userData: UserInfo = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: googleUser?.givenName || null,
        lastName: googleUser?.familyName || null,
        token: firebaseToken,
      };

      return { userData };

      } catch (error: any) {
        throw new Error(error.message);
      }
    };

  const logout = async () => {
    try {
      setUser(null);

      // Clear all auth-related SecureStore keys on logout
      const keysToClear = [
        "temp_user_info",
        "sso_temp_user_info",
        "signup_email",
        "verified_email",
        "signup_password",
        "signup_confirm_password",
        "firebaseToken",
        "fromGoogle",
      ];

      await Promise.all(keysToClear.map((key) => SecureStore.deleteItemAsync(key)));

      await GoogleSignin.signOut();
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        email,
        fetchSignInMethods,
        googleSignInAndVerify,
        signInWithTemporaryToken,
        signUp,
        signIn,
        googleSignIn,
        googleSignUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};