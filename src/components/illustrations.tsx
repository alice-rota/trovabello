// Illustrations au trait, dessinées à la main (esprit faire-part / cave à vin).
// Traits fins via vectorEffect="non-scaling-stroke". La couleur suit `currentColor`
// (mets text-wine ou text-ink sur le parent).

type Props = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

// Coupe à cocktail avec cerise + petites éclaboussures (motif du faire-part)
export function CherryCoupe({ className }: Props) {
  return (
    <svg viewBox="0 0 80 92" className={className} aria-hidden>
      <g {...S}>
        <path d="M16 30 Q40 22 64 30" />
        <path d="M16 30 Q40 58 64 30" />
        <path d="M25 31 l3.5 4 l3.5 -4 l3.5 4 l3.5 -4 l3.5 4 l3.5 -4 l3.5 4" />
        <path d="M40 45 L40 78" />
        <path d="M28 81 Q40 74 52 81" />
        <circle cx="58" cy="17" r="4.5" />
        <path d="M57 13 Q53 6 46 9" />
        <path d="M66 12 l6 -3" />
        <path d="M68 19 l7 0" />
        <path d="M66 26 l6 3" />
      </g>
    </svg>
  );
}

// Pièce montée à étages sur son présentoir
export function Cake({ className }: Props) {
  return (
    <svg viewBox="0 0 110 112" className={className} aria-hidden>
      <g {...S}>
        <path d="M50 34 L50 27" />
        <path d="M60 34 L60 27" />
        <path d="M44 34 L66 34 L68 46 L42 46 Z" />
        <path d="M37 46 L73 46 L75 60 L35 60 Z" />
        <path d="M30 60 L80 60 L82 76 L28 76 Z" />
        <path d="M33 66 q4.5 5 9 0 q4.5 5 9 0 q4.5 5 9 0 q4.5 5 9 0" />
        <path d="M24 77 Q55 87 86 77" />
        <path d="M55 79 L55 91" />
        <path d="M41 97 Q47 89 55 91 Q63 89 69 97" />
      </g>
    </svg>
  );
}

// Couple debout, main dans la main (lui en costume, elle en robe + bouquet)
export function Couple({ className }: Props) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden>
      <g {...S}>
        {/* lui */}
        <circle cx="31" cy="20" r="6" />
        <path d="M31 26 L31 52" />
        <path d="M31 33 L21 42" />
        <path d="M31 33 L46 40" />
        <path d="M31 52 L25 74" />
        <path d="M31 52 L35 74" />
        {/* elle */}
        <circle cx="63" cy="20" r="6" />
        <path d="M63 26 L63 46" />
        <path d="M51 74 L63 46 L75 74 Z" />
        <path d="M63 33 L46 40" />
        <path d="M63 33 L76 41" />
        {/* bouquet */}
        <circle cx="79" cy="42" r="3.5" />
      </g>
    </svg>
  );
}

// Petits danseurs (bande décorative)
export function Dancers({ className }: Props) {
  const xs = [20, 62, 104, 148, 190];
  return (
    <svg viewBox="0 0 210 82" className={className} aria-hidden>
      <g {...S}>
        {xs.map((x, i) => {
          const up = i % 2 === 0;
          return (
            <g key={x}>
              <circle cx={x} cy="22" r="5" />
              <path d={`M${x} 27 L${x} 48`} />
              <path d={`M${x} 32 L${x - 12} ${up ? 16 : 22}`} />
              <path d={`M${x} 32 L${x + 12} ${up ? 14 : 20}`} />
              <path d={`M${x} 48 L${x - 9} 70`} />
              <path d={`M${x} 48 L${x + 9} 70`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// Table ronde « Le Dive » : bouteille + verres posés
export function BottleTable({ className }: Props) {
  return (
    <svg viewBox="0 0 170 132" className={className} aria-hidden>
      <g {...S}>
        <ellipse cx="85" cy="70" rx="65" ry="16" />
        <ellipse cx="85" cy="70" rx="56" ry="11" />
        <path d="M85 86 L85 118" />
        <path d="M68 121 Q85 112 102 121" />
        {/* bouteille */}
        <path d="M75 62 L75 41 Q75 36 79 34 L79 22 L86 22 L86 34 Q90 36 90 41 L90 62" />
        <path d="M75 50 L90 50" />
        {/* verres */}
        <path d="M104 64 Q110 73 116 64" />
        <path d="M104 64 Q110 60 116 64" />
        <path d="M110 71 L110 78 M105 79 L115 79" />
        <path d="M124 66 Q129 74 134 66" />
        <path d="M124 66 Q129 62 134 66" />
        <path d="M129 73 L129 79 M125 80 L133 80" />
      </g>
    </svg>
  );
}

// Pyramide de coupes de champagne sur un plateau
export function ChampagneTower({ className }: Props) {
  const coupe = (cx: number, by: number, key: string) => (
    <g key={key}>
      <path d={`M${cx - 8} ${by} Q${cx} ${by + 7} ${cx + 8} ${by}`} />
      <path d={`M${cx - 8} ${by} Q${cx} ${by - 3} ${cx + 8} ${by}`} />
      <path d={`M${cx} ${by + 6} L${cx} ${by + 13}`} />
    </g>
  );
  return (
    <svg viewBox="0 0 130 120" className={className} aria-hidden>
      <g {...S}>
        {coupe(65, 30, "t")}
        {coupe(53, 52, "m1")}
        {coupe(77, 52, "m2")}
        {coupe(41, 74, "b1")}
        {coupe(65, 74, "b2")}
        {coupe(89, 74, "b3")}
        <path d="M28 96 L102 96" />
        <path d="M28 96 Q65 105 102 96" />
      </g>
    </svg>
  );
}

// Petite branche d'olivier (séparateur fin)
export function Sprig({ className }: Props) {
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden>
      <g {...S}>
        <path d="M10 12 Q60 12 110 12" />
        <path d="M30 12 Q26 5 20 6 M30 12 Q34 5 40 6" />
        <path d="M55 12 Q51 5 45 6 M55 12 Q59 5 65 6" />
        <path d="M80 12 Q76 5 70 6 M80 12 Q84 5 90 6" />
      </g>
    </svg>
  );
}

// Ruban « banderole » avec texte (style Save the Date)
export function Ribbon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className ?? ""}`}>
      <svg
        viewBox="0 0 260 56"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-wine"
        aria-hidden
      >
        <g {...S}>
          <path d="M8 12 L48 18 L42 28 L48 38 L8 44 L18 28 Z" />
          <path d="M252 12 L212 18 L218 28 L212 38 L252 44 L242 28 Z" />
          <path d="M44 16 L216 16 L216 40 L44 40 Z" />
        </g>
      </svg>
      <span className="relative font-hand text-wine px-12 leading-none">
        {children}
      </span>
    </span>
  );
}
