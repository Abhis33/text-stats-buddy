import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileText, Type, AlignLeft } from "lucide-react";

const TextAnalyzer = () => {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const characterCount = text.length;
    
    // Word count: split by whitespace and filter empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = text.trim() === "" ? 0 : words.length;
    
    // Paragraph count: split by double newlines or count non-empty line groups
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphCount = text.trim() === "" ? 0 : paragraphs.length;

    return { characterCount, wordCount, paragraphCount };
  }, [text]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-8 text-center">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Text Analyzer
        </h1>
        <p className="text-muted-foreground mt-2">
          Paste or type your text to see instant statistics
        </p>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
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
            icon={<AlignLeft className="w-5 h-5" />}
            label="Paragraphs"
            value={stats.paragraphCount}
          />
        </div>

        <Card className="bg-card border-border shadow-soft">
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
}

const StatCard = ({ icon, label, value }: StatCardProps) => {
  return (
    <Card className="stat-card p-6 bg-card border-border">
      <div className="flex items-center gap-3 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-4xl font-bold text-foreground tabular-nums">
        {value.toLocaleString()}
      </p>
    </Card>
  );
};

export default TextAnalyzer;
