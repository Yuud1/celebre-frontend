const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function readImageFile(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Use JPG, PNG, WebP ou GIF.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('A imagem deve ter no maximo 5 MB.')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Nao foi possivel ler a imagem.'))
    }
    reader.onerror = () => reject(new Error('Nao foi possivel ler a imagem.'))
    reader.readAsDataURL(file)
  })
}
