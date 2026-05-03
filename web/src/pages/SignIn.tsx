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
      decorative={
        <div>
          <h2 className="text-3xl font-extrabold mb-6">Welcome back to YouthTrend.</h2>
          <blockquote className="border-l-4 border-primary-foreground/40 pl-5 text-lg leading-relaxed italic">
            "YouthTrend is where I found out about everything happening on campus before anyone else."
          </blockquote>
          <p className="mt-4 text-sm text-primary-foreground/80">— Amara K., University of Buea</p>
          <div className="mt-12 grid grid-cols-3 gap-3 max-w-sm">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-background/10 backdrop-blur" />
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </p>
        </div>

        <SocialRow />
        <Divider />

        <form onSubmit={(e) => { e.preventDefault(); nav("/feed"); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Email Address</Label>
            <Input type="email" placeholder="you@uy1.cm" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Password</Label>
              <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Input type={show ? "text" : "password"} placeholder="••••••••" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex justify-center pt-2"><LanguageToggle /></div>
      </div>
    </SplitScreen>
  );
};

export default SignIn;
