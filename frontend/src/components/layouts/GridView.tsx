import React from "react";

interface GridViewProps {
  className?: string;
  children?: React.ReactNode;
}

const GridView = ({ className = "", children }: GridViewProps) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full ${className}`}>
      {children}
    </div>
  );
};

export default GridView;
