import { redirect } from "next/navigation";

export default function NewInterviewPage() {
  redirect("/interviews?create=1");
}
