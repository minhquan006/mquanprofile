import { doc, getDoc, increment, onSnapshot, runTransaction, setDoc } from "firebase/firestore";
import { db, profileStatsRef } from "../firebase/firestore.js";

const likedStorageKey = "profile:stats:liked";
const clientIdStorageKey = "profile:stats:clientId";
const likesCollection = "profileLikes";

const state = {
  likes: 0,
  views: 0,
  pendingLikes: 0
};

function getClientId() {
  const current = localStorage.getItem(clientIdStorageKey);
  if (current) return current;

  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(clientIdStorageKey, id);
  return id;
}

function likedRef() {
  return doc(db, likesCollection, getClientId());
}

function hasLiked() {
  return localStorage.getItem(likedStorageKey) === "1";
}

function setLiked(value) {
  localStorage.setItem(likedStorageKey, value ? "1" : "0");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function renderStats({ likeEl, viewEl }) {
  if (likeEl) likeEl.textContent = formatNumber(state.likes + state.pendingLikes);
  if (viewEl) viewEl.textContent = formatNumber(state.views);
}

function renderLikedState({ likeButton }) {
  likeButton?.classList.toggle("active", hasLiked());
  likeButton?.setAttribute("aria-pressed", hasLiked() ? "true" : "false");
}

async function ensureStatsDocument() {
  const snapshot = await getDoc(profileStatsRef);
  if (snapshot.exists()) return;

  await setDoc(profileStatsRef, { likes: 0, views: 0 }, { merge: true });
}

async function countView() {
  await setDoc(profileStatsRef, { views: increment(1) }, { merge: true });
}

async function likeProfile(elements) {
  if (hasLiked()) return;

  setLiked(true);
  state.pendingLikes += 1;
  renderStats(elements);
  renderLikedState(elements);

  let didCreateLike = false;

  try {
    await runTransaction(db, async transaction => {
      const likedSnapshot = await transaction.get(likedRef());
      if (likedSnapshot.exists()) return;

      didCreateLike = true;
      transaction.set(likedRef(), {
        liked: true,
        likedAt: new Date().toISOString()
      });
      transaction.set(profileStatsRef, { likes: increment(1) }, { merge: true });
    });

    if (!didCreateLike) {
      state.pendingLikes = Math.max(0, state.pendingLikes - 1);
      renderStats(elements);
    }
  } catch (error) {
    setLiked(false);
    state.pendingLikes = Math.max(0, state.pendingLikes - 1);
    renderStats(elements);
    renderLikedState(elements);
    console.error("Unable to update likes", error);
  }
}

export async function initProfileCounters() {
  const elements = {
    likeButton: document.querySelector("[data-like-button]"),
    likeEl: document.querySelector("[data-like-count]"),
    viewEl: document.querySelector("[data-view-count]")
  };

  if (!elements.likeEl || !elements.viewEl) return;

  renderLikedState(elements);

  try {
    const likedSnapshot = await getDoc(likedRef());
    if (likedSnapshot.exists()) {
      setLiked(true);
      renderLikedState(elements);
    } else if (hasLiked()) {
      await setDoc(likedRef(), {
        liked: true,
        likedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Unable to load liked state", error);
  }

  elements.likeButton?.addEventListener("click", () => likeProfile(elements));
  elements.likeButton?.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    likeProfile(elements);
  });

  onSnapshot(profileStatsRef, snapshot => {
    const data = snapshot.data() || {};
    const nextLikes = Number(data.likes || 0);
    const acknowledgedLikes = Math.max(0, nextLikes - state.likes);

    state.likes = nextLikes;
    state.views = Number(data.views || 0);
    state.pendingLikes = Math.max(0, state.pendingLikes - acknowledgedLikes);
    renderStats(elements);
  });

  try {
    await ensureStatsDocument();
  } catch (error) {
    console.error("Unable to ensure profile stats document", error);
  }

  try {
    await countView();
  } catch (error) {
    console.error("Unable to count profile view", error);
  }
}
