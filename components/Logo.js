export function LogoHorizontal({ className = "" }) {
  return (
    <svg className={className || "logo-horizontal"} viewBox="0 0 1080 300" role="img" aria-label="Love3D">
      <g transform="translate(28 43)">
        <path d="M105 196C91 182 31 128 31 77C31 37 60 15 91 15c22 0 40 11 51 29 11-18 29-29 51-29 31 0 60 22 60 62 0 51-60 105-74 119l-13 12-13-12z" fill="none" stroke="#1c2d34" strokeWidth="18" strokeLinejoin="round"/>
        <path d="M119 178C104 163 66 128 66 93c0-25 17-42 37-42 14 0 26 7 34 20 8-13 20-20 34-20 20 0 37 17 37 42 0 35-38 70-53 85l-18 17-18-17z" fill="none" stroke="#eb503c" strokeWidth="18" strokeLinejoin="round"/>
        <path d="M105 196V86" stroke="#1c2d34" strokeWidth="18"/>
        <path d="M119 178V106" stroke="#eb503c" strokeWidth="18"/>
      </g>
      <text x="300" y="210" fontFamily="Arial, Helvetica, sans-serif" fontSize="166" fontWeight="800" letterSpacing="-8" fill="#1c2d34">LOV</text>
      <text x="585" y="210" fontFamily="Arial, Helvetica, sans-serif" fontSize="166" fontWeight="800" letterSpacing="-8" fill="#eb503c">E3D</text>
    </svg>
  );
}

export function LogoMark({ className = "" }) {
  return (
    <svg className={className || "logo-mark"} viewBox="0 0 400 400" role="img" aria-label="Love3D">
      <path d="M200 360C174 334 55 236 55 137C55 79 97 40 143 40c31 0 47 14 57 33 10-19 26-33 57-33 46 0 88 39 88 97 0 99-119 197-145 223z" fill="none" stroke="#1c2d34" strokeWidth="34" strokeLinejoin="round"/>
      <path d="M200 320C175 294 101 229 101 166c0-36 25-62 55-62 20 0 32 9 44 29 12-20 24-29 44-29 30 0 55 26 55 62 0 63-74 128-99 154z" fill="none" stroke="#eb503c" strokeWidth="34" strokeLinejoin="round"/>
      <path d="M200 360V108" stroke="#1c2d34" strokeWidth="34"/>
      <path d="M200 320V150" stroke="#eb503c" strokeWidth="34"/>
    </svg>
  );
}
