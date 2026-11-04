import { redirect } from "next/navigation";

export default function AdminActiveOrdersRedirect() {
  redirect("/admin?tab=active_orders");
}

