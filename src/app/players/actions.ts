'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addPlayer(name: string) {
  try {
    await prisma.player.create({
      data: { name }
    })
    revalidatePath('/players')
  } catch (error) {
    console.error('Error adding player:', error)
    throw new Error('Failed to add player')
  }
} 