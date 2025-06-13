import { Textarea } from "../textarea";

interface EditorProps {
  content: string;
  contentStateChange: (content: string) => void;
  className?: string;
}

export default function Editor({
  content,
  contentStateChange,
  className = "",
}: EditorProps) {
  return (
    <div className="w-full h-full">
      <Textarea
        className={`resize-none ${className}`}
        content={content}
        onChange={(e) => contentStateChange(e.currentTarget.value)}
      />
    </div>
  );
}
