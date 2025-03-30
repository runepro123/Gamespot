import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { z } from "zod";
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserIcon,
  ShieldCheck,
  ShieldX
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";

// Form schema for editing users
const userEditFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().optional(),
  avatar: z.string().optional(),
  isAdmin: z.boolean().default(false),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal('')),
});

type UserEditFormValues = z.infer<typeof userEditFormSchema>;

export default function UsersManagement() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Paginate users
  const paginatedUsers = filteredUsers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = filteredUsers ? Math.ceil(filteredUsers.length / itemsPerPage) : 0;

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async (data: { id: number; user: UserEditFormValues }) => {
      const res = await apiRequest("PATCH", `/api/users/${data.id}`, data.user);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "The user has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for editing a user
  const editForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      avatar: "",
      isAdmin: false,
      password: "",
    },
  });

  // Function to handle editing a user
  const onEditSubmit = (data: UserEditFormValues) => {
    if (selectedUser) {
      // If password is empty, remove it from the request
      const userData = { ...data };
      if (!userData.password) {
        delete userData.password;
      }
      
      editUserMutation.mutate({
        id: selectedUser.id,
        user: userData,
      });
    }
  };

  // Function to handle deleting a user
  const onDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Function to set up the edit form with the selected user data
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      fullName: user.fullName || "",
      avatar: user.avatar || "",
      isAdmin: user.isAdmin || false,
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  // Function to set up the delete dialog
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Get user initials for avatar fallback
  const getUserInitials = (user: User) => {
    if (user.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts - edit roles, reset passwords, or delete accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedUsers && paginatedUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar || ''} alt={user.username} />
                            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.fullName || user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-500 bg-green-50 dark:bg-green-900/20">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditClick(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            {currentUser?.id !== user.id && (
                              <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? (
                <>
                  <p>No users found matching "{searchQuery}"</p>
                  <Button variant="link" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <p>No users available.</p>
              )}
            </div>
          )}
        </CardContent>
        {filteredUsers && filteredUsers.length > 0 && (
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {Math.min(itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => 
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user information. Leave the password field blank to keep the current password.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter avatar URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to an avatar image for this user.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter new password" type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank to keep current password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Admin Privileges</FormLabel>
                      <FormDescription>
                        Grant administrative access to this user
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editUserMutation.isPending}>
                  {editUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-primary">{selectedUser?.username}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}