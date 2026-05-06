import { Link } from "react-router-dom";
import { MapPinOff } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/common/StarField";

const NotFound = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <PublicNavbar />
    <section className="relative flex-1 flex items-center justify-center overflow-hidden">
      <StarField />
      <div className="container relative text-center py-20">
        <div className="relative inline-block">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-[8rem] md:text-[12rem] font-extrabold leading-none bg-gradient-to-br from-primary/30 via-primary/10 to-transparent bg-clip-text text-transparent"
          >
            404
          </motion.h1>
          <MapPinOff className="absolute inset-0 m-auto h-16 w-16 text-primary drop-shadow-lg" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mt-6">Lost on campus?</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={() => window.history.back()}>← Go Back</Button>
          <Link to="/feed"><Button>Back to Feed</Button></Link>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default NotFound;
