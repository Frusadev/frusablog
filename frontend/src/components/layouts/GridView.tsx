import React from "react";

interface GridViewProps {
  className?: string;
  children?: React.ReactNode;
}

const GridView = ({ className = "", children }: GridViewProps) => {
  return <div className={`flex flex-wrap w-full ${className}`}>{children}</div>;
};

export default GridView;
