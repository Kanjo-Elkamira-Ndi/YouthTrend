import { SplitScreen } from "@/components/auth/SplitScreen";
import { SocialRow, Divider } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageToggle } from "@/components/common/Toggle";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { campuses } from "@/mock";

const SignUp = () => {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  return (
    <SplitScreen
      decorative={
        <div>
          <h2 className="text-3xl font-extrabold mb-2">Your campus, your voice.</h2>
          <p className="text-primary-foreground/80 mb-8">Join the platform built for Cameroonian students.</p>
          <div className="relative h-72">
            {[0, 1, 2].map((i) => (
              <div key={i} className="absolute inset-x-0 bg-card/95 text-card-foreground rounded-2xl p-4 shadow-xl"
                style={{ top: `${i * 36}px`, transform: `rotate(${(i - 1) * 3}deg)`, zIndex: 3 - i }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full bg-muted" />
                  <div>
                    <div className="text-xs font-semibold">Student {i + 1}</div>
                    <div className="text-[10px] text-muted-foreground">UY1 · 2h ago</div>
                  </div>
                </div>
                <div className="text-sm font-bold">Sample campus story #{i + 1}</div>
                <div className="text-xs text-muted-foreground mt-1">A quick preview of what's trending right now.</div>
              </div>
            ))}
          </div>
          <div className="mt-12 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/10 backdrop-blur text-sm">
            ✨ 2,400+ students · 3 campuses · One platform.
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Already have an account? <Link to="/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <SocialRow />
        <Divider />

        <form onSubmit={(e) => { e.preventDefault(); nav("/feed"); }} className="space-y-4">
          <Field label="Full Name"><Input placeholder="Amara Ngono" /></Field>
          <Field label="University Email" hint="Use your .cm or campus email">
            <Input type="email" placeholder="amara@uy1.cm" />
          </Field>
          <Field label="Select Campus">
            <Select>
              <SelectTrigger><SelectValue placeholder="Choose your campus" /></SelectTrigger>
              <SelectContent>
                {campuses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                <SelectItem value="other">Other...</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Password">
            <div className="relative">
              <Input type={show ? "text" : "password"} placeholder="••••••••" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password"><Input type="password" placeholder="••••••••" /></Field>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox className="mt-0.5" /> I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </label>
          <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
            Create Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex justify-center pt-2"><LanguageToggle /></div>
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
