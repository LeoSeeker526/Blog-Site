"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
    >
      <LogOut className="w-4 h-4 mr-2" />
      {logout.isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
