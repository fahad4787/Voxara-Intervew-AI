import {
  deleteLocalRecording,
  isLocalRecordingRef,
  saveLocalRecording,
} from "@/lib/interview/local-recording";

/*
 * Firebase Storage — re-enable after billing/card is set up.
 *
 * import {
 *   deleteObject,
 *   getDownloadURL,
 *   getStorage,
 *   ref,
 *   uploadBytes,
 * } from "firebase/storage";
 * import { getFirebaseApp } from "@/lib/firebase/client";
 *
 * function getClientStorage() {
 *   return getStorage(getFirebaseApp());
 * }
 *
 * function extensionForMime(type: string) {
 *   if (type.includes("mp4")) return "mp4";
 *   if (type.includes("mpeg") || type.includes("mp3")) return "mp3";
 *   return "webm";
 * }
 *
 * export async function uploadInterviewRecording(
 *   interviewId: string,
 *   blob: Blob,
 * ) {
 *   const ext = extensionForMime(blob.type || "audio/webm");
 *   const path = `interviews/${interviewId}/recording.${ext}`;
 *   const storageRef = ref(getClientStorage(), path);
 *
 *   await uploadBytes(storageRef, blob, {
 *     contentType: blob.type || "audio/webm",
 *     customMetadata: {
 *       interviewId,
 *       kind: "session-recording",
 *     },
 *   });
 *
 *   const url = await getDownloadURL(storageRef);
 *   return { url, path };
 * }
 *
 * export async function deleteInterviewRecording(path: string) {
 *   try {
 *     await deleteObject(ref(getClientStorage(), path));
 *   } catch {
 *     // File may already be missing.
 *   }
 * }
 */

export async function uploadInterviewRecording(
  interviewId: string,
  blob: Blob,
) {
  return saveLocalRecording(interviewId, blob);
}

export async function deleteInterviewRecording(
  path: string,
  interviewId?: string,
) {
  const id =
    interviewId ||
    (isLocalRecordingRef(path)
      ? path.replace(/^local:\/\//, "")
      : path.match(/^local\/([^/]+)\//)?.[1]);

  if (id) {
    await deleteLocalRecording(id);
  }
}
