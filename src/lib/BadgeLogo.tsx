export default function BadgeLogo() {
  return (
    <svg 
      width="10" 
      height="10" 
      viewBox="0 0 24 24" 
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="white" />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="red"
      >
        ?
      </text>
    </svg>
  );
}
