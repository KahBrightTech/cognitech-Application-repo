import Starfield from './Starfield.jsx'

/** Layered aurora gradients + starfield behind the whole app. */
export default function AuroraBackground({ ambient = true }) {
  const drift = ambient ? 'animate-drift' : ''
  const driftSlow = ambient ? 'animate-drift-slow' : ''

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_0%,#160d2e_0%,#0a0617_45%,#05030c_100%)]" />

      <div className={`absolute -left-40 top-[-12rem] h-[42rem] w-[42rem] ${drift} rounded-full bg-nova-violet/25 blur-[140px]`} />
      <div className={`absolute -right-48 top-24 h-[38rem] w-[38rem] ${driftSlow} rounded-full bg-nova-plasma/20 blur-[150px]`} />
      <div className={`absolute bottom-[-16rem] left-1/3 h-[40rem] w-[40rem] ${drift} rounded-full bg-nova-ice/10 blur-[160px]`} />

      {ambient && <Starfield />}

      {/* Fine grid + vignette for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(70%_60%_at_50%_40%,#000_20%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_50%,transparent_45%,rgba(0,0,0,0.75)_100%)]" />
    </div>
  )
}
