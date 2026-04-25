import crypto from 'crypto'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

const cloudinaryUploadUrl = CLOUDINARY_CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : ''

/**
 * Gera assinatura SHA1 para uploads signed do Cloudinary
 * 
 * IMPORTANTE: Apenas os parâmetros listados abaixo devem ser incluídos na assinatura.
 * NÃO inclua api_key na assinatura - apenas public_id, timestamp e upload_preset
 * 
 * Formato esperado:
 * public_id=...&timestamp=...&upload_preset=... + API_SECRET
 */
function generateSignature(publicId: string, timestamp: number, uploadPreset: string): string {
  // Ordem IMPORTANTÍSSIMA: alfabética e sem api_key
  const paramsToSign = {
    public_id: publicId,
    timestamp: timestamp.toString(),
    upload_preset: uploadPreset,
  }

  // Gerar string_to_sign em ordem alfabética
  const sortedKeys = Object.keys(paramsToSign).sort()
  const stringToSign = sortedKeys
    .map(key => `${key}=${paramsToSign[key as keyof typeof paramsToSign]}`)
    .join('&')

  // CONCATENAR com API_SECRET (sem separador)
  const finalString = stringToSign + CLOUDINARY_API_SECRET

  if (process.env.NODE_ENV === 'development') {
    console.log('[Cloudinary Debug]')
    console.log('- Public ID:', publicId)
    console.log('- Timestamp:', timestamp)
    console.log('- Upload Preset:', uploadPreset)
    console.log('- String to Sign:', stringToSign)
    console.log('- Final String:', finalString)
    console.log('- Signature:', crypto.createHash('sha1').update(finalString).digest('hex'))
  }

  return crypto.createHash('sha1').update(finalString).digest('hex')
}

/**
 * Upload unsigned (mais simples para cliente)
 * Recomendado: use este método se o preset no Cloudinary está em modo "Unsigned"
 */
export async function uploadFileToCloudinaryUnsigned(file: Blob, filename?: string) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET must be defined in the environment.')
  }

  const payload = new FormData()
  payload.append('file', file, filename || 'upload')
  payload.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(cloudinaryUploadUrl, {
    method: 'POST',
    body: payload,
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Response body:', body)
    throw new Error(`Cloudinary upload failed: ${response.status} ${body}`)
  }

  const result = await response.json()
  return result.secure_url as string
}

/**
 * Upload signed (mais seguro, requer api_key e secret)
 * Use este método se o preset no Cloudinary está em modo "Signed"
 */
export async function uploadFileToCloudinarySigned(file: Blob, filename?: string) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be defined.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const publicId = `product-${timestamp}-${Math.random().toString(36).substring(2, 15)}`
  const signature = generateSignature(publicId, timestamp, CLOUDINARY_UPLOAD_PRESET)

  const payload = new FormData()
  payload.append('file', file, filename || 'upload')
  payload.append('api_key', CLOUDINARY_API_KEY)
  payload.append('public_id', publicId)
  payload.append('timestamp', timestamp.toString())
  payload.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  payload.append('signature', signature)

  const response = await fetch(cloudinaryUploadUrl, {
    method: 'POST',
    body: payload,
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Response body:', body)
    throw new Error(`Cloudinary upload failed: ${response.status} ${body}`)
  }

  const result = await response.json()
  return result.secure_url as string
}

/**
 * Método principal - detecta automaticamente signed vs unsigned
 * PADRÃO: tenta unsigned primeiro (mais comum para upload de cliente)
 */
export async function uploadFileToCloudinary(file: Blob, filename?: string) {
  // Tenta unsigned primeiro (recomendado para cliente)
  if (CLOUDINARY_UPLOAD_PRESET) {
    try {
      return await uploadFileToCloudinaryUnsigned(file, filename)
    } catch (error) {
      // Se falhar com unsigned, tenta signed
      if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        console.log('Unsigned upload failed, trying signed upload...')
        return await uploadFileToCloudinarySigned(file, filename)
      }
      throw error
    }
  }

  throw new Error('No upload method available')
}

export async function uploadFilesToCloudinary(files: Array<Blob>) {
  return Promise.all(
    files.map((file, index) => uploadFileToCloudinary(file, `product-upload-${Date.now()}-${index}`))
  )
}
