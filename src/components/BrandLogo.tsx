import { Image } from "react-native";
import { useColorTheme } from "../lib/ThemeContext";

interface Props { size?: number }

export function BrandLogo({ size = 32 }: Props) {
  const { isDark } = useColorTheme();
  const src = isDark
    ? require("../../assets/branding/logo-mark.png")
    : require("../../assets/branding/logo-mark-light.png");
  return <Image source={src} style={{ width: size, height: size }} resizeMode="contain" />;
}
