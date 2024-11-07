import localFont from "next/font/local";
import BookingForm from "./bookingForm";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[auto_1fr_auto] min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className="flex flex-col gap-4 w-full max-w-6xl mx-auto pt-4 sm:pt-8">
        <BookingForm />
      </main>
      <footer className="flex gap-6 flex-wrap items-center justify-center py-4">
        ᥫ᭡
      </footer>
    </div>
  );
}
