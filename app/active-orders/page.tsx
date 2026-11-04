import { redirect } from "next/navigation";

export default function ActiveOrdersPageRedirect() {
  redirect("/orders?tab=active");
}

