/*
  Warnings:

  - You are about to drop the column `pointsTeam1` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `pointsTeam2` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Match` table. All the data in the column will be lost.
  - Added the required column `gamesTeam1` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gamesTeam2` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sets` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setsTeam1` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setsTeam2` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sets" TEXT NOT NULL,
    "setsTeam1" INTEGER NOT NULL,
    "setsTeam2" INTEGER NOT NULL,
    "gamesTeam1" INTEGER NOT NULL,
    "gamesTeam2" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Match" ("createdAt", "date", "id") SELECT "createdAt", "date", "id" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
