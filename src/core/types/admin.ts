// src/types/admin.ts

export type Category = {
  id: string
  name: string
  slug?: string
}

export type ProductImage = {
  id: string
  url: string
}

export type AdminProduct = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  materials: string | null
  handmade: boolean
  youtubeUrl: string | null
  categories: Category[]
  images: ProductImage[]
  colors: { id: string; name: string; hex: string }[]
  sizes: { id: string; name: string }[]
}

export type ProductFormData = {
  name: string
  slug: string
  description: string
  price: string
  stock: string
  materials: string
  handmade: boolean
  categories: string[]
  youtubeUrl: string
  colors: { name: string; hex: string }[]
  sizes: { name: string }[]
}

export type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  coverImage?: string | null
  categoryId?: string | null
  published: boolean
}

export type PostFormData = {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  categoryId: string
  published: boolean
}

export type FAQItem = {
  question: string
  answer: string
}