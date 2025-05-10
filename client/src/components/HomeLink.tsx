import { Link } from "wouter";
import React from "react";

interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

// This component works like a regular link but uses wouter for client-side navigation
const HomeLink: React.FC<LinkProps> = ({ href, className, children }) => {
  return (
    <div className={className} style={{ display: 'contents' }}>
      <Link href={href}>
        {children}
      </Link>
    </div>
  );
};

export default HomeLink;