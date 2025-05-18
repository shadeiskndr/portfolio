import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div className={cn("bg-card rounded-xl shadow-md dark:shadow-2xl", className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
