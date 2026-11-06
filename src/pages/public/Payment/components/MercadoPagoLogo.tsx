// Logo MercadoPago (wordmark + emblema simplificado, color oficial #009EE3)
export function MercadoPagoLogo() {
  return (
    <svg width="140" height="48" viewBox="0 0 140 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="24" rx="19" ry="14" fill="#009EE3" />
      <path
        d="M24 13c-7.5 0-14 4.5-14 10.5S16.5 34 24 34s14-4.5 14-10.5S31.5 13 24 13zm0 18.5c-6.3 0-11.5-3.6-11.5-8S17.7 15.5 24 15.5 35.5 19.1 35.5 23.5 30.3 31.5 24 31.5z"
        fill="#fff"
        opacity="0.25"
      />
      <path
        d="M17 21.5c1.8-1.8 3.4-2.6 4.8-2.6 1.2 0 1.9.6 2.8 1.4l.5.5c.9.8 1.6 1.2 2.7 1.2 1.3 0 2.7-.8 4.2-2"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M19 26.5l2.2-2.2m1.3 3.2l2.2-2.2m1.4 3l1.9-1.9"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text x="48" y="21" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#2D3277">
        mercado
      </text>
      <text x="48" y="35" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#009EE3">
        pago
      </text>
    </svg>
  );
}
