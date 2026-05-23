interface GenerationLoaderProps {
  title?: string
  progress?: number
}

export function GenerationLoader({
  title = 'Construindo sua ideia.',
  progress = 0,
}: GenerationLoaderProps) {
  return (
    <div className="gen-loader">
      <div className="gen-loader__glow" aria-hidden="true" />
      <div className="gen-loader__logo" aria-hidden="true">
        cele<span>bre</span>
      </div>
      <p className="gen-loader__title">{title}</p>
      <div className="gen-loader__bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <span className="gen-loader__bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="gen-loader__tip">
        <strong>Voce sabia?</strong> Refine textos, cores e espacamentos depois de publicar pelo painel.
      </p>
    </div>
  )
}
