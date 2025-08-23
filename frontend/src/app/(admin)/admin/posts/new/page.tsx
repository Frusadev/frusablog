"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { createPost } from "@/lib/api/requests/post";
import { getAllPostSeries } from "@/lib/api/requests/post-series";
import SelectSeriesCommand from "@/components/ui/custom/SelectSeriesCommand";
import { getTags, createTag } from "@/lib/api/requests/tag";
import { uploadFile, type FileResource } from "@/lib/api/requests/file";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import type { PostCreationDTO } from "@/lib/api/dto/post";
import type { PostSeries } from "@/lib/api/dto/post-series";
import type { Tag } from "@/lib/api/dto/tag";
import {
  ArrowLeft,
  X,
  Plus,
  FileText,
  Sparkles,
  PlusCircle,
  Upload,
} from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(
    "# Your Post Title\n\nStart writing your content here...",
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [published, setPublished] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [seriesId, setSeriesId] = useState<string | null>(null);

  // Fetch available tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags({ limit: 100 }),
  });

  // Fetch available series (first 100 for selection)
  const {} = useQuery<PostSeries[]>({
    queryKey: ["series", 0, 100],
    queryFn: () => getAllPostSeries(0, 100),
    staleTime: 5 * 60 * 1000,
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
    onError: (error, file: File) => {
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

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: (data: PostCreationDTO) => createPost(data),
    onSuccess: (post, data) => {
      toast.success(
        `Post ${data.published ? "published" : "saved as draft"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push(`/admin/posts/${post.id}`);
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      // Create a local preview immediately
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file using the mutation
      uploadMutation.mutate(file);
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

  const handleSave = async (shouldPublish: boolean = published) => {
    if (!title.trim()) {
      toast.error("Post title is required");
      return;
    }

    if (!content.trim()) {
      toast.error("Post content is required");
      return;
    }

    let coverId = null;

    // If uploadMutation is still in progress, wait for it to complete
    if (uploadMutation.isPending && coverFile) {
      toast.info("Please wait while the cover image is being uploaded...");
      return;
    }

    // Use the uploaded file ID if available from the mutation
    if (uploadMutation.data) {
      coverId = uploadMutation.data.id;
    }

    const createData: PostCreationDTO = {
      title: title.trim(),
      description: description.trim(),
      cover: coverId,
      content: content.trim(),
      published: shouldPublish,
      tags: selectedTags,
      series: seriesId || null,
    };

    createMutation.mutate(createData);
  };

  const handleSaveAsDraft = () => handleSave(false);
  const handlePublish = () => handleSave(true);

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
            <h1 className="text-xl sm:text-2xl font-bold">Create New Post</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Write and publish your blog post
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            onClick={handleSaveAsDraft}
            disabled={createMutation.isPending}
            variant="outline"
            size="sm"
            className="flex items-center justify-center"
          >
            <Show when={createMutation.isPending}>
              <Spinner size="small" className="stroke-foreground mr-2" />
            </Show>
            <Show when={!createMutation.isPending}>
              <FileText className="w-4 h-4 mr-2" />
            </Show>
            Save as Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={createMutation.isPending}
            size="sm"
            className="flex items-center justify-center"
          >
            <Show when={createMutation.isPending}>
              <Spinner size="small" className="stroke-background mr-2" />
            </Show>
            <Show when={!createMutation.isPending}>
              <Sparkles className="w-4 h-4 mr-2" />
            </Show>
            Publish Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your post..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`relative ${isDragging ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
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

                <div data-color-mode="light" className="w-full">
                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || "")}
                    preview="edit"
                    height={400}
                    data-color-mode="light"
                  />
                </div>

                {/* Helper text */}
                <p className="text-sm text-muted-foreground mt-2">
                  💡 <strong>Tip:</strong> Drag and drop images or videos
                  directly into the editor to upload them.
                </p>
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
              <Label>Select a series for this post</Label>
              <SelectSeriesCommand value={seriesId} onChange={setSeriesId} />
              <p className="text-xs text-muted-foreground">
                You can create and manage series in the Series admin page
                (coming soon).
              </p>
            </CardContent>
          </Card>
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this post visible to readers
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <Show when={!!coverPreview}>
                <div className="relative mb-4">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    onClick={removeCover}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </Show>

              <div className="space-y-2">
                <Label htmlFor="cover">
                  {coverPreview ? "Change Cover" : "Upload Cover"}
                </Label>
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected tags */}
              <Show when={selectedTags.length > 0}>
                <div>
                  <Label>Selected Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTag(tag.id)}
                      >
                        {tag.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </Show>

              {/* Available tags */}
              <div>
                <Label>Available Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                  {availableTags
                    .filter(
                      (tag) =>
                        !selectedTags.find(
                          (selected) => selected.id === tag.id,
                        ),
                    )
                    .map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => addTag(tag)}
                      >
                        {tag.name}
                        <Plus className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                </div>
              </div>

              <Separator />

              {/* Create new tag */}
              <div>
                <Label>Create New Tag</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
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
                      <Spinner size="small" className="stroke-background" />
                    </Show>
                    <Show when={!createTagMutation.isPending}>
                      <PlusCircle className="w-4 h-4" />
                    </Show>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
