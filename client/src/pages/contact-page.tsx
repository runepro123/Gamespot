import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  Phone, 
  Send, 
  HelpCircle, 
  AlertTriangle,
  ThumbsUp 
} from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-purple-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg max-w-3xl mx-auto opacity-90">
              Have questions, feedback, or need assistance? We'd love to hear from you!
            </p>
          </div>
        </div>
        
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Get In Touch</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">Email Us</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          support@topbestgames.com
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">Call Us</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">Location</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          123 Gaming Blvd, San Francisco, CA 94105
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white">FAQ</h2>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                        How do I create an account?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400">
                      Click the "Login" button in the top-right corner and select the "Register" tab to create your account.
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                        How do I submit a review?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400">
                      Navigate to any game page and scroll down to the reviews section. You'll need to be logged in to submit a review.
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                        I found incorrect information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400">
                      Please use the contact form to let us know about any inaccuracies you find, and we'll address them promptly.
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Your Email <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="How can we help you?"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Please provide details about your inquiry..."
                          rows={6}
                          required
                        />
                      </div>
                      
                      <div>
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <ThumbsUp className="mr-2 h-4 w-4 animate-pulse" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                {/* Map Placeholder */}
                <div className="mt-8 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 h-64 flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Interactive map would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}