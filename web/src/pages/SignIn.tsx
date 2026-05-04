import { SplitScreen } from "@/components/auth/SplitScreen";
import { SocialRow, Divider } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/common/Toggle";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const SignIn = () => {
  const [show, setShow] = useState(false);
  const nav = useNavigate();

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

        <SocialRow />
        <Divider />

        <form
          onSubmit={(e) => { e.preventDefault(); nav("/feed"); }}
          className="space-y-4"
        >
          <Field label="Email Address">
            <Input type="email" placeholder="amara@uy1.cm" />
          </Field>

          <Field label="Password">
            <div className="relative">
              <Input type={show ? "text" : "password"} placeholder="••••••••" />
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

          <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex justify-center pt-2">
          <LanguageToggle />
        </div>
      </div>
    </SplitScreen>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}</Label>
    {children}
  </div>
);

export default SignIn;