import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Type, AlignLeft, Clock, MessageSquare, Copy, Trash2, Moon, Sun, Check, FileDown, Image } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/components/ui/sonner";
import MarkdownToPdf from "./MarkdownToPdf";
import ImageToPdf from "./ImageToPdf";

const TextAnalyzer = () => {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const { theme, setTheme } = useTheme();

  const stats = useMemo(() => {
    const characterCount = text.length;
    
    // Word count: split by whitespace and filter empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = text.trim() === "" ? 0 : words.length;
    
    // Paragraph count: split by double newlines or count non-empty line groups
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphCount = text.trim() === "" ? 0 : paragraphs.length;

    // Sentence count: count by punctuation or newlines with content
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const sentenceCount = lines.reduce((count, line) => {
      const punctuationEndings = line.match(/[.!?]+/g);
      return count + (punctuationEndings ? punctuationEndings.length : 1);
    }, 0);

    // Reading time: average 200 words per minute
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    return { characterCount, wordCount, paragraphCount, sentenceCount, readingTimeMinutes };
  }, [text]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
    toast.success("Text cleared!");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-8 text-center relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="absolute right-4 top-4"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          DocuForge
        </h1>
        <p className="text-muted-foreground mt-2">
          Analyze text, convert Markdown, and merge images into PDFs — all in one toolkit
        </p>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-4 pb-12">
        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="analyzer" className="gap-2">
              <Type className="w-4 h-4" />
              Text Analyzer
            </TabsTrigger>
            <TabsTrigger value="markdown" className="gap-2">
              <FileDown className="w-4 h-4" />
              Markdown to PDF
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <Image className="w-4 h-4" />
              Image to PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5 mb-8">
              <StatCard
                icon={<Type className="w-5 h-5" />}
                label="Characters"
                value={stats.characterCount}
              />
              <StatCard
                icon={<FileText className="w-5 h-5" />}
                label="Words"
                value={stats.wordCount}
              />
              <StatCard
                icon={<MessageSquare className="w-5 h-5" />}
                label="Sentences"
                value={stats.sentenceCount}
              />
              <StatCard
                icon={<AlignLeft className="w-5 h-5" />}
                label="Paragraphs"
                value={stats.paragraphCount}
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="Read Time"
                value={stats.readingTimeMinutes}
                suffix="min"
              />
            </div>

            <Card className="bg-card border-border shadow-soft">
              <div className="flex items-center gap-2 p-3 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!text}
                  className="gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={!text}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </div>
              <Textarea
                placeholder="Start typing or paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[400px] resize-none border-0 bg-transparent text-lg leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-6"
              />
            </Card>

            <div className="mt-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">How Statistics Are Calculated</h2>
              <div className="grid gap-3">
                <FaqItem
                  label="Characters"
                  description="Total number of characters including spaces and punctuation."
                />
                <FaqItem
                  label="Words"
                  description="Count of words separated by whitespace."
                />
                <FaqItem
                  label="Sentences"
                  description="Counted by punctuation marks (. ! ?) or line breaks with content."
                />
                <FaqItem
                  label="Paragraphs"
                  description="Groups of text separated by blank lines."
                />
                <FaqItem
                  label="Reading Time"
                  description="Estimated time based on average reading speed of 200 words per minute."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="markdown">
            <MarkdownToPdf />
          </TabsContent>

          <TabsContent value="images">
            <ImageToPdf />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}

const StatCard = ({ icon, label, value, suffix }: StatCardProps) => {
  return (
    <Card className="stat-card p-4 bg-card border-border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
        {value.toLocaleString()}{suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
      </p>
    </Card>
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

export default TextAnalyzer;
