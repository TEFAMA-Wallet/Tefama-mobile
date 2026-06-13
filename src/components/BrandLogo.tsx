import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";

export function BrandLogo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Wallet gradient — dark orange → bright gold */}
        <RadialGradient id="wg" cx="50%" cy="30%" r="70%">
          <Stop offset="0%"   stopColor="#FFB300" />
          <Stop offset="55%"  stopColor="#FF7000" />
          <Stop offset="100%" stopColor="#AA2E00" />
        </RadialGradient>
        {/* Eye glow gradient */}
        <RadialGradient id="eg" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#FFE060" />
          <Stop offset="100%" stopColor="#FF8000" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* ── Orbital ring (partial arc — gap at bottom-left) ── */}
      <Circle
        cx={50} cy={46} r={42}
        fill="none"
        stroke="#FF8C00"
        strokeWidth={2}
        strokeDasharray="210 55"
        strokeLinecap="round"
        opacity={0.85}
      />
      {/* Orbit dot / planet — top-right */}
      <Circle cx={84} cy={16} r={5} fill="#FFD060" />
      <Circle cx={84} cy={16} r={9} fill="#FFD060" opacity={0.18} />

      {/* ── Wallet body — lower half ── */}
      {/* Back panel (darker) */}
      <Path
        d="M22 57 L22 87 Q22 94 30 94 L70 94 Q78 94 78 87 L78 57 Z"
        fill="#993000"
      />
      {/* Left flap (open) */}
      <Path
        d="M22 57 L22 42 Q22 36 28 36 L50 36 L50 57 Z"
        fill="url(#wg)"
        opacity={0.95}
      />
      {/* Right flap (open) */}
      <Path
        d="M50 36 L72 36 Q78 36 78 42 L78 57 L50 57 Z"
        fill="#FF6800"
        opacity={0.9}
      />
      {/* V-notch cutout (the T/shield motif) */}
      <Path d="M36 36 L50 54 L64 36 Z" fill="#0D0600" />
      {/* Wallet clasp — right edge */}
      <Circle cx={78} cy={70} r={4.5} fill="#FF7000" stroke="#FFB300" strokeWidth={1.5} />

      {/* ── Robot / agent head ── */}
      {/* Headphone arc */}
      <Path
        d="M34 32 Q34 12 50 12 Q66 12 66 32"
        fill="none"
        stroke="#FFB300"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Head sphere (dark) */}
      <Circle cx={50} cy={34} r={14} fill="#120800" />
      <Circle cx={50} cy={34} r={14} fill="#FF6000" opacity={0.06} />
      {/* Eye glow halos */}
      <Circle cx={43} cy={34} r={6} fill="url(#eg)" />
      <Circle cx={57} cy={34} r={6} fill="url(#eg)" />
      {/* Left eye — angular visor shape */}
      <Path d="M38 33 L41.5 30 L47 33 L43 36 Z" fill="#FF9800" opacity={0.95} />
      {/* Right eye */}
      <Path d="M53 33 L57 30 L62 33 L58 36 Z" fill="#FF9800" opacity={0.95} />
    </Svg>
  );
}
