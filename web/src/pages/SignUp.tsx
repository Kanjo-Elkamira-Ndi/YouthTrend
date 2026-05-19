import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SplitScreen } from "@/components/auth/SplitScreen";
import { SocialRow, Divider } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LanguageToggle } from "@/components/common/Toggle";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, unwrap } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface CampusOption {
  id: string;
  name: string;
}

const SignUp = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [campusId, setCampusId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const { data: campusOptions = [] } = useQuery({
    queryKey: ["campuses"],
    queryFn: () => api.get("/campuses").then(unwrap) as Promise<CampusOption[]>,
  });

  const canSubmit = !!name && !!email && !!password && password === confirm && agreed && !loading;

  const socialSignIn = (provider: "google" | "facebook" | "apple" | "twitter") => {
    authClient.signIn.social({ provider, callbackURL: `${window.location.origin}/feed` });
  };

  const socialHandlers = {
    google: () => socialSignIn("google"),
    facebook: () => socialSignIn("facebook"),
    apple: () => socialSignIn("apple"),
    twitter: () => socialSignIn("twitter"),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const result = await authClient.signUp.email({ name, email, password });

      if (result.error) {
        toast.error(result.error.message || "Sign up failed");
        return;
      }

      await api.post("/auth/provision", { campusId: campusId || undefined });

      nav("/check-inbox?mode=verify");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitScreen
      decorativeHeading="Your campus, your voice."
      decorativeSubline="Join the platform built for Cameroonian students."
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <SocialRow handlers={socialHandlers} />
        <Divider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name">
            <Input
              placeholder="Amara Ngono"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>

          <Field label="University Email" hint="Use your .cm or campus email">
            <Input
              type="email"
              placeholder="amara@uy1.cm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Select Campus">
            <Select value={campusId} onValueChange={setCampusId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your campus" />
              </SelectTrigger>
              <SelectContent>
                {campusOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
                <SelectItem value="other">Other...</SelectItem>
              </SelectContent>
            </Select>
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
          </Field>

          <Field label="Confirm Password">
            <Input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Field>

          <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox className="mt-0.5" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
            I agree to the{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </label>

          <Button type="submit" disabled={!canSubmit} className="w-full h-11 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex justify-center pt-2">
          <LanguageToggle />
        </div>
      </div>
    </SplitScreen>
  );
};

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default SignUp;
