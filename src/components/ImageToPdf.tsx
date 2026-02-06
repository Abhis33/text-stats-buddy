import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileDown, Trash2, Image, GripVertical, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

const ImageToPdf = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageItem[] = [];
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const preview = URL.createObjectURL(file);
      newImages.push({ id, file, preview });
    });

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`Added ${newImages.length} image(s)`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setImages((prev) => {
      const draggedIndex = prev.findIndex((img) => img.id === draggedId);
      const targetIndex = prev.findIndex((img) => img.id === targetId);
      
      const newImages = [...prev];
      const [draggedItem] = newImages.splice(draggedIndex, 1);
      newImages.splice(targetIndex, 0, draggedItem);
      
      return newImages;
    });
    
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
    toast.success("Image removed");
  };

  const handleClear = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    toast.success("All images cleared");
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleConvertToPdf = useCallback(async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          doc.addPage();
        }

        const img = await loadImage(images[i].file);
        const imgWidth = img.width;
        const imgHeight = img.height;

        // Calculate dimensions to fit the page while maintaining aspect ratio
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;

        let finalWidth = imgWidth;
        let finalHeight = imgHeight;

        // Scale down if needed
        if (finalWidth > maxWidth) {
          const ratio = maxWidth / finalWidth;
          finalWidth = maxWidth;
          finalHeight = imgHeight * ratio;
        }

        if (finalHeight > maxHeight) {
          const ratio = maxHeight / finalHeight;
          finalHeight = maxHeight;
          finalWidth = finalWidth * ratio;
        }

        // Center the image on the page
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        // Convert image to base64
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        doc.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);

        // Clean up
        URL.revokeObjectURL(img.src);
      }

      doc.save("images.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  }, [images]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Add Images
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
        <Button
          onClick={handleConvertToPdf}
          disabled={images.length === 0 || isGenerating}
          className="gap-2"
        >
          <FileDown className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={images.length === 0}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Image className="w-4 h-4" />
          {images.length} image{images.length !== 1 ? "s" : ""} added
        </div>
      </div>

      <Card className="bg-card border-border shadow-soft p-6 min-h-[400px]">
        {images.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center h-[350px] text-muted-foreground cursor-pointer border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No images added</p>
            <p className="text-sm">Click to upload or drag and drop images here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, image.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, image.id)}
                onDragEnd={handleDragEnd}
                className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-move transition-all ${
                  draggedId === image.id 
                    ? "opacity-50 border-primary" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={image.preview}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 rounded px-2 py-1 text-xs font-medium">
                  <GripVertical className="w-3 h-3" />
                  {index + 1}
                </div>
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">How It Works</h2>
        <div className="grid gap-3">
          <FaqItem label="Add Images" description="Click the button or drag and drop images (JPG, PNG, etc.)" />
          <FaqItem label="Reorder" description="Drag and drop images to change the order in the PDF" />
          <FaqItem label="Remove" description="Hover over an image and click the X to remove it" />
          <FaqItem label="Download" description="Each image becomes a page in the PDF, maintaining aspect ratio" />
        </div>
      </div>
    </div>
  );
};

interface FaqItemProps {
  label: string;
  description: string;
}

const FaqItem = ({ label, description }: FaqItemProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 border-b border-border last:border-0">
      <span className="font-medium text-foreground min-w-[100px]">{label}</span>
      <span className="text-muted-foreground text-sm">{description}</span>
    </div>
  );
};

export default ImageToPdf;
