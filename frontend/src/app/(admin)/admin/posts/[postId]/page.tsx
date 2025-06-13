"use client";

import { useState, useEffect } from "react";
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
import { getPost, updatePost } from "@/lib/api/requests/post";
import { getTags, createTag } from "@/lib/api/requests/tag";
import { uploadFile, type FileResource } from "@/lib/api/requests/file";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import type { Post, PostUpdateDTO } from "@/lib/api/dto/post";
import type { Tag } from "@/lib/api/dto/tag";
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus,
  Eye,
  EyeOff,
  Star,
  Archive,
  Sparkles
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
  
  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: (newTag: Tag) => {
      setSelectedTags(prev => [...prev, newTag]);
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
      router.push(`/post/${postId}`);
    },
    onError: () => {
      toast.error("Failed to update post");
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
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };
  
  const removeTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId));
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
      cover: coverId || "",
      content,
      published,
      archived,
      featured,
    };
    
    updateMutation.mutate(updateData);
  };
  
  if (isPostLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-center py-20">
            <Spinner size="large" className="stroke-primary" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">Post Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The post you're trying to edit doesn't exist or you don't have permission to edit it.
              </p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Post</h1>
              <p className="text-muted-foreground">Make changes to your article</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(`/post/${postId}`)}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              size="sm"
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
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
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
                      uploadMutation.isPending && "opacity-50 pointer-events-none"
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
                  <div className="min-h-[400px]">
                    <MDEditor
                      value={content}
                      onChange={(val) => setContent(val || "")}
                      preview="edit"
                      hideToolbar={false}
                      visibleDragbar={false}
                      textareaProps={{
                        placeholder: "Write your post content in Markdown...",
                        style: { fontSize: 14, lineHeight: 1.5 }
                      }}
                      height={400}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
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
                  <Switch
                    checked={published}
                    onCheckedChange={setPublished}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Featured</Label>
                    <p className="text-sm text-muted-foreground">
                      Highlight this post
                    </p>
                  </div>
                  <Switch
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Archived</Label>
                    <p className="text-sm text-muted-foreground">
                      Hide from main listings
                    </p>
                  </div>
                  <Switch
                    checked={archived}
                    onCheckedChange={setArchived}
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
                      .filter(tag => !selectedTags.find(st => st.id === tag.id))
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
      </div>
    </div>
  );
}
