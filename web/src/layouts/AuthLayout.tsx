export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,145,65,0.14),_transparent_42%),linear-gradient(180deg,#fff7f1_0%,#ffffff_38%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        {children}
      </div>
    </div>
  )
}
