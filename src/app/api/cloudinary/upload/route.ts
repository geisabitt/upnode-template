import { withModuleApi } from '@/core/lib/module-server'
import { withAdmin } from '@/core/lib/admin-access'
import { NextResponse } from 'next/server'
import { uploadFilesToCloudinary } from '@/core/lib/cloudinary'

const POST = withAdmin(async function POST(request: Request) {
  const formData = await request.formData()
  const files = formData.getAll('files') as Array<File | string>

  if (!files.length) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
  }

  try {
    const blobs = files.filter((file): file is File => file instanceof File)

    if (!blobs.length) {
      return NextResponse.json({ error: 'Formato de arquivo inválido.' }, { status: 400 })
    }

    if (blobs.length > 20 || blobs.some(file => file.size > 10 * 1024 * 1024 ||
        !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type))) {
      return NextResponse.json({ error: 'Envie até 20 imagens válidas de no máximo 10 MB cada.' }, { status: 400 })
    }

    const urls = await uploadFilesToCloudinary(blobs)
    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json({ error: 'Falha ao enviar imagens para o Cloudinary.' }, { status: 500 })
  }
})

const modulePOST = withModuleApi('/api/cloudinary/upload', POST)
export { modulePOST as POST }
