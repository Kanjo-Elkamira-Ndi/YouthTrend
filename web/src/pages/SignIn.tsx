import { useState } from "react";
import { SplitScreen } from "@/components/auth/SplitScreen";
import { SocialRow, Divider } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/common/Toggle";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { api, unwrap } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const PROVIDER_CALLBACK = "/feed";

const SignIn = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password });

      if (result.error?.code === "EMAIL_NOT_VERIFIED") {
        nav("/check-inbox?mode=verify");
        return;
      }

      if (result.error) {
        toast.error(result.error.message || "Sign in failed");
        return;
      }

      const session = await api.get("/auth/session").then(unwrap);

      if (!session.provisioned) {
        await api.post("/auth/provision", {});
      }

      refetch();
      nav("/feed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const socialSignIn = (provider: "google" | "facebook" | "apple" | "twitter") => {
    authClient.signIn.social({ provider, callbackURL: PROVIDER_CALLBACK });
  };

  const socialHandlers = {
    google: () => socialSignIn("google"),
    facebook: () => socialSignIn("facebook"),
    apple: () => socialSignIn("apple"),
    twitter: () => socialSignIn("twitter"),
  };

  return (
    <SplitScreen
      decorativeHeading="Welcome back."
      decorativeSubline="Your campus feed has been waiting for you."
      image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=1600&fit=crop&q=85"
      quote={{
        text: "YouthTrend is where I found out about everything happening on campus before anyone else.",
        author: "Amara K.",
        meta: "Computer Science · UB",
        avatar: "https://i.pravatar.cc/40?u=amara",
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <SocialRow handlers={socialHandlers} />
        <Divider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email Address">
            <Input
              type="email"
              placeholder="amara@uy1.cm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Password">
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </Field>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">
            {loading ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex justify-center pt-2">
          <LanguageToggle />
        </div>
      </div>
    </SplitScreen>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}</Label>
    {children}
  </div>
);

export default SignIn;
