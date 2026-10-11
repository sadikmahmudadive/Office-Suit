import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/account-forms";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="max-w-xl space-y-8">
      <PageHeader
        title="Your account"
        description={user.role === "admin" ? "You're an admin of this workspace." : undefined}
      />
      <section>
        <h2 className="mb-3 text-lg font-semibold">Profile</h2>
        <ProfileForm name={user.name} email={user.email} />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Change password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
