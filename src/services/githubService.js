import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth, githubProvider } from "./firebase";
import { createUserDoc } from "./userService";

const OWNER = "ankan-web";
const REPO = "projectcollab";
const BASE = "https://api.github.com";

export const getToken = () => sessionStorage.getItem("github_access_token");

export const isConnected = () => !!getToken();

export const connectGithub = async () => {
  const result = await signInWithPopup(auth, githubProvider);
  const credential = GithubAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken || null;
  if (token) sessionStorage.setItem("github_access_token", token);
  await createUserDoc(result.user, token);
  return token;
};

export const getRepoStars = async () => {
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.stargazers_count || 0;
};

export const isRepoStarred = async () => {
  const token = getToken();
  if (!token) return false;
  const res = await fetch(`${BASE}/user/starred/${OWNER}/${REPO}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status === 204;
};

export const setRepoStarred = async (starred) => {
  const token = getToken();
  if (!token) throw new Error("Sign in with GitHub to star this repository.");
  const res = await fetch(`${BASE}/user/starred/${OWNER}/${REPO}`, {
    method: starred ? "PUT" : "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to update star on GitHub.");
  }
};

export const getRepoUrl = () => `https://github.com/${OWNER}/${REPO}`;
