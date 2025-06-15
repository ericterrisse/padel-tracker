'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type AddMatchData = {
  team1PlayerIds: string[]
  team2PlayerIds: string[]
  score: string
  pointsTeam1: number
  pointsTeam2: number
}

export async function addMatch(data: AddMatchData) {
  try {
    await prisma.match.create({
      data: {
        score: data.score,
        pointsTeam1: data.pointsTeam1,
        pointsTeam2: data.pointsTeam2,
        team1Players: {
          connect: data.team1PlayerIds.map(id => ({ id }))
        },
        team2Players: {
          connect: data.team2PlayerIds.map(id => ({ id }))
        }
      }
    })
    revalidatePath('/matches')
  } catch (error) {
    console.error('Error adding match:', error)
    throw new Error('Failed to add match')
  }
} 