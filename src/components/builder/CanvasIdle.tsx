interface CanvasIdleProps {
  message: string
}

export function CanvasIdle({ message }: CanvasIdleProps) {
  return (
    <div className="gen-idle">
      <div className="gen-loader__glow" aria-hidden="true" />
      <div className="gen-idle__logo" aria-hidden="true">
        cele<span>bre</span>
      </div>
      <p className="gen-idle__text">{message}</p>
    </div>
  )
}
