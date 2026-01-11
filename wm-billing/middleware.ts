import { NextResponse, type NextRequest } from 'next/server';

const stripeDomains = [
  "https://js.stripe.com",
  "https://m.stripe.com",
  "https://api.stripe.com",
  "https://hooks.stripe.com",
];

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${stripeDomains.join(' ')} 'unsafe-inline' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:`,
    "object-src 'none'",
    `connect-src 'self' ${stripeDomains.join(' ')}`,
    "frame-ancestors 'none'",
    `frame-src 'self' ${stripeDomains.join(' ')}`,
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)',
  ],
};
