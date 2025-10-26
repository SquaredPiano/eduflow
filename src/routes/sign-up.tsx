import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function SignUpPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.location.href = "/api/auth/login?screen_hint=signup";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to signup...</p>
      </div>
    </div>
  );
}