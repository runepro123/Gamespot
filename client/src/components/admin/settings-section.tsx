import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Mail, 
  Shield, 
  Server, 
  Save, 
  Loader2 
} from "lucide-react";

// Form schemas
const generalSettingsSchema = z.object({
  siteName: z.string().min(2, { message: "Site name must be at least 2 characters." }),
  siteDescription: z.string().min(10, { message: "Site description must be at least 10 characters." }),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo." }).optional().or(z.literal('')),
  faviconUrl: z.string().url({ message: "Please enter a valid URL for the favicon." }).optional().or(z.literal('')),
  featuredGamesCount: z.coerce.number().min(1).max(10)
});

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, { message: "SMTP host is required." }),
  smtpPort: z.coerce.number().min(1).max(65535),
  smtpUsername: z.string().min(1, { message: "SMTP username is required." }),
  smtpPassword: z.string().min(1, { message: "SMTP password is required." }),
  senderEmail: z.string().email({ message: "Please enter a valid email address." }),
  senderName: z.string().min(1, { message: "Sender name is required." })
});

const securitySettingsSchema = z.object({
  enableRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(true),
  autoApproveReviews: z.boolean().default(false),
  sessionTimeout: z.coerce.number().min(1).max(1440),
  maxLoginAttempts: z.coerce.number().min(1).max(10)
});

const advancedSettingsSchema = z.object({
  enableCache: z.boolean().default(true),
  cacheLifetime: z.coerce.number().min(1).max(1440),
  debugMode: z.boolean().default(false),
  apiRateLimit: z.coerce.number().min(1).max(1000)
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;
type AdvancedSettingsValues = z.infer<typeof advancedSettingsSchema>;

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Default form values
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "TopBestGames",
      siteDescription: "Your go-to platform for discovering and reviewing the best games across all genres.",
      logoUrl: "",
      faviconUrl: "",
      featuredGamesCount: 6
    },
  });

  const emailForm = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtpHost: "smtp.example.com",
      smtpPort: 587,
      smtpUsername: "notifications@example.com",
      smtpPassword: "********",
      senderEmail: "noreply@example.com",
      senderName: "TopBestGames"
    },
  });

  const securityForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      enableRegistration: true,
      requireEmailVerification: true,
      autoApproveReviews: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5
    },
  });

  const advancedForm = useForm<AdvancedSettingsValues>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: {
      enableCache: true,
      cacheLifetime: 60,
      debugMode: false,
      apiRateLimit: 100
    },
  });

  // Submit handlers for each form
  const onGeneralSubmit = (data: GeneralSettingsValues) => {
    setIsSaving(true);
    // Simulate API request
    setTimeout(() => {
      console.log("General settings saved:", data);
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your general settings have been updated successfully.",
      });
    }, 1000);
  };

  const onEmailSubmit = (data: EmailSettingsValues) => {
    setIsSaving(true);
    // Simulate API request
    setTimeout(() => {
      console.log("Email settings saved:", data);
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your email settings have been updated successfully.",
      });
    }, 1000);
  };

  const onSecuritySubmit = (data: SecuritySettingsValues) => {
    setIsSaving(true);
    // Simulate API request
    setTimeout(() => {
      console.log("Security settings saved:", data);
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your security settings have been updated successfully.",
      });
    }, 1000);
  };

  const onAdvancedSubmit = (data: AdvancedSettingsValues) => {
    setIsSaving(true);
    // Simulate API request
    setTimeout(() => {
      console.log("Advanced settings saved:", data);
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your advanced settings have been updated successfully.",
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Configure your website settings, email, security, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="general" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                <FormField
                  control={generalForm.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Your website name as it appears in the browser title and throughout the site.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generalForm.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        A brief description of your website for SEO and meta tags.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={generalForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to your website logo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generalForm.control}
                    name="faviconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/favicon.ico" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to your website favicon.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={generalForm.control}
                  name="featuredGamesCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Games Count</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of featured games to display on the homepage.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={isSaving || !generalForm.formState.isDirty}
                >
                  {isSaving && activeTab === "general" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-4">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={emailForm.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={emailForm.control}
                    name="smtpUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="smtpPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={emailForm.control}
                    name="senderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address to send from.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="senderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Name to display in the from field.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={isSaving || !emailForm.formState.isDirty}
                >
                  {isSaving && activeTab === "email" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Form {...securityForm}>
              <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="enableRegistration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">User Registration</FormLabel>
                          <FormDescription>
                            Allow new users to register on the site.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="requireEmailVerification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Verification</FormLabel>
                          <FormDescription>
                            Require users to verify their email before logging in.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="autoApproveReviews"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-approve Reviews</FormLabel>
                          <FormDescription>
                            Automatically approve new reviews without moderation.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={securityForm.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Time in minutes before user sessions expire.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="maxLoginAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Login Attempts</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Maximum failed login attempts before lockout.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={isSaving || !securityForm.formState.isDirty}
                >
                  {isSaving && activeTab === "security" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <Form {...advancedForm}>
              <form onSubmit={advancedForm.handleSubmit(onAdvancedSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={advancedForm.control}
                    name="enableCache"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Caching</FormLabel>
                          <FormDescription>
                            Cache database queries and API results for faster performance.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={advancedForm.control}
                    name="debugMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Debug Mode</FormLabel>
                          <FormDescription>
                            Enable detailed error reporting and logging for development.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={advancedForm.control}
                      name="cacheLifetime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cache Lifetime (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long to keep cached items before refreshing.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={advancedForm.control}
                      name="apiRateLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Rate Limit</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Maximum API requests per minute per user.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={isSaving || !advancedForm.formState.isDirty}
                >
                  {isSaving && activeTab === "advanced" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-gray-500">
        <div>Last updated: March 30, 2025</div>
        <div>Version 1.0.0</div>
      </CardFooter>
    </Card>
  );
}