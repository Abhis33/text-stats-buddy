import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Type, AlignLeft, Clock, MessageSquare, Copy, Trash2, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/components/ui/sonner";

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

    // Sentence count: split by sentence-ending punctuation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = text.trim() === "" ? 0 : sentences.length;

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
          Text Analyzer
        </h1>
        <p className="text-muted-foreground mt-2">
          Paste or type your text to see instant statistics
        </p>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-4 pb-12">
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

export default TextAnalyzer;
