import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate subscription process
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You have been subscribed to our newsletter",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-8 mb-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Stay Updated with Latest Game Releases
        </h2>
        <p className="text-indigo-100 mb-6">
          Subscribe to our newsletter and never miss out on new game releases, reviews, and exclusive offers.
        </p>
        <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={handleSubmit}>
          <Input 
            type="email" 
            placeholder="Enter your email" 
            className="px-4 py-3 rounded-lg flex-1 max-w-md dark:bg-white dark:text-gray-900 focus:ring-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            variant="secondary" 
            className="bg-white text-indigo-700 hover:bg-indigo-50" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
