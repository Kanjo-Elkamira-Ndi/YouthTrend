import { Link } from "react-router-dom";
import { ServerCrash } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/common/StarField";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ErrorPage = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <PublicNavbar />
    <section className="relative flex-1 flex items-center justify-center overflow-hidden">
      <StarField />
      <div className="container relative text-center py-20 max-w-2xl">
        <div className="relative inline-block">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-[8rem] md:text-[12rem] font-extrabold leading-none bg-gradient-to-br from-primary/30 via-primary/10 to-transparent bg-clip-text text-transparent"
          >
            500
          </motion.h1>
          <ServerCrash className="absolute inset-0 m-auto h-16 w-16 text-primary drop-shadow-lg" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mt-6">Something went wrong</h2>
        <p className="text-muted-foreground mt-2">
          An unexpected error occurred on our end. We're working to fix it.
        </p>

        <Accordion type="single" collapsible className="mt-6 text-left">
          <AccordionItem value="details">
            <AccordionTrigger>Show error details</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-muted rounded-xl p-4 font-mono text-xs whitespace-pre-wrap">
{`Error: Cannot read properties of undefined reading 'campus_id'
YouthTrend v1.0.0`}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          <Link to="/feed"><Button>Back to Feed</Button></Link>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          If this keeps happening, contact support at support@youthtrend.cm
        </p>
      </div>
    </section>
    <Footer />
  </div>
);

export default ErrorPage;
