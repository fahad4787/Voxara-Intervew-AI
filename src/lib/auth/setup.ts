import { isAdminConfigured, getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

const SETUP_DOC = "meta/setup";

export async function isSetupComplete(): Promise<boolean> {
  if (!isAdminConfigured()) {
    return false;
  }

  const setup = await getAdminDb().doc(SETUP_DOC).get();
  if (setup.exists && setup.data()?.complete === true) {
    return true;
  }

  const result = await getAdminAuth().listUsers(1);
  return result.users.length > 0;
}

export async function markSetupComplete(ownerId: string) {
  await getAdminDb()
    .doc(SETUP_DOC)
    .set(
      {
        complete: true,
        ownerId,
        completedAt: new Date().toISOString(),
      },
      { merge: true },
    );
}
