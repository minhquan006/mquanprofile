import { getAuth, signInAnonymously } from "firebase/auth";
import { app } from "./firebase.js";

export const auth = getAuth(app);

export async function ensureAnonymousUser() {
  return auth.currentUser || (await signInAnonymously(auth)).user;
}
