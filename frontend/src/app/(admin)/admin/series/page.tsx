"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPostSeries, getAllPostSeries, deletePostSeries } from "@/lib/api/requests/post-series";
import type { PostSeries, PostSeriesCreationDTO } from "@/lib/api/dto/post-series";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { uploadFile, type FileResource } from "@/lib/api/requests/file";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import Show from "@/components/wrappers/Show";
import { X } from "lucide-react";

export default function AdminSeriesPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const { data: series = [] } = useQuery<PostSeries[]>({
    queryKey: ["series", 0, 100],
    queryFn: () => getAllPostSeries(0, 100),
  });

  const createMutation = useMutation({
    mutationFn: (data: PostSeriesCreationDTO) => createPostSeries(data),
    onSuccess: () => {
      toast.success("Series created");
      setTitle("");
      setDescription("");
      setCover(null);
      setCoverPreview("");
      queryClient.invalidateQueries({ queryKey: ["series"] });
    },
    onError: () => toast.error("Failed to create series"),
  });

  // Cover upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(file, false),
    onSuccess: (fileResource: FileResource) => {
      setCover(fileResource.id);
      const url = getResourceUrl(fileResource.id);
      if (url) setCoverPreview(url);
      toast.success("Cover uploaded");
    },
    onError: () => toast.error("Failed to upload cover"),
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // show local preview immediately
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
      uploadMutation.mutate(file);
    }
  };

  const removeCover = () => {
    setCover(null);
    setCoverPreview("");
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    createMutation.mutate({ title: title.trim(), description: description.trim() || undefined, cover: cover || undefined });
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Series</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          {/* Cover uploader */}
          <div>
            <Label>Cover (optional)</Label>
            <Show when={!!coverPreview}>
              <div className="relative mb-2">
                <img src={coverPreview} alt="Series cover" className="w-full h-32 object-cover rounded-md" />
                <Button onClick={removeCover} variant="destructive" size="sm" className="absolute top-2 right-2">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </Show>
            <Input id="cover" type="file" accept="image/*" onChange={handleCoverChange} />
            <p className="text-xs text-muted-foreground mt-1">Or paste a resource ID below</p>
            <Input
              placeholder="Resource UUID"
              value={cover ?? ""}
              onChange={(e) => {
                const id = e.target.value || null;
                setCover(id);
                const url = id ? getResourceUrl(id) : "";
                setCoverPreview(url || "");
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cover">Cover Resource ID (optional)</Label>
            {/* Deprecated simple input kept for backward compatibility in label above; input moved to combined uploader */}
          </div>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Series</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {series.map((s) => (
            <div key={s.id} className="flex items-center justify-between border rounded-md p-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-sm text-muted-foreground truncate">{s.description}</div>
              </div>
              <Button variant="destructive" size="sm" onClick={async () => {
                try {
                  await deletePostSeries(s.id);
                  queryClient.invalidateQueries({ queryKey: ["series"] });
                  toast.success("Series deleted");
                } catch {
                  toast.error("Failed to delete series");
                }
              }}>Delete</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
