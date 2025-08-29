import './globals.css'

export const metadata = {
  title: 'Reefspotter',
  description: 'Track your fish species!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
