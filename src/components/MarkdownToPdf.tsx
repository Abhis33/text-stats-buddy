import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileDown, Trash2, FileText, Eye } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";
import { marked } from "marked";

const MarkdownToPdf = () => {
  const [markdown, setMarkdown] = useState("");
  const [preview, setPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
      toast.error("Please upload a .md or .txt file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdown(content);
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handlePreview = async () => {
    if (!markdown.trim()) {
      toast.error("Please enter some markdown first");
      return;
    }
    const html = await marked(markdown);
    setPreview(html);
    setShowPreview(true);
  };

  const handleConvertToPdf = async () => {
    if (!markdown.trim()) {
      toast.error("Please enter some markdown first");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = margin;

      // Parse markdown to plain text with formatting hints
      const lines = markdown.split("\n");

      for (const line of lines) {
        let text = line;
        let fontSize = 12;
        let fontStyle: "normal" | "bold" | "italic" = "normal";

        // Handle headers
        if (line.startsWith("# ")) {
          text = line.slice(2);
          fontSize = 24;
          fontStyle = "bold";
        } else if (line.startsWith("## ")) {
          text = line.slice(3);
          fontSize = 20;
          fontStyle = "bold";
        } else if (line.startsWith("### ")) {
          text = line.slice(4);
          fontSize = 16;
          fontStyle = "bold";
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          text = "• " + line.slice(2);
        } else if (/^\d+\.\s/.test(line)) {
          // Numbered list - keep as is
        } else if (line.startsWith("> ")) {
          text = "  " + line.slice(2);
          fontStyle = "italic";
        }

        // Remove markdown formatting characters
        text = text.replace(/\*\*(.*?)\*\*/g, "$1");
        text = text.replace(/\*(.*?)\*/g, "$1");
        text = text.replace(/`(.*?)`/g, "$1");
        text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");

        doc.setFontSize(fontSize);
        doc.setFont("helvetica", fontStyle);

        // Wrap text
        const splitText = doc.splitTextToSize(text, maxWidth);

        // Check if we need a new page
        const textHeight = splitText.length * (fontSize * 0.4);
        if (yPosition + textHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        if (text.trim()) {
          doc.text(splitText, margin, yPosition);
          yPosition += textHeight + 4;
        } else {
          yPosition += 6; // Empty line spacing
        }
      }

      doc.save("document.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleClear = () => {
    setMarkdown("");
    setPreview("");
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Content cleared!");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".md,.txt"
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={!markdown}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
        <Button
          onClick={handleConvertToPdf}
          disabled={!markdown}
          className="gap-2"
        >
          <FileDown className="w-4 h-4" />
          Download PDF
        </Button>
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={!markdown}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      <div className={`grid gap-6 ${showPreview ? "md:grid-cols-2" : ""}`}>
        <Card className="bg-card border-border shadow-soft">
          <div className="flex items-center gap-2 p-3 border-b border-border">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Markdown Input</span>
          </div>
          <Textarea
            placeholder="Type your markdown here or upload a .md/.txt file..."
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[400px] resize-none border-0 bg-transparent text-lg leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-6 font-mono"
          />
        </Card>

        {showPreview && (
          <Card className="bg-card border-border shadow-soft">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Preview</span>
            </div>
            <div 
              className="p-6 prose prose-sm dark:prose-invert max-w-none min-h-[400px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </Card>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Supported Markdown</h2>
        <div className="grid gap-3">
          <FaqItem label="Headers" description="Use # for H1, ## for H2, ### for H3" />
          <FaqItem label="Bold" description="Wrap text with **double asterisks**" />
          <FaqItem label="Italic" description="Wrap text with *single asterisks*" />
          <FaqItem label="Lists" description="Use - or * for bullet points, 1. 2. 3. for numbered lists" />
          <FaqItem label="Quotes" description="Start lines with > for blockquotes" />
          <FaqItem label="Links" description="Use [text](url) format" />
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

export default MarkdownToPdf;
