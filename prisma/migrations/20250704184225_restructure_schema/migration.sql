/*
  Warnings:

  - You are about to drop the `_Team1Players` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Team2Players` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `gamesTeam1` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `gamesTeam2` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `sets` on the `Match` table. All the data in the column will be lost.
  - Added the required column `team1Id` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team2Id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_Team1Players_B_index";

-- DropIndex
DROP INDEX "_Team1Players_AB_unique";

-- DropIndex
DROP INDEX "_Team2Players_B_index";

-- DropIndex
DROP INDEX "_Team2Players_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_Team1Players";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_Team2Players";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Pair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    CONSTRAINT "Pair_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pair_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "index" INTEGER NOT NULL,
    "team1Games" INTEGER NOT NULL,
    "team2Games" INTEGER NOT NULL,
    "tiebreakTeam1" INTEGER,
    "tiebreakTeam2" INTEGER,
    "matchId" TEXT NOT NULL,
    CONSTRAINT "Set_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setsTeam1" INTEGER NOT NULL,
    "setsTeam2" INTEGER NOT NULL,
    "superTeam1" INTEGER,
    "superTeam2" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team1Id" TEXT NOT NULL,
    "team2Id" TEXT NOT NULL,
    CONSTRAINT "Match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Pair" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Pair" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("createdAt", "date", "id", "setsTeam1", "setsTeam2") SELECT "createdAt", "date", "id", "setsTeam1", "setsTeam2" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Pair_name_key" ON "Pair"("name");
