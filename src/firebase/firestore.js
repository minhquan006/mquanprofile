import { getFirestore, doc } from "firebase/firestore";
import { app } from "./firebase.js";

export const db = getFirestore(app);
export const profileStatsRef = doc(db, "profile", "stats");
