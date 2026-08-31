import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cloud, Upload, Trash2, Download, Eye, Lock, Globe, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface CloudFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: number;
  url: string;
  isPublic: boolean;
  platform: string;
}

export default function CloudStorage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

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

  const handleDownload = (file: CloudFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (fileId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      setFiles(files.filter(f => f.id !== fileId));
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Mon Stockage Cloud
              </h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.name}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card text-card-foreground rounded-lg border border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fichiers</p>
                <p className="text-3xl font-bold">{files.length}</p>
              </div>
              <Cloud className="w-12 h-12 text-blue-600/20" />
            </div>
          </Card>

          <Card className="bg-card text-card-foreground rounded-lg border border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Espace utilisé</p>
                <p className="text-3xl font-bold">
                  {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                </p>
              </div>
              <Upload className="w-12 h-12 text-green-600/20" />
            </div>
          </Card>

          <Card className="bg-card text-card-foreground rounded-lg border border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fichiers publics</p>
                <p className="text-3xl font-bold">
                  {files.filter(f => f.isPublic).length}
                </p>
              </div>
              <Globe className="w-12 h-12 text-purple-600/20" />
            </div>
          </Card>
        </div>

        {/* Files List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Mes fichiers</h2>
          
          {files.length === 0 ? (
            <Card className="bg-card text-card-foreground rounded-lg border border-border/50 p-12 text-center">
              <Cloud className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                Aucun fichier stocké dans le cloud
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Téléchargez une vidéo et envoyez-la vers le cloud pour la voir ici
              </p>
            </Card>
          ) : (
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
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {file.platform}
                        </span>
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
                        onClick={() => handleDownload(file)}
                        variant="ghost"
                        size="sm"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      <Button
                        onClick={() => handleDelete(file.id)}
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
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Marco Video. Tous droits réservés.
            </p>
            <p className="text-sm font-semibold text-foreground">
              Powered by <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Mr Marco</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
