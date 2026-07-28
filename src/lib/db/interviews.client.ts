import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { InterviewSession } from "@/types/interview";

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function saveInterviewClient(session: InterviewSession) {
  const db = getClientDb();
  const payload = stripUndefined(
    session as unknown as Record<string, unknown>,
  );

  await setDoc(doc(db, "interviews", session.id), payload);

  // Token docs are create-only in rules — never overwrite an existing mapping.
  const tokenRef = doc(db, "interviewTokens", session.token);
  const tokenSnap = await getDoc(tokenRef);
  if (!tokenSnap.exists()) {
    await setDoc(tokenRef, {
      interviewId: session.id,
      ownerId: session.ownerId ?? null,
    });
  }

  return session;
}

export async function deleteInterviewClient(session: InterviewSession) {
  const db = getClientDb();
  await deleteDoc(doc(db, "interviews", session.id));
  if (session.token) {
    try {
      await deleteDoc(doc(db, "interviewTokens", session.token));
    } catch {
      // Token doc may already be missing.
    }
  }
}

export async function listOwnerInterviewsClient(ownerId: string) {
  const snap = await getDocs(
    query(
      collection(getClientDb(), "interviews"),
      where("ownerId", "==", ownerId),
    ),
  );

  return snap.docs
    .map((item) => item.data() as InterviewSession)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getInterviewClient(id: string) {
  const snap = await getDoc(doc(getClientDb(), "interviews", id));
  if (!snap.exists()) return null;
  return snap.data() as InterviewSession;
}

export async function getInterviewByTokenClient(token: string) {
  const db = getClientDb();
  const tokenSnap = await getDoc(doc(db, "interviewTokens", token));
  if (tokenSnap.exists()) {
    const interviewId = tokenSnap.data()?.interviewId as string | undefined;
    if (interviewId) return getInterviewClient(interviewId);
  }

  const fallback = await getDocs(
    query(collection(db, "interviews"), where("token", "==", token)),
  );
  if (fallback.empty) return null;
  return fallback.docs[0]!.data() as InterviewSession;
}
