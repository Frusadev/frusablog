"use client";

interface StatItemProps {
  value: number;
  label: string;
}

export default function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
