-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" TEXT NOT NULL,
    "pointsTeam1" INTEGER NOT NULL,
    "pointsTeam2" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_Team1Players" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Team1Players_A_fkey" FOREIGN KEY ("A") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Team1Players_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_Team2Players" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Team2Players_A_fkey" FOREIGN KEY ("A") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Team2Players_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_Team1Players_AB_unique" ON "_Team1Players"("A", "B");

-- CreateIndex
CREATE INDEX "_Team1Players_B_index" ON "_Team1Players"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Team2Players_AB_unique" ON "_Team2Players"("A", "B");

-- CreateIndex
CREATE INDEX "_Team2Players_B_index" ON "_Team2Players"("B");
