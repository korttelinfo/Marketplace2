export type ChipLevel = 1 | 2 | 3;

export type ChipContext =
  | "browse"
  | "listing"
  | "contact"
  | "agreement"
  | "chat"
  | "profile"
  | "onboarding"
  | "filter";

export type ChipOption = {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
  parentId?: string;
  level?: ChipLevel;
  contexts?: ChipContext[];
  children?: ChipOption[];
};

export type ChipGroup = {
  id: string;
  label: string;
  description?: string;
  maxSelections?: number;
  required?: boolean;
  options: ChipOption[];
};
