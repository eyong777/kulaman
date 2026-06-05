import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthConfirmClient } from "@/components/auth-confirm-client";

export default function AuthConfirmPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirming account</CardTitle>
          <CardDescription>Please wait while your account invitation is verified.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthConfirmClient />
        </CardContent>
      </Card>
    </main>
  );
}
