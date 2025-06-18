"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Search, 
  Calendar, 
  User, 
  Lock, 
  Globe, 
  Download,
  Image,
  File as FileIcon
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileResource, uploadFile, uploadFiles, getAllFiles, deleteFile } from "@/lib/api/requests/file";

export default function FilesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileResource | null>(null);
  const [isProtected, setIsProtected] = useState(false);

  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: getAllFiles,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { files: File[]; protected: boolean }) => {
      if (data.files.length === 1) {
        return await uploadFile(data.files[0], data.protected);
      } else {
        return await uploadFiles(data.files, data.protected);
      }
    },
    onSuccess: () => {
      toast.success("Files uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setUploadDialogOpen(false);
      setSelectedFiles([]);
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      toast.success("File deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    uploadMutation.mutate({ files: selectedFiles, protected: isProtected });
  };

  const handleDelete = (file: FileResource) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      deleteMutation.mutate(fileToDelete.id);
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    
    if (imageExtensions.includes(extension || '')) {
      return <Image className="h-5 w-5" />;
    }
    return <FileIcon className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">File Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage uploaded files and resources
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Upload Files</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Select files to upload to the server
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Selected {selectedFiles.length} file(s):
                    </p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="text-sm">
                        {file.name} ({formatFileSize(file.size)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="protected"
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                />
                <label htmlFor="protected" className="text-sm">
                  Make files protected (requires authentication to access)
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || selectedFiles.length === 0}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-none">All Files</TabsTrigger>
          <TabsTrigger value="protected" className="flex-1 sm:flex-none">Protected</TabsTrigger>
          <TabsTrigger value="public" className="flex-1 sm:flex-none">Public</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No files found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm ? "No files match your search criteria." : "No files have been uploaded yet."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload First File
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        {getFileIcon(file.name)}
                        <CardTitle className="text-sm truncate">{file.name}</CardTitle>
                      </div>
                      <Badge variant={file.protected ? "destructive" : "secondary"} className="shrink-0">
                        {file.protected ? (
                          <Lock className="h-3 w-3 mr-1" />
                        ) : (
                          <Globe className="h-3 w-3 mr-1" />
                        )}
                        <span className="hidden sm:inline">{file.protected ? "Protected" : "Public"}</span>
                        <span className="sm:hidden">{file.protected ? "P" : "Pub"}</span>
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {file.filetype}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(file.created_at), "MMM dd, yyyy")}
                    </div>
                    {file.owner && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        {file.owner.name}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                        <Download className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Download</span>
                        <span className="sm:hidden">DL</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(file)}
                        className="sm:w-auto"
                      >
                        <Trash2 className="h-3 w-3 sm:mr-0" />
                        <span className="sm:hidden ml-1">Delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="protected">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles
              .filter((file) => file.protected)
              .map((file) => (
                <Card key={file.id}>
                  {/* Same card content as above */}
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="public">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles
              .filter((file) => !file.protected)
              .map((file) => (
                <Card key={file.id}>
                  {/* Same card content as above */}
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{fileToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
