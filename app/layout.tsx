import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../src/hooks/useAuth'
import { ThemeProvider } from '../src/components/theme-provider'
import { Navbar } from '../src/components/layout/navbar'

export const metadata: Metadata = {
  title: 'DSATutor - AI-Powered DSA Interview Prep',
  description: 'Your AI-powered platform for DSA interview preparation',
  generator: 'DSATutor',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main>
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
