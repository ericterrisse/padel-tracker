'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type AddMatchData = {
  team1PlayerIds: string[]
  team2PlayerIds: string[]
  sets: string // JSON string of sets array
  setsTeam1: number
  setsTeam2: number
  gamesTeam1: number
  gamesTeam2: number
}

export async function addMatch(data: AddMatchData) {
  try {
    await prisma.match.create({
      data: {
        sets: data.sets,
        setsTeam1: data.setsTeam1,
        setsTeam2: data.setsTeam2,
        gamesTeam1: data.gamesTeam1,
        gamesTeam2: data.gamesTeam2,
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