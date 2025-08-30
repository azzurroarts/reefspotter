import './globals.css'

export const metadata = {
  title: 'ReefSpotter',
  description: 'Track your reef fish sightings',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
        {children}
      </body>
    </html>
  )
}
