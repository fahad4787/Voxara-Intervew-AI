import type { InterviewSession } from "@/types/interview";
import { getAdminDb } from "@/lib/firebase/admin";

const INTERVIEWS = "interviews";
const TOKENS = "interviewTokens";

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const interviewStore = {
  async list(ownerId?: string): Promise<InterviewSession[]> {
    const db = getAdminDb();
    const snap = ownerId
      ? await db.collection(INTERVIEWS).where("ownerId", "==", ownerId).get()
      : await db.collection(INTERVIEWS).get();

    return snap.docs
      .map((item) => item.data() as InterviewSession)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },

  async getById(id: string): Promise<InterviewSession | null> {
    const snap = await getAdminDb().collection(INTERVIEWS).doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as InterviewSession;
  },

  async getByToken(token: string): Promise<InterviewSession | null> {
    const db = getAdminDb();
    const tokenSnap = await db.collection(TOKENS).doc(token).get();
    if (tokenSnap.exists) {
      const interviewId = tokenSnap.data()?.interviewId as string | undefined;
      if (interviewId) return this.getById(interviewId);
    }

    const fallback = await db
      .collection(INTERVIEWS)
      .where("token", "==", token)
      .limit(1)
      .get();
    if (fallback.empty) return null;
    return fallback.docs[0]!.data() as InterviewSession;
  },

  async create(session: InterviewSession): Promise<InterviewSession> {
    const db = getAdminDb();
    const payload = stripUndefined(
      session as unknown as Record<string, unknown>,
    );
    await db.collection(INTERVIEWS).doc(session.id).set(payload);
    await db.collection(TOKENS).doc(session.token).set({
      interviewId: session.id,
      ownerId: session.ownerId ?? null,
    });
    return session;
  },

  async update(
    id: string,
    updater: (current: InterviewSession) => InterviewSession,
  ): Promise<InterviewSession> {
    const db = getAdminDb();
    const ref = db.collection(INTERVIEWS).doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new Error(`Interview ${id} not found`);
    }

    const current = snap.data() as InterviewSession;
    const updated = updater(current);
    const payload = stripUndefined(
      updated as unknown as Record<string, unknown>,
    );
    await ref.set(payload);
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const db = getAdminDb();
    const ref = db.collection(INTERVIEWS).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return false;
    const token = (snap.data() as InterviewSession).token;
    await ref.delete();
    if (token) {
      await db.collection(TOKENS).doc(token).delete();
    }
    return true;
  },
};
