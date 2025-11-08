import { useEffect, useState } from "react";
import "./Flipgame.scss";


export default function Flipgame() {
    const emojiSets = [
        ["😊", "❤️", "🔥", "😎", "🤩", "💫", "✨", "🥰"],
        ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
        ["🍒", "🍉", "🍋", "🥝", "🍇", "🍓", "🍑", "🍍"],
        ["⚽", "🎮", "🎧", "🎲", "🏀", "🏓", "🥏", "🥊"],
    ];

    const [cards, setCards] = useState([]);
    const [first, setFirst] = useState(null);
    const [second, setSecond] = useState(null);
    const [lock, setLock] = useState(false);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);

    const initGame = () => {
        const set = emojiSets[Math.floor(Math.random() * emojiSets.length)];
        const shuffled = [...set, ...set]
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
    }, []);

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
        updated[index].flipped = true;
        setCards(updated);

        if (first === null) {
            setFirst(index);
        } else {
            setSecond(index);
            setLock(true);
            setTimeout(() => checkMatch(first, index), 600);
        }
    };

    const checkMatch = (i, j) => {
        setMoves((m) => m + 1);

        if (cards[i].emoji === cards[j].emoji) {
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

    return (
        <div className="minigame">
            <div className="mini-wrapper">
                <div className="mini-topbar">
                    <span className="badge">Ходы: {moves}</span>
                    <button className="mini-btn" onClick={initGame}>⟲ Сыграть снова</button>
                </div>

                <div className="mini-board">
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
                                <p>Ты справился за <b>{moves}</b> ходов</p>
                                <button className="mini-btn" onClick={initGame}>Ещё раз</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
