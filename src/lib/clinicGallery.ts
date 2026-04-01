/**
 * Clinic / facility photos for the landing carousel.
 * Replace `src` with paths under `/public` (e.g. `/clinic/reception.jpg`) when you have real photos.
 */
export type ClinicGallerySlide = {
  src: string
  alt: string
  title: string
  caption: string
}

export const CLINIC_GALLERY_SLIDES: ClinicGallerySlide[] = [
  {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80",
    alt: "Bright, modern hospital corridor with natural light",
    title: "Calm, clean spaces",
    caption: "We keep walkways and waiting areas uncluttered so you feel settled before you’re seen.",
  },
  {
    src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80",
    alt: "Clinic reception desk with plants and welcoming interior",
    title: "Front desk that guides you",
    caption: "Our team helps with slots, reports, and paperwork — you’re not left guessing at a counter.",
  },
  {
    src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80",
    alt: "Doctor and patient in a professional consultation",
    title: "Face-to-face GP care",
    caption: "Consults are unhurried: history, exam when needed, and a plan you can follow at home.",
  },
  {
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80",
    alt: "Medical professional reviewing health information",
    title: "Documentation you can rely on",
    caption: "Notes and prescriptions are written clearly — and sync to your portal when applicable.",
  },
]
