import type { Course } from "@/lib/types";

type Props = Pick<Course, "type" | "color" | "accent">;

/** Default cover art for listings without an uploaded image (ported from the POC). */
export default function CourseIllustration({ type, color: b, accent: a }: Props) {
  return (
    <svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="300" height="180" fill={b} />
      <circle cx="275" cy="158" r="75" fill="white" opacity=".18" />
      <circle cx="25" cy="15" r="58" fill="white" opacity=".16" />
      <Shapes type={type} a={a} b={b} />
    </svg>
  );
}

function Shapes({ type, a, b }: { type: Course["type"]; a: string; b: string }) {
  switch (type) {
    case "tech":
      return (
        <>
          <rect x="76" y="40" width="150" height="95" rx="7" fill={a} />
          <rect x="84" y="49" width="134" height="77" rx="3" fill="#faf8ff" />
          <path d="M60 140h182l-16 10H76z" fill={a} />
          <rect x="99" y="63" width="45" height="48" rx="5" fill={b} />
          <path d="M157 70h45m-45 13h35m-35 13h40" stroke={a} strokeWidth="5" strokeLinecap="round" />
          <path d="M249 33l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill={a} />
        </>
      );
    case "language":
      return (
        <>
          <rect x="51" y="38" width="114" height="67" rx="18" fill={a} />
          <path d="M70 100v19l23-19" fill={a} />
          <rect x="141" y="81" width="112" height="65" rx="18" fill="#fffaf2" />
          <path d="M230 141v18l-23-18" fill="#fffaf2" />
          <text x="108" y="82" textAnchor="middle" fontSize="24" fill="white" fontFamily="sans-serif">
            Hello!
          </text>
          <text x="197" y="122" textAnchor="middle" fontSize="24" fill={a} fontFamily="sans-serif">
            ¡Hola!
          </text>
        </>
      );
    case "books":
      return (
        <>
          <rect x="65" y="130" width="172" height="21" rx="4" fill={a} />
          <rect x="79" y="108" width="153" height="20" rx="3" fill="#f9f3de" />
          <rect x="62" y="86" width="166" height="20" rx="3" fill="#90ac8b" />
          <path d="M146 77Q106 36 70 48v52q36-13 76 12 40-25 76-12V48q-36-12-76 29z" fill="#fffcf1" />
          <path d="M146 77v35" stroke={a} strokeWidth="2" />
          <path d="M84 65l42 13m-42 0l42 13m40-13l40-13m-40 26l40-13" stroke="#c0c9aa" strokeWidth="3" />
        </>
      );
    case "classroom":
      return (
        <>
          <rect x="70" y="33" width="166" height="88" rx="6" fill={a} />
          <rect x="78" y="41" width="150" height="72" rx="3" fill="#eff4ee" />
          <path d="M97 66h64m-64 15h107m-107 15h87" stroke={a} strokeWidth="4" strokeLinecap="round" />
          <circle cx="103" cy="133" r="12" fill="#c18c66" />
          <circle cx="153" cy="133" r="12" fill="#e0b38e" />
          <circle cx="204" cy="133" r="12" fill="#8f6652" />
          <path d="M82 176v-18q21-28 42 0v18m8 0v-18q21-28 42 0v18m9 0v-18q21-28 42 0v18" fill={a} />
        </>
      );
    case "inclusive":
      return (
        <>
          <circle cx="151" cy="95" r="62" fill="#fff4eb" />
          <path d="M108 99a43 43 0 0186 0" stroke={a} fill="none" strokeWidth="16" />
          <path d="M128 99a23 23 0 0146 0" stroke="#dca28a" fill="none" strokeWidth="12" />
          <circle cx="106" cy="127" r="14" fill={a} />
          <circle cx="151" cy="126" r="14" fill="#d5a36f" />
          <circle cx="196" cy="127" r="14" fill="#81988a" />
          <path d="M85 169q0-29 21-29t21 29m3 0q0-29 21-29t21 29m3 0q0-29 21-29t21 29" fill={a} />
        </>
      );
    default:
      return (
        <>
          <path d="M72 151v-35h47V90h46V64h46V37h27v114z" fill={a} opacity=".8" />
          <path d="M83 94l52-31 31 0 53-38" stroke="#fffaf0" strokeWidth="5" fill="none" />
          <path d="M203 23h18v18" stroke="#fffaf0" strokeWidth="5" fill="none" />
          <circle cx="102" cy="52" r="12" fill="#c79974" />
          <path d="M85 95V78q17-22 34 0v17" fill={a} />
        </>
      );
  }
}
