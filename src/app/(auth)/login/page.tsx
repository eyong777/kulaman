import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 grid size-12 place-items-center rounded-lg bg-secondary text-primary">
          <ShieldCheck className="size-7" />
        </div>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access the Kulaman school reporting portal.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
