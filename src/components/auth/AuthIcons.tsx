import React from 'react'

type SvgProps = React.SVGProps<SVGSVGElement>

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const Icon = {
  Mail: (p: SvgProps) => <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>,
  Lock: (p: SvgProps) => <svg {...base} {...p}><rect x="4" y="10.5" width="16" height="10.5" rx="3" /><path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" /><circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" /></svg>,
  Eye: (p: SvgProps) => <svg {...base} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>,
  User: (p: SvgProps) => <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.6-4.5 5-7 8-7s6.4 2.5 8 7" /></svg>,
  Phone: (p: SvgProps) => <svg {...base} {...p}><rect x="6" y="2.5" width="12" height="19" rx="3" /><path d="M10 18.5h4" /></svg>,
  Calendar: (p: SvgProps) => <svg {...base} {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3.5v3M16 3.5v3" /></svg>,
  Pin: (p: SvgProps) => <svg {...base} {...p}><path d="M12 22s-7-7.5-7-13a7 7 0 1 1 14 0c0 5.5-7 13-7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>,
  Shield: (p: SvgProps) => <svg {...base} {...p}><path d="M12 2.5l8 3v6c0 5.4-3.6 9.6-8 11-4.4-1.4-8-5.6-8-11v-6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>,
  ShieldCheck: (p: SvgProps) => <svg {...base} strokeWidth="1.8" {...p}><path d="M12 2.5l8 3v6c0 5.4-3.6 9.6-8 11-4.4-1.4-8-5.6-8-11v-6l8-3z" /><path d="M8.5 12.2l2.5 2.5 4.5-5" /></svg>,
  Check: (p: SvgProps) => <svg {...base} strokeWidth="2.4" {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  ArrowRight: (p: SvgProps) => <svg {...base} strokeWidth="1.8" {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  ArrowLeft: (p: SvgProps) => <svg {...base} strokeWidth="1.8" {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>,
  Upload: (p: SvgProps) => <svg {...base} {...p}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>,
  Doc: (p: SvgProps) => <svg {...base} {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5" /></svg>,
  Camera: (p: SvgProps) => <svg {...base} {...p}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  Sparkle: (p: SvgProps) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z" /></svg>,
  Bank: (p: SvgProps) => <svg {...base} {...p}><path d="M3 10l9-5 9 5" /><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" /></svg>,
  Pix: (p: SvgProps) => <svg {...base} strokeWidth="1.8" {...p}><path d="M5.5 12L12 5.5 18.5 12 12 18.5z" /><path d="M9 8.5L12 5.5M15 8.5L12 5.5M9 15.5L12 18.5M15 15.5L12 18.5" /></svg>,
  Heart: (p: SvgProps) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 20s-7-4.4-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>,
  Baby: (p: SvgProps) => <svg {...base} {...p}><circle cx="12" cy="10" r="6" /><circle cx="10" cy="9.5" r="0.6" fill="currentColor" /><circle cx="14" cy="9.5" r="0.6" fill="currentColor" /><path d="M10.5 12.5c.5.5 2.5.5 3 0" /><path d="M7 6c1-1.5 3-2 5-2s4 .5 5 2" /></svg>,
  Home: (p: SvgProps) => <svg {...base} {...p}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9z" /></svg>,
  Globe: (p: SvgProps) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>,
  Link: (p: SvgProps) => <svg {...base} {...p}><path d="M10 14a4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 5.7l-1.5 1.5" /><path d="M14 10a4 4 0 0 1 0 5.7l-3 3a4 4 0 0 1-5.7-5.7l1.5-1.5" /></svg>,
  Plus: (p: SvgProps) => <svg {...base} strokeWidth="1.8" {...p}><path d="M12 5v14M5 12h14" /></svg>,
  X: (p: SvgProps) => <svg {...base} strokeWidth="1.8" {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  Info: (p: SvgProps) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>,
  Loader: (p: SvgProps) => <svg {...base} strokeWidth="2.2" {...p}><path d="M12 3a9 9 0 1 1-6.4 2.6" /></svg>,
  Google: (p: SvgProps) => <svg viewBox="0 0 24 24" {...p}><path fill="#EA4335" d="M12 10.2v3.8h5.3c-.2 1.4-1.6 4-5.3 4-3.2 0-5.8-2.6-5.8-5.9s2.6-6 5.8-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.7 14.5 2.7 12 2.7 6.8 2.7 2.6 7 2.6 12.1S6.8 21.5 12 21.5c6.9 0 9.4-4.8 9.4-7.3 0-.5 0-.9-.1-1.3H12z" /></svg>,
  Apple: (p: SvgProps) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16.5 12.2c0-2.5 2-3.7 2.1-3.8-1.1-1.6-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.9-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-3.8zM14.3 4.7c.7-.9 1.2-2.1 1.1-3.3-1 .1-2.3.7-3 1.6-.7.7-1.3 2-1.1 3.1 1.1.1 2.3-.6 3-1.4z" /></svg>,
  ChevronDown: (p: SvgProps) => <svg {...base} strokeWidth="2" {...p}><polyline points="6 9 12 15 18 9" /></svg>,
  AlertCircle: (p: SvgProps) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>,
  RefreshCw: (p: SvgProps) => <svg {...base} {...p}><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>,
}
