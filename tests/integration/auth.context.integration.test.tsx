import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";

const mockCheckProviders = jest.fn();
const mockCheckEmail = jest.fn();
const mockUseFetch = jest.fn((url: string) => {
  if (url === "/api/auth/providers") {
    return { refetch: mockCheckProviders };
  }
  return { refetch: mockCheckEmail };
});

const mockGoogleSignIn = jest.fn();
const mockGoogleSignOut = jest.fn();
const mockGoogleHasPlayServices = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockSignInWithCredential = jest.fn();
const mockSecureGetItem = jest.fn();
const mockSecureSetItem = jest.fn();
const mockSecureDeleteItem = jest.fn();
const mockFirebaseSignOut = jest.fn();

jest.mock("../../hooks/useFetch", () => ({
  __esModule: true,
  default: (url: string) => mockUseFetch(url),
}));

jest.mock("../../firebase", () => ({
  auth: {},
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: () => mockGoogleHasPlayServices(),
    signIn: () => mockGoogleSignIn(),
    signOut: () => mockGoogleSignOut(),
  },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: (...args: any[]) => mockSecureGetItem(...args),
  setItemAsync: (...args: any[]) => mockSecureSetItem(...args),
  deleteItemAsync: (...args: any[]) => mockSecureDeleteItem(...args),
}));

jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: {
    credential: jest.fn(() => ({ provider: "google" })),
  },
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  signInWithCredential: (...args: any[]) => mockSignInWithCredential(...args),
  fetchSignInMethodsForEmail: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithCustomToken: jest.fn(),
  signOut: (...args: any[]) => mockFirebaseSignOut(...args),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockSecureGetItem.mockResolvedValue(null);
    mockGoogleHasPlayServices.mockResolvedValue(true);

    mockOnAuthStateChanged.mockImplementation(
      (_auth: any, callback: Function) => {
        callback(null);
        return jest.fn();
      },
    );
  });

  it("hydrates user from onAuthStateChanged", async () => {
    const firebaseUser = {
      uid: "uid-1",
      email: "user@example.com",
      displayName: "Juan DelaCruz",
      getIdToken: jest.fn().mockResolvedValue("firebase-token"),
    };

    mockSecureGetItem.mockImplementation(async (key: string) => {
      if (key === "forgotPasswordInProgress") {
        return "false";
      }
      return null;
    });

    mockOnAuthStateChanged.mockImplementation(
      (_auth: any, callback: Function) => {
        callback(firebaseUser);
        return jest.fn();
      },
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.uid).toBe("uid-1");
      expect(result.current.user?.token).toBe("firebase-token");
    });
  });

  it("googleSignInAndVerify checks email and signs in", async () => {
    const firebaseUser = {
      uid: "uid-2",
      email: "test@example.com",
      displayName: "Test User",
      getIdToken: jest.fn().mockResolvedValue("token-2"),
    };

    mockCheckEmail.mockResolvedValue({ data: { available: true } });
    mockGoogleSignIn.mockResolvedValue({
      data: {
        idToken: "google-id-token",
        user: {
          email: "test@example.com",
          givenName: "Test",
          familyName: "User",
        },
      },
    });
    mockSignInWithCredential.mockResolvedValue({ user: firebaseUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.googleSignInAndVerify();
    });

    expect(mockCheckEmail).toHaveBeenCalledWith({
      params: { email: "test@example.com" },
    });
    expect(mockSecureSetItem).toHaveBeenCalledWith("firebaseToken", "token-2");
    expect(response.userData?.uid).toBe("uid-2");
  });

  it("logout clears secure store and signs out providers", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSecureDeleteItem).toHaveBeenCalled();
    expect(mockGoogleSignOut).toHaveBeenCalled();
    expect(mockFirebaseSignOut).toHaveBeenCalled();
  });
});
