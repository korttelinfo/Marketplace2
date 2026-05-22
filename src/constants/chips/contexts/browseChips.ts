import { categoryTree } from "../taxonomy/categoryTree";

export const browseCategoryChips = categoryTree.map(({ id, label, value, children }) => ({
  id,
  label,
  value,
  children,
}));