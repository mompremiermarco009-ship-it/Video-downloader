import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Download, Play, Clock, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { FileManager } from "@/components/FileManager";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface DownloadItem {
  id: string;
  url: string;
  platform: string;
  title: string;
  timestamp: number;
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("mp4-hd");
  const [selectedVideo, setSelectedVideo] = useState<DownloadItem | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [cloudFiles, setCloudFiles] = useState<any[]>([]);
  const [, setLocation] = useLocation();

  // Load download history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("downloadHistory");
    if (saved) {
      try {
        setDownloadHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse download history:", e);
      }
    }
  }, []);

  // Save download history to localStorage
  const saveToHistory = (item: DownloadItem) => {
    const updated = [item, ...downloadHistory].slice(0, 10);
    setDownloadHistory(updated);
    localStorage.setItem("downloadHistory", JSON.stringify(updated));
  };

  const detectPlatform = (url: string): string => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    if (url.includes("tiktok.com")) return "TikTok";
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("facebook.com")) return "Facebook";
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter/X";
    return "Unknown";
  };

  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      alert("Veuillez entrer une URL valide");
      return;
    }

    const platform = detectPlatform(videoUrl);
    if (platform === "Unknown") {
      alert("Plateforme non supportée. Veuillez entrer une URL valide.");
      return;
    }

    // Add to history
    const newItem: DownloadItem = {
      id: Date.now().toString(),
      url: videoUrl,
      platform: platform,
      title: videoUrl.substring(0, 50) + "...",
      timestamp: Date.now(),
    };
    saveToHistory(newItem);

    // Clear input
    setVideoUrl("");

    // Show success message
    alert(`Téléchargement de ${platform} initié en format ${selectedFormat}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      YouTube: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
      TikTok: "bg-black text-white dark:bg-gray-800",
      Instagram: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
      Facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
      "Twitter/X": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
    };
    return colors[platform] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Marco Video</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button
              onClick={() => logout()}
              variant="outline"
              size="sm"
              className="transition-all duration-300 ease-in-out"
            >
              Déconnexion
            </Button>
              </div>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="px-6 py-3 rounded-lg font-semibold bg-accent text-accent-foreground hover:opacity-90 active:scale-95 transition-all duration-300 ease-in-out"
              >
                Connexion
              </Button>
            )}
          {isAuthenticated && (
            <Button
              onClick={() => setLocation("/cloud")}
              variant="outline"
              size="sm"
              className="transition-all duration-300 ease-in-out"
            >
              ☁️ Mon Stockage
            </Button>
          )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-12 sm:py-20">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
              Téléchargez vos vidéos préférées
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Téléchargez facilement des vidéos depuis YouTube, TikTok, Instagram, Facebook et Twitter/X
            </p>
          </div>

          {/* Input Section */}
          <Card className="bg-card text-card-foreground rounded-lg border border-border/50 p-6 transition-all duration-300 ease-in-out mb-8 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3">URL de la vidéo</label>
                <Input
                  type="url"
                  placeholder="Collez l'URL de votre vidéo ici..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleDownload()}
                  className="bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 ease-in-out text-lg py-4"
                />
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3">Format de téléchargement</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "mp4-hd", label: "MP4 HD", icon: "🎬" },
                    { id: "mp4-sd", label: "MP4 SD", icon: "📹" },
                    { id: "mp3", label: "MP3 Audio", icon: "🎵" },
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ease-in-out ${
                        selectedFormat === format.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <div className="text-sm font-semibold">{format.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                className="w-full text-lg py-6 px-6 rounded-lg font-semibold bg-accent text-accent-foreground hover:opacity-90 active:scale-95 transition-all duration-300 ease-in-out"
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger
              </Button>
            </div>
          </Card>

          {/* Info Box */}
          <div className="flex gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Les téléchargements sont stockés localement dans votre navigateur. Aucune donnée n'est envoyée à nos serveurs.
            </p>
          </div>
        </div>

        {/* Download History */}
        {downloadHistory.length > 0 && (
          <div className="max-w-3xl mx-auto mt-16">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Historique récent
            </h3>
            <div className="space-y-3">
              {downloadHistory.map((item) => (
                <Card
                  key={item.id}
                  className="bg-card text-card-foreground rounded-lg border border-border/50 p-6 transition-all duration-300 ease-in-out p-4 flex items-center justify-between hover:shadow-md"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPlatformColor(item.platform)}`}>
                      {item.platform}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="transition-all duration-300 ease-in-out"
                    onClick={() => {
                      setSelectedVideo(item);
                      setShowVideoPlayer(true);
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      {showVideoPlayer && selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          platform={selectedVideo.platform}
          onClose={() => setShowVideoPlayer(false)}
          onUploadToCloud={async () => {
            // Handle upload to cloud
            console.log("Upload to cloud:", selectedVideo);
          }}
        />
      )}

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
