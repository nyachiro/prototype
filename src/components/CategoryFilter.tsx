import { Badge } from "@/components/ui/badge";
import { ClaimCategory } from "@/types";

interface CategoryFilterProps {
  categories: ClaimCategory[];
  selectedCategory: ClaimCategory | "all";
  onCategoryChange: (category: ClaimCategory | "all") => void;
}

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const allCategories: (ClaimCategory | "all")[] = ["all", ...categories];
  
  const getCategoryLabel = (category: ClaimCategory | "all") => {
    if (category === "all") return "All Categories";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {allCategories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          className={`cursor-pointer whitespace-nowrap ${
            selectedCategory === category 
              ? "bg-primary text-white" 
              : "hover:bg-primary/10"
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {getCategoryLabel(category)}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryFilter;