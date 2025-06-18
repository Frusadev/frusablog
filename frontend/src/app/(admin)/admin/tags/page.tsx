"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import Show from "@/components/wrappers/Show";
import { getTags, createTag, deleteTag } from "@/lib/api/requests/tag";
import type { Tag } from "@/lib/api/dto/tag";
import { 
  Plus,
  Tag as TagIcon,
  Hash,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TagsPage() {
  const queryClient = useQueryClient();
  const [newTagName, setNewTagName] = useState("");

  // Fetch tags
  const { data: tags = [], isLoading, error } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags({ limit: 200 }),
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: (newTag: Tag) => {
      setNewTagName("");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success(`Tag "${newTag.name}" created successfully`);
    },
    onError: () => {
      toast.error("Failed to create tag");
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: (tagId: string) => deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete tag");
    },
  });

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate(newTagName.trim());
    }
  };

  const handleDeleteTag = (tagId: string) => {
    deleteTagMutation.mutate(tagId);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">Error Loading Tags</h2>
        <p className="text-muted-foreground">Failed to load tags. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-lg sm:text-xl">Tag Management</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">Total: {tags.length}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Categories
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Create New Tag */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Plus className="w-4 h-4" />
                Create New Tag
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tagName">Tag Name</Label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name..."
                  className="mt-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTag();
                    }
                  }}
                />
              </div>
              
              <Button
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || createTagMutation.isPending}
                className="w-full"
              >
                <Show when={createTagMutation.isPending}>
                  <Spinner size="small" className="stroke-background mr-2" />
                </Show>
                <Show when={!createTagMutation.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                </Show>
                Create Tag
              </Button>
            </CardContent>
          </Card>

          {/* Existing Tags */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Existing Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <Show when={isLoading}>
                  <div className="flex justify-center py-8">
                    <Spinner size="large" className="stroke-primary" />
                  </div>
                </Show>

                <Show when={!isLoading && tags.length === 0}>
                  <div className="flex flex-col items-center justify-center py-12">
                    <TagIcon className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tags Yet</h3>
                    <p className="text-muted-foreground text-center">
                      Create your first tag to start organizing your content.
                    </p>
                  </div>
                </Show>

                <Show when={!isLoading && tags.length > 0}>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="flex items-center gap-2 text-sm px-3 py-2"
                        >
                          <Hash className="w-3 h-3" />
                          <span className="break-all">{tag.name}</span>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the tag &quot;{tag.name}&quot;? 
                                  This action cannot be undone and will remove this tag 
                                  from all associated posts.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTag(tag.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  <Show when={deleteTagMutation.isPending}>
                                    <Spinner size="small" className="stroke-background mr-2" />
                                  </Show>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Show>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
