import { NextResponse } from 'next/server'
import { uploadFilesToCloudinary } from '@/core/lib/cloudinary'

export async function POST(request: Request) {
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

    const urls = await uploadFilesToCloudinary(blobs)
    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json({ error: 'Falha ao enviar imagens para o Cloudinary.' }, { status: 500 })
  }
}
