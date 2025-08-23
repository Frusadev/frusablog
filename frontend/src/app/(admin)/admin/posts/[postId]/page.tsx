"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import Show from "@/components/wrappers/Show";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPost, updatePost, deletePost } from "@/lib/api/requests/post";
import { getAllPostSeries } from "@/lib/api/requests/post-series";
import SelectSeriesCommand from "@/components/ui/custom/SelectSeriesCommand";
import { getTags, createTag } from "@/lib/api/requests/tag";
import { uploadFile, type FileResource } from "@/lib/api/requests/file";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import { createPostSlug } from "@/lib/utils/slug";
import type { PostUpdateDTO } from "@/lib/api/dto/post";
import type { Tag } from "@/lib/api/dto/tag";
import type { PostSeries } from "@/lib/api/dto/post-series";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Eye,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PostEditPage() {
  const { postId } = useParams() as { postId: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [published, setPublished] = useState(false);
  const [archived, setArchived] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [seriesId, setSeriesId] = useState<string | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  // Fetch post data
  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });

  // Fetch available tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags({ limit: 100 }),
  });

  // Fetch available series for selection
  const {} = useQuery<PostSeries[]>({
    queryKey: ["series", 0, 100],
    queryFn: () => getAllPostSeries(0, 100),
    staleTime: 5 * 60 * 1000,
  });

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setDescription(post.description);
      setContent(post.content);
      setPublished(post.published);
      setArchived(post.archived);
      setFeatured(post.featured);
      setSelectedTags(post.tags || []);
      setSeriesId(post.series ?? null);

      if (post.cover) {
        const coverUrl = getResourceUrl(post.cover);
        if (coverUrl) {
          setCoverPreview(coverUrl);
        }
      }
    }
  }, [post]);

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(file, false),
    onSuccess: (fileResource: FileResource) => {
      toast.success("Cover image uploaded successfully");
      const coverUrl = getResourceUrl(fileResource.id);
      if (coverUrl) {
        setCoverPreview(coverUrl);
      }
    },
    onError: () => {
      toast.error("Failed to upload cover image");
    },
  });

  // File upload mutation for editor files
  const editorUploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(file, false),
    onSuccess: (fileResource: FileResource, file: File) => {
      // Remove from uploading list
      setUploadingFiles((prev) => prev.filter((name) => name !== file.name));

      // Insert link into editor at cursor position
      const fileUrl = `/files/${fileResource.id}`;
      const fileName = file.name;
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      let markdownLink = "";
      if (isImage) {
        markdownLink = `![${fileName}](${fileUrl})`;
      } else if (isVideo) {
        markdownLink = `<video controls width="100%">\n  <source src="${fileUrl}" type="${file.type}">\n  Your browser does not support the video tag.\n</video>`;
      } else {
        markdownLink = `[${fileName}](${fileUrl})`;
      }

      // Insert at the end of content for now (can be improved to insert at cursor)
      setContent((prev) => prev + "\n\n" + markdownLink);

      toast.success(`${fileName} uploaded successfully`);
    },
    onError: (file: File) => {
      setUploadingFiles((prev) => prev.filter((name) => name !== file.name));
      toast.error(`Failed to upload ${file.name}`);
    },
  });

  // Utility function to check if file type is supported
  const isFileTypeSupported = (file: File): boolean => {
    const supportedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ];
    return supportedTypes.includes(file.type);
  };

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const supportedFiles = files.filter(isFileTypeSupported);
      const unsupportedFiles = files.filter(
        (file) => !isFileTypeSupported(file),
      );

      if (unsupportedFiles.length > 0) {
        toast.error(
          `Unsupported file types: ${unsupportedFiles.map((f) => f.name).join(", ")}`,
        );
      }

      if (supportedFiles.length > 0) {
        // Add files to uploading list
        setUploadingFiles((prev) => [
          ...prev,
          ...supportedFiles.map((f) => f.name),
        ]);

        // Upload each file
        supportedFiles.forEach((file) => {
          editorUploadMutation.mutate(file);
        });
      }
    },
    [editorUploadMutation],
  );

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: (newTag: Tag) => {
      setSelectedTags((prev) => [...prev, newTag]);
      setNewTagName("");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success(`Tag "${newTag.name}" created and added`);
    },
    onError: () => {
      toast.error("Failed to create tag");
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: (data: PostUpdateDTO) => updatePost(data),
    onSuccess: () => {
      toast.success("Post updated successfully");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      if (post) {
        router.push(`/post/${createPostSlug(post.title, post.id)}`);
      }
    },
    onError: () => {
      toast.error("Failed to update post");
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/admin");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
  };

  const addTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate(newTagName.trim());
    }
  };

  const handleSave = async () => {
    if (!post) return;

    let coverId = post.cover;

    // Upload new cover if selected
    if (coverFile) {
      try {
        const fileResource = await uploadFile(coverFile, false);
        coverId = fileResource.id;
      } catch (error) {
        toast.error("Failed to upload cover image");
        console.error("Cover upload error:", error);
        return;
      }
    } else if (!coverPreview) {
      // Cover was removed
      coverId = "";
    }

    const updateData: PostUpdateDTO = {
      id: postId,
      title,
      description,
      cover: coverId || null,
      content,
      published,
      archived,
      featured,
      tag_ids: selectedTags.map((tag) => tag.id),
      series: seriesId || null,
    };

    updateMutation.mutate(updateData);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  if (isPostLoading) {
    return (
      <div className="min-h-full">
        <div className="flex justify-center py-20">
          <Spinner size="large" className="stroke-primary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-full">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl mb-2">Post Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The post you&apos;re trying to edit doesn&apos;t exist or you
              don&apos;t have permission to edit it.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Edit Post</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Make changes to your article
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            onClick={() =>
              post &&
              router.push(`/post/${createPostSlug(post.title, post.id)}`)
            }
            variant="outline"
            size="sm"
            className="flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            size="sm"
            className="flex items-center justify-center"
            disabled={deleteMutation.isPending}
          >
            <Show when={deleteMutation.isPending}>
              <Spinner size="small" className="stroke-background mr-2" />
            </Show>
            <Show when={!deleteMutation.isPending}>
              <Trash2 className="w-4 h-4 mr-2" />
            </Show>
            Delete
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            size="sm"
            className="flex items-center justify-center"
          >
            <Show when={updateMutation.isPending}>
              <Spinner size="small" className="stroke-background mr-2" />
            </Show>
            <Show when={!updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
            </Show>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your post..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Show when={!!coverPreview}>
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    onClick={removeCover}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Show>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                  id="cover-upload"
                />
                <Label
                  htmlFor="cover-upload"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted transition-colors",
                    uploadMutation.isPending &&
                      "opacity-50 pointer-events-none",
                  )}
                >
                  <Show when={uploadMutation.isPending}>
                    <Spinner size="small" className="stroke-current" />
                  </Show>
                  <Show when={!uploadMutation.isPending}>
                    <Upload className="w-4 h-4" />
                  </Show>
                  {coverPreview ? "Change Cover" : "Upload Cover"}
                </Label>
                <Show when={!!coverPreview}>
                  <Button onClick={removeCover} variant="outline" size="sm">
                    Remove Cover
                  </Button>
                </Show>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Markdown Content</Label>
                <div
                  className={`relative min-h-[400px] ${isDragging ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {/* Drag overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-10 rounded-lg border-2 border-dashed border-blue-300">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-blue-600 font-medium">
                          Drop files here to upload
                        </p>
                        <p className="text-blue-500 text-sm">
                          Supports: PNG, JPG, GIF, WebP, MP4, WebM, OGG
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload status */}
                  {uploadingFiles.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Spinner size="small" className="stroke-blue-600" />
                        <span className="text-sm text-blue-700">
                          Uploading {uploadingFiles.length} file(s):{" "}
                          {uploadingFiles.join(", ")}
                        </span>
                      </div>
                    </div>
                  )}

                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || "")}
                    preview="edit"
                    hideToolbar={false}
                    visibleDragbar={false}
                    textareaProps={{
                      placeholder: "Write your post content in Markdown...",
                      style: { fontSize: 14, lineHeight: 1.5 },
                    }}
                    height={400}
                  />

                  {/* Helper text */}
                  <p className="text-sm text-muted-foreground mt-2">
                    💡 <strong>Tip:</strong> Drag and drop images or videos
                    directly into the editor to upload them.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Series Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Series (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label>Assign to a series</Label>
              <SelectSeriesCommand value={seriesId} onChange={setSeriesId} />
            </CardContent>
          </Card>
          {/* Status Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this post visible to readers
                  </p>
                </div>
                <Switch checked={published} onCheckedChange={setPublished} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">
                    Highlight this post
                  </p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Archived</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide from main listings
                  </p>
                </div>
                <Switch checked={archived} onCheckedChange={setArchived} />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Tags */}
              <Show when={selectedTags.length > 0}>
                <div className="space-y-2">
                  <Label>Selected Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag.name}
                        <Button
                          onClick={() => removeTag(tag.id)}
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </Show>

              {/* Available Tags */}
              <div className="space-y-2">
                <Label>Available Tags</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableTags
                    .filter(
                      (tag) => !selectedTags.find((st) => st.id === tag.id),
                    )
                    .map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => addTag(tag)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Create New Tag */}
              <div className="space-y-2">
                <Label>Create New Tag</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                  <Button
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || createTagMutation.isPending}
                    size="sm"
                  >
                    <Show when={createTagMutation.isPending}>
                      <Spinner size="small" className="stroke-current" />
                    </Show>
                    <Show when={!createTagMutation.isPending}>
                      <Plus className="w-4 h-4" />
                    </Show>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author:</span>
                <span>{post.author.name || post.author.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Likes:</span>
                <span>{post.likes}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{title}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="destructive"
              disabled={deleteMutation.isPending}
            >
              <Show when={deleteMutation.isPending}>
                <Spinner size="small" className="stroke-background mr-2" />
              </Show>
              <Show when={!deleteMutation.isPending}>
                <Trash2 className="w-4 h-4 mr-2" />
              </Show>
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
