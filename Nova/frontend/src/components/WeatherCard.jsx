import { CloudDrizzle, CloudLightning, Cloudy, Droplets, Sun, SunDim, Wind } from 'lucide-react'

const ICONS = {
  Clear: Sun,
  'Partly Cloudy': SunDim,
  Overcast: Cloudy,
  'Light Rain': CloudDrizzle,
  Thunderstorms: CloudLightning,
}

export default function WeatherCard({ weather }) {
  if (!weather) {
    return <div className="glass h-44 animate-pulse" />
  }

  const Icon = ICONS[weather.condition] ?? Sun

  return (
    <article className="glass glass-hover relative overflow-hidden p-6">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-nova-violet/20 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
            Conditions
          </p>
          <p className="mt-2 text-sm text-white/60">{weather.city}</p>
          <p className="mt-3 font-display text-5xl font-semibold tabular-nums text-white">
            {Math.round(weather.temperature_c)}°
          </p>
          <p className="mt-1 text-sm text-nova-orchid">{weather.condition}</p>
        </div>
        <Icon className="h-12 w-12 text-nova-ice" strokeWidth={1.25} />
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-3 border-t hairline pt-4 text-center">
        <div>
          <Droplets className="mx-auto h-4 w-4 text-white/40" />
          <p className="mt-1.5 text-sm font-medium tabular-nums text-white/80">
            {weather.humidity}%
          </p>
          <p className="text-[0.6rem] uppercase tracking-widest text-white/35">Humidity</p>
        </div>
        <div>
          <Wind className="mx-auto h-4 w-4 text-white/40" />
          <p className="mt-1.5 text-sm font-medium tabular-nums text-white/80">
            {weather.wind_kph}
          </p>
          <p className="text-[0.6rem] uppercase tracking-widest text-white/35">km/h</p>
        </div>
        <div>
          <Sun className="mx-auto h-4 w-4 text-white/40" />
          <p className="mt-1.5 text-sm font-medium tabular-nums text-white/80">
            {weather.uv_index}
          </p>
          <p className="text-[0.6rem] uppercase tracking-widest text-white/35">UV</p>
        </div>
      </div>
    </article>
  )
}
