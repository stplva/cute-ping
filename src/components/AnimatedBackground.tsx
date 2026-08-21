export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -inset-[40%] bg-gradient-to-br from-[#FFF1E3] via-[#F8C9BD] to-[#FF5C8D] animate-gradient" />
      <div className="absolute -left-8 -top-24 h-96 w-96 rounded-full bg-[#F8B4C4]/70 blur-3xl animate-blob" />
      <div className="absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#FDE3B3]/80 blur-3xl animate-blob-slow" />
      <div className="absolute bottom-0 left-[18%] h-96 w-96 rounded-full bg-[#FF5C8D]/60 blur-3xl animate-blob-fast" />
      <div className="absolute left-1/2 top-1/4 h-64 w-64 rounded-full bg-[#D4B8C7]/60 blur-3xl animate-blob-slow" />
    </div>
  )
}
