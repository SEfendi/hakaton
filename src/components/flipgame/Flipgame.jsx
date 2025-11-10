import { useEffect, useState } from "react";
import "./Flipgame.scss";

export default function Flipgame() {
  // Колонки/строки по уровню
  const DIFFICULTIES = {
    "4x4": { rows: 4, cols: 4 },
    "6x6": { rows: 6, cols: 6 },
    "8x8": { rows: 8, cols: 8 },
  };

  // Большой пул эмодзи (40+ штук), чтобы хватило на 8x8 (32 пары)
  const EMOJI_POOL = [
    "😊","❤️","🔥","😎","🤩","💫","✨","🥰","😺","🐶","🐱","🐭","🐹","🐰","🦊","🐻",
    "🍒","🍉","🍋","🥝","🍇","🍓","🍑","🍍","⚽","🎮","🎧","🎲","🏀","🏓","🥏","🥊",
    "🌙","⭐","☀️","🌈","🌸","🌵","🍀","🪐","🧩","🎯","🎈","🎁","🛸","🚀","🧁","🍩"
  ];

  const [difficulty, setDifficulty] = useState("4x4");
  const { rows, cols } = DIFFICULTIES[difficulty];
  const pairCount = (rows * cols) / 2;

  const [cards, setCards] = useState([]);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const pickUnique = (arr, n) => {
    const pool = [...arr];
    const out = [];
    while (out.length < n && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  };

  const initGame = (d = difficulty) => {
    const { rows: r, cols: c } = DIFFICULTIES[d];
    const needPairs = (r * c) / 2;

    // берём N уникальных эмодзи и тасуем
    const unique = pickUnique(EMOJI_POOL, needPairs);
    const shuffled = [...unique, ...unique]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));

    setCards(shuffled);
    setFirst(null);
    setSecond(null);
    setLock(false);
    setMoves(0);
    setWon(false);
  };

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    if (cards.length && cards.every((c) => c.matched)) {
      setWon(true);
    }
  }, [cards]);

  const flipCard = (index) => {
    if (lock) return;
    const card = cards[index];
    if (card.flipped || card.matched) return;

    const updated = [...cards];
    updated[index] = { ...updated[index], flipped: true };
    setCards(updated);

    if (first === null) {
      setFirst(index);
    } else {
      setSecond(index);
      setLock(true);
      setTimeout(() => checkMatch(first, index), 500);
    }
  };

  const checkMatch = (i, j) => {
    setMoves((m) => m + 1);

    const a = cards[i];
    const b = cards[j];

    if (a && b && a.emoji === b.emoji) {
      setCards((prev) =>
        prev.map((c, idx) =>
          idx === i || idx === j ? { ...c, matched: true } : c
        )
      );
    } else {
      setCards((prev) =>
        prev.map((c, idx) =>
          idx === i || idx === j ? { ...c, flipped: false } : c
        )
      );
    }

    setFirst(null);
    setSecond(null);
    setLock(false);
  };

  // Для аккуратного размера контента: 400px поле, кол-во колонок — через CSS-переменную
  const boardStyle = {
    "--cols": cols,
    "--fontSize": `${Math.max(18, Math.round(140 / cols))}px`,
  };

  return (
    <div className="minigame">
      <div className="mini-wrapper">
        <div className="mini-topbar">
          <div className="left">
            <span className="badge">Ходы: {moves}</span>
          </div>

          <div className="controls">
            <select
              className="mini-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              aria-label="Выбор сложности"
            >
              <option value="4x4">4×4 (легко)</option>
              <option value="6x6">6×6 (средне)</option>
              <option value="8x8">8×8 (сложно)</option>
            </select>
            <button className="mini-btn" onClick={() => initGame()}>
              ⟲ Сыграть снова
            </button>
          </div>
        </div>

        <div className="mini-board" style={boardStyle}>
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`card ${card.flipped || card.matched ? "flipped" : ""}`}
              onClick={() => flipCard(index)}
            >
              <div className="inner">
                <div className="front">{card.emoji}</div>
                <div className="back">?</div>
              </div>
            </div>
          ))}

          {won && (
            <div className="win-overlay">
              <div className="win-card">
                <h3>Победа! 🎉</h3>
                <p>
                  Ты справился за <b>{moves}</b> ходов
                </p>
                <button className="mini-btn" onClick={() => initGame()}>
                  Ещё раз
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
