import { getFirebaseIdToken } from "@/lib/firebaseAuth";
import { getAuth } from "firebase/auth";

jest.mock("firebase/auth", () => {
  const mockUser = {
    getIdToken: jest.fn(async (_forceRefresh?: boolean) => "mock-firebase-token"),
  };

  const mockAuth = { currentUser: mockUser };

  return {
    getAuth: jest.fn(() => mockAuth),
  };
});

it("tokenToUse and getFirebaseIdToken return the same token", async () => {
  const auth = getAuth(); 

  const tokenToUse = await auth.currentUser?.getIdToken(true);
  const helperToken = await getFirebaseIdToken();

  expect(tokenToUse).toBe("mock-firebase-token");
  expect(helperToken).toBe("mock-firebase-token");
  expect(tokenToUse).toBe(helperToken);
});

it("prints tokens for debug", async () => {
  const tokenToUse = await getAuth().currentUser?.getIdToken(true);
  const helperToken = await getFirebaseIdToken();

  console.log({ tokenToUse, helperToken });
  expect(true).toBe(true);
});