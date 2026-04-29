"use client";

import React, { useMemo, useState } from "react";

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

const ROWS = 10;
const COLS = 10;
const MINES = 15;

function getNeighbors(row: number, col: number): [number, number][] {
  const neighbors: [number, number][] = [];

  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r === row && c === col) continue;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        neighbors.push([r, c]);
      }
    }
  }

  return neighbors;
}

function createBoard(): Cell[][] {
  const board: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );

  let placed = 0;

  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);

    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;

      board[r][c].adjacent = getNeighbors(r, c).filter(
        ([nr, nc]) => board[nr][nc].mine,
      ).length;
    }
  }

  return board;
}

export default function MinesweeperPage() {
  const [board, setBoard] = useState<Cell[][]>(() => createBoard());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const revealedCount = useMemo(
    () => board.flat().filter((cell) => cell.revealed).length,
    [board],
  );

  function revealCell(row: number, col: number) {
    if (gameOver || won) return;

    const next = board.map((r) => r.map((cell) => ({ ...cell })));
    const cell = next[row][col];

    if (cell.revealed || cell.flagged) return;

    if (cell.mine) {
      cell.revealed = true;
      revealAllMines(next);
      setGameOver(true);
      setBoard(next);
      return;
    }

    floodReveal(next, row, col);

    const safeCells = ROWS * COLS - MINES;
    const newRevealed = next.flat().filter((c) => c.revealed).length;

    if (newRevealed === safeCells) {
      setWon(true);
    }

    setBoard(next);
  }

  function floodReveal(next: Cell[][], row: number, col: number) {
    const cell = next[row][col];

    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;

    if (cell.adjacent !== 0) return;

    for (const [nr, nc] of getNeighbors(row, col)) {
      floodReveal(next, nr, nc);
    }
  }

  function toggleFlag(
    event: React.MouseEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) {
    event.preventDefault();

    if (gameOver || won) return;

    const next = board.map((r) => r.map((cell) => ({ ...cell })));
    const cell = next[row][col];

    if (!cell.revealed) {
      cell.flagged = !cell.flagged;
    }

    setBoard(next);
  }

  function revealAllMines(next: Cell[][]) {
    for (const row of next) {
      for (const cell of row) {
        if (cell.mine) {
          cell.revealed = true;
        }
      }
    }
  }

  function resetGame() {
    setBoard(createBoard());
    setGameOver(false);
    setWon(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-3">Minesweeper</h1>

      <p className="mb-6 text-lg text-slate-300">
        {gameOver && "💥 Game over"}
        {won && "🎉 You won!"}
        {!gameOver && !won && `Revealed: ${revealedCount}`}
      </p>

      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 36px)`,
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              type="button"
              onClick={() => revealCell(r, c)}
              onContextMenu={(event) => toggleFlag(event, r, c)}
              className={[
                "h-9 w-9 rounded-md text-base font-bold transition",
                cell.revealed
                  ? "bg-slate-200 text-slate-950 cursor-default"
                  : "bg-slate-700 hover:bg-slate-600 text-white",
              ].join(" ")}
            >
              {cell.revealed
                ? cell.mine
                  ? "💣"
                  : cell.adjacent || ""
                : cell.flagged
                  ? "🚩"
                  : ""}
            </button>
          )),
        )}
      </div>

      <button
        type="button"
        onClick={resetGame}
        className="mt-6 rounded-lg bg-white px-4 py-2 font-semibold text-slate-950 hover:bg-slate-200"
      >
        Reset
      </button>

      <p className="mt-4 text-sm text-slate-400">Right-click to flag a cell.</p>
    </main>
  );
}
