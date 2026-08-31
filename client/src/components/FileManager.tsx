import { Cloud, Trash2, Download, Eye, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface CloudFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: number;
  url: string;
  isPublic: boolean;
}

interface FileManagerProps {
  files: CloudFile[];
  onDelete?: (fileId: string) => void;
  onTogglePublic?: (fileId: string, isPublic: boolean) => void;
  onView?: (file: CloudFile) => void;
}

export function FileManager({
  files,
  onDelete,
  onTogglePublic,
  onView,
}: FileManagerProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground">Aucun fichier dans le cloud</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <Card
          key={file.id}
          className="bg-card text-card-foreground rounded-lg border border-border/50 p-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-4">
            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{file.name}</h4>
                {file.isPublic ? (
                  <Globe className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>{formatDate(file.uploadedAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onView?.(file)}
                variant="ghost"
                size="sm"
                title="Visualiser"
              >
                <Eye className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = file.url;
                  link.download = file.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                variant="ghost"
                size="sm"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                onClick={() =>
                  onTogglePublic?.(file.id, !file.isPublic)
                }
                variant="ghost"
                size="sm"
                title={file.isPublic ? "Rendre privé" : "Rendre public"}
              >
                {file.isPublic ? (
                  <Globe className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </Button>

              <Button
                onClick={() => onDelete?.(file.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
