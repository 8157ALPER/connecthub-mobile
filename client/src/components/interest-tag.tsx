import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface InterestTagProps {
  interest: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  };
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary";
  clickable?: boolean;
  removable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function InterestTag({ 
  interest, 
  size = "md", 
  variant = "default",
  clickable = false,
  removable = false,
  onClick,
  onRemove 
}: InterestTagProps) {
  const getColorClass = (color?: string) => {
    switch (color) {
      case "bg-blue-500":
      case "blue":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "bg-pink-500":
      case "pink":
        return "bg-pink-500 text-white hover:bg-pink-600";
      case "bg-green-500":
      case "green":
        return "bg-green-500 text-white hover:bg-green-600";
      case "bg-yellow-500":
      case "yellow":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "bg-purple-500":
      case "purple":
        return "bg-purple-500 text-white hover:bg-purple-600";
      case "bg-red-500":
      case "red":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        if (variant === "primary") {
          return "bg-primary text-white hover:bg-primary/90";
        }
        return "bg-slate-500 text-white hover:bg-slate-600";
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-1";
      case "lg":
        return "text-base px-4 py-2";
      default:
        return "text-sm px-3 py-1";
    }
  };

  const baseClasses = `inline-flex items-center rounded-full font-medium transition-colors ${getSizeClass(size)}`;
  const colorClasses = getColorClass(interest.color);
  const interactionClasses = clickable ? "cursor-pointer" : removable ? "" : "cursor-default";

  if (removable) {
    return (
      <div className={`${baseClasses} ${colorClasses} ${interactionClasses} space-x-1`} data-testid={`interest-tag-${interest.id}`}>
        {interest.icon && <i className={interest.icon}></i>}
        <span>{interest.name}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-4 w-4 p-0 hover:bg-white/20 text-current"
          data-testid={`remove-interest-${interest.id}`}
        >
          <i className="fas fa-times text-xs"></i>
        </Button>
      </div>
    );
  }

  if (clickable) {
    return (
      <div 
        className={`${baseClasses} ${colorClasses} ${interactionClasses}`}
        onClick={onClick}
        data-testid={`interest-tag-${interest.id}`}
      >
        {interest.icon && <i className={interest.icon}></i>}
        <span>{interest.name}</span>
        <i className="fas fa-plus ml-1 text-xs"></i>
      </div>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${baseClasses} ${colorClasses}`}
      data-testid={`interest-tag-${interest.id}`}
    >
      {interest.icon && <i className={`${interest.icon} mr-1`}></i>}
      {interest.name}
    </Badge>
  );
}
