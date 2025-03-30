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
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Game, insertGameSchema, genreEnum } from "@shared/schema";
import { formatDate, formatRating, capitalizeFirstLetter } from "@/lib/utils";
import { z } from "zod";
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Star, 
  StarHalf,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Extend the insertGameSchema for form validation
const formSchema = insertGameSchema.extend({
  // Add any additional validation or fields here
}).omit({ rating: true }); // Rating is calculated by the system

type FormData = z.infer<typeof formSchema>;

export default function GamesManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();
  
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  // Filter games based on search query
  const filteredGames = games?.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.developer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate games
  const paginatedGames = filteredGames?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = filteredGames ? Math.ceil(filteredGames.length / itemsPerPage) : 0;

  // Add new game mutation
  const addGameMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/games", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Game Added",
        description: "The game has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit game mutation
  const editGameMutation = useMutation({
    mutationFn: async (data: { id: number; game: Partial<Game> }) => {
      const res = await apiRequest("PATCH", `/api/games/${data.id}`, data.game);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Game Updated",
        description: "The game has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
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

  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/games/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Game Deleted",
        description: "The game has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
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

  // Form for adding a new game
  const addForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "action",
      developer: "",
      imageUrl: "",
      isFeatured: false,
      isTrending: false,
      releaseDate: new Date(),
    },
  });

  // Form for editing a game
  const editForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "action",
      developer: "",
      imageUrl: "",
      isFeatured: false,
      isTrending: false,
      releaseDate: new Date(),
    },
  });

  // Function to handle adding a new game
  const onAddSubmit = (data: FormData) => {
    addGameMutation.mutate(data);
  };

  // Function to handle editing a game
  const onEditSubmit = (data: FormData) => {
    if (selectedGame) {
      editGameMutation.mutate({
        id: selectedGame.id,
        game: data,
      });
    }
  };

  // Function to handle deleting a game
  const onDeleteConfirm = () => {
    if (selectedGame) {
      deleteGameMutation.mutate(selectedGame.id);
    }
  };

  // Function to set up the edit form with the selected game data
  const handleEditClick = (game: Game) => {
    setSelectedGame(game);
    editForm.reset({
      title: game.title,
      description: game.description,
      genre: game.genre,
      developer: game.developer || "",
      imageUrl: game.imageUrl || "",
      isFeatured: game.isFeatured || false,
      isTrending: game.isTrending || false,
      releaseDate: new Date(game.releaseDate || new Date()),
    });
    setIsEditDialogOpen(true);
  };

  // Function to set up the delete dialog
  const handleDeleteClick = (game: Game) => {
    setSelectedGame(game);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search games..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Game
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Game</DialogTitle>
              <DialogDescription>
                Fill out the form below to add a new game to the catalog.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter game title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter game description" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genreEnum.enumValues.map((genre) => (
                              <SelectItem key={genre} value={genre}>
                                {capitalizeFirstLetter(genre)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="developer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Developer</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image URL" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a URL to an image for the game.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            Mark as a featured game
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
                    control={addForm.control}
                    name="isTrending"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Trending</FormLabel>
                          <FormDescription>
                            Mark as a trending game
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
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addGameMutation.isPending}>
                    {addGameMutation.isPending ? "Adding..." : "Add Game"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Games Table */}
      <Card>
        <CardHeader>
          <CardTitle>Games Catalog</CardTitle>
          <CardDescription>
            Manage your games catalog - edit, delete, or view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedGames && paginatedGames.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={game.imageUrl || 'https://placehold.co/80x45?text=Game'}
                            alt={game.title}
                            className="h-10 w-16 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{game.title}</div>
                            <div className="text-xs text-gray-500">
                              {game.developer || 'Unknown developer'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {capitalizeFirstLetter(game.genre)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="mr-1">
                            {game.rating > 0 ? (
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  if (star <= Math.floor(game.rating / 2)) {
                                    return <Star key={star} className="text-yellow-500 h-3 w-3 fill-current" />;
                                  } else if (star - 0.5 <= game.rating / 2) {
                                    return <StarHalf key={star} className="text-yellow-500 h-3 w-3 fill-current" />;
                                  } else {
                                    return <Star key={star} className="text-gray-300 h-3 w-3" />;
                                  }
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Not rated</span>
                            )}
                          </div>
                          {game.rating > 0 && (
                            <span className="text-xs text-gray-500">{formatRating(game.rating)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {game.isFeatured && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              Featured
                            </Badge>
                          )}
                          {game.isTrending && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Trending
                            </Badge>
                          )}
                          {!game.isFeatured && !game.isTrending && (
                            <Badge variant="outline" className="text-gray-500">
                              Standard
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDate(game.createdAt)}
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
                            <DropdownMenuItem onClick={() => handleEditClick(game)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(game)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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
                  <p>No games found matching "{searchQuery}"</p>
                  <Button variant="link" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <p>No games available. Add a game to get started.</p>
              )}
            </div>
          )}
        </CardContent>
        {filteredGames && filteredGames.length > 0 && (
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {Math.min(itemsPerPage, filteredGames.length)} of {filteredGames.length} games
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

      {/* Edit Game Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogDescription>
              Update the game information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter game title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter game description" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genreEnum.enumValues.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {capitalizeFirstLetter(genre)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="developer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to an image for the game.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Mark as a featured game
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
                  control={editForm.control}
                  name="isTrending"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Trending</FormLabel>
                        <FormDescription>
                          Mark as a trending game
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
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editGameMutation.isPending}>
                  {editGameMutation.isPending ? "Saving..." : "Save Changes"}
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
              <span className="font-bold text-primary">{selectedGame?.title}</span>?
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
              disabled={deleteGameMutation.isPending}
            >
              {deleteGameMutation.isPending ? "Deleting..." : "Delete Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}