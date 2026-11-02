const NUMBER = "918891457889"; // country code + number, no + or spaces
const TEXT = "Hello Hawkeye Vision, I would like to enquire about your products.";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${NUMBER}?text=${encodeURIComponent(TEXT)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Hawkeye Vision on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:scale-105 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 21l1.7-5A9 9 0 1 1 8 19.4L3 21Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.3-2.2-1-1 .9c-1-.4-2-1.4-2.4-2.4l.9-1-1-2.2L9 8.5Z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}
