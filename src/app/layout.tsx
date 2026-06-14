import type { Metadata } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';
import { InquiryProvider } from '../context/InquiryContext';
import { ScrollProgress } from '../components/ScrollProgress';
import { LoadingScreen } from '../components/LoadingScreen';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { BackToTop } from '../components/BackToTop';
import { InquiryModal } from '../components/InquiryModal';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'The Golden Celebrations Lawn | Premium Wedding & Event Venue',
  description:
    'Experience luxury weddings, receptions, and celebrations in a premium garden lawn venue crafted for unforgettable memories in Mumbai. Enquire for custom packages.',
  keywords: 'wedding lawn, event venue, luxury wedding, golden celebrations lawn, banquets, party lawn',
  authors: [{ name: 'The Golden Celebrations Lawn' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${poppins.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory-50 text-foreground dark:bg-zinc-950 font-sans">
        <InquiryProvider>
          {/* Top scroll tracker */}
          <ScrollProgress />
          
          {/* Logo intro screen */}
          <LoadingScreen />
          
          {/* Sticky Nav */}
          <Navbar />
          
          {/* Main content */}
          <main className="flex-1 w-full pt-16">{children}</main>
          
          {/* Page Footer */}
          <Footer />

          {/* Floating UI Elements */}
          <WhatsAppButton />
          <BackToTop />
          
          {/* Global Dialog overlay */}
          <InquiryModal />
        </InquiryProvider>
      </body>
    </html>
  );
}
