import {
  collection,
  getDocs,
  query,
  where,
  or,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

export const globalSearch = async (searchTerm, limitCount = 10) => {
  if (!searchTerm || searchTerm.length < 2) return { projects: [], people: [], needs: [] };

  const normalized = searchTerm.toLowerCase().trim();
  const results = { projects: [], people: [], needs: [] };

  const projectsSnap = await getDocs(query(
    collection(db, "projects"),
    or(
      where("title", ">=", normalized),
      where("title", ">=", normalized.charAt(0).toUpperCase() + normalized.slice(1)),
      where("title", ">=", normalized.toUpperCase())
    ),
    orderBy("title"),
    limit(limitCount)
  ));
  results.projects = projectsSnap.docs
    .map((d) => ({ id: d.id, type: "project", ...d.data() }))
    .filter((p) => p.title?.toLowerCase().includes(normalized));

  const usersSnap = await getDocs(query(
    collection(db, "users"),
    or(
      where("displayName", ">=", normalized),
      where("displayName", ">=", normalized.charAt(0).toUpperCase() + normalized.slice(1))
    ),
    orderBy("displayName"),
    limit(limitCount)
  ));
  results.people = usersSnap.docs
    .map((d) => ({ uid: d.id, type: "person", ...d.data() }))
    .filter((u) => u.displayName?.toLowerCase().includes(normalized));

  const needsSnap = await getDocs(query(
    collection(db, "needs"),
    or(
      where("title", ">=", normalized),
      where("title", ">=", normalized.charAt(0).toUpperCase() + normalized.slice(1))
    ),
    orderBy("title"),
    limit(limitCount)
  ));
  results.needs = needsSnap.docs
    .map((d) => ({ id: d.id, type: "need", ...d.data() }))
    .filter((n) => n.title?.toLowerCase().includes(normalized));

  return results;
};