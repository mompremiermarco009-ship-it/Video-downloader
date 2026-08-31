import { X, Download, Share2, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  platform: string;
  onClose: () => void;
  onUploadToCloud?: () => void;
}

export function VideoPlayer({
  videoUrl,
  title,
  platform,
  onClose,
  onUploadToCloud,
}: VideoPlayerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = trpc.video.uploadToCloud.useMutation();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${title}-${platform}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadToCloud = async () => {
    try {
      setIsUploading(true);
      
      // Fetch the video file
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          
          // Upload to cloud
          const result = await uploadMutation.mutateAsync({
            fileName: title || 'video.mp4',
            fileData: base64,
            platform: platform,
            fileSize: blob.size,
          });
          
          if (result.success) {
            alert('Vidéo uploadée avec succès vers le cloud!');
            if (onUploadToCloud) {
              await onUploadToCloud();
            }
          }
        } catch (error) {
          console.error("Upload failed:", error);
          alert("Erreur lors de l'upload vers le cloud");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Erreur lors de l'upload vers le cloud");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{platform}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3 p-6 border-t border-border/50 bg-muted/50">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button
            onClick={handleUploadToCloud}
            disabled={isUploading}
            className="flex-1"
          >
            <Cloud className="w-4 h-4 mr-2" />
            {isUploading ? "Upload..." : "Vers le Cloud"}
          </Button>
          <Button
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
            }}
            variant="outline"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
