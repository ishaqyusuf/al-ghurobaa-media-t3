import {
  BoxSelect,
  BoxSelectIcon,
  Home,
  Library,
  LucideBoxSelect,
  LucidePlay,
  LucideProps,
  MoreHorizontal,
  MoreVertical,
  Play,
  PlayCircle,
  PlayIcon,
  PlusIcon,
  RemoveFormatting,
  Search,
  Settings,
  StarIcon,
} from "lucide-react-native";

interface IconProps extends LucideProps {
  icon: Icons;
}
export function Icon({ icon, ...props }: IconProps) {
  const Ico = IconMap[icon];
  return <Ico {...props} />;
}

const IconMap = {
  home: Home,
  Select: BoxSelectIcon,
  settings: Settings,
  library: Library,
  search: Search,
  menu: MoreVertical,
  menuHorizontal: MoreHorizontal,
  play: Play,
  select: BoxSelect,
  add: PlusIcon,
  remove: RemoveFormatting,
  star: StarIcon,
};
export type Icons = keyof typeof IconMap;
