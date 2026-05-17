import { useState } from "react";
import { SplitScreen } from "@/components/auth/SplitScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.forgetPassword({ email, redirectTo: "/reset-password" });
      nav("/check-inbox?mode=reset");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitScreen
      decorativeHeading="No worries, it happens."
      decorativeSubline="We'll send a reset link straight to your university inbox."
      image="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&h=1600&fit=crop&q=85"
      quote={{
        text: "Getting back in was easier than I expected. One email and I was back on my feed.",
        author: "Kofi M.",
        meta: "Engineering · UY1",
        avatar: "https://i.pravatar.cc/40?u=kofi",
      }}
    >
      <div className="space-y-6">
        <Link
          to="/signin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Mail className="h-7 w-7 text-primary" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-extrabold">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Enter your university email and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">University Email</Label>
            <Input
              type="email"
              placeholder="amara@uy1.cm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Remembered it?{" "}
          <Link to="/signin" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </SplitScreen>
  );
};

export default ForgotPassword;
