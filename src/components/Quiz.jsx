import { useEffect, useMemo, useState } from "react";
import { autoridades } from "../data"; // ajusta la ruta si es distinta

// --- util: barajar (Fisher–Yates)
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- util: tomar n elementos al azar (sin el "exceptValue")
function sampleN(list, n, exceptValue) {
  const pool = list.filter((x) => x && x !== exceptValue);
  return shuffle(pool).slice(0, n);
}

// --- construir alternativas de nombre
function buildNameOptions(all, correctName) {
  const nombres = [...new Set(all.map((a) => (a.name || "").trim()))].filter(Boolean);
  const distractores = sampleN(nombres.filter((n) => n !== correctName), 3);
  return shuffle([correctName, ...distractores]);
}

// --- construir alternativas de cargo
function buildCargoOptions(all, correctCargo) {
  const cargos = [...new Set(all.map((a) => (a.cargo || "").trim()))].filter(Boolean);
  const distractores = sampleN(cargos.filter((c) => c !== correctCargo), 3);
  return shuffle([correctCargo, ...distractores]);
}

// --- elegir tipo de pregunta
function pickQuestionType() {
  return Math.random() < 0.5 ? "name" : "cargo"; // 50/50
}

export default function Quiz() {
  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [questionType, setQuestionType] = useState("name");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  // al montar: barajar autoridades 1 vez
  useEffect(() => {
    const cleaned = (autoridades || []).filter(
      (a) => (a && a.name && a.name.trim()) || (a && a.cargo && a.cargo.trim())
    );
    setPool(shuffle(cleaned));
  }, []);

  const current = pool[idx] || null;

  // preparar pregunta cuando cambia current
  useEffect(() => {
    if (!current) return;
    const t = pickQuestionType();
    setQuestionType(t);

    if (t === "name") {
      const correctName = (current.name || "").trim();
      setOptions(buildNameOptions(pool, correctName));
    } else {
      const correctCargo = (current.cargo || "").trim();
      setOptions(buildCargoOptions(pool, correctCargo));
    }
    setSelected("");
    setAnswered(false);
    setFeedback(null);
  }, [idx, current]);

  const total = pool.length;

  const progressPct = useMemo(() => {
    if (!total) return 0;
    return Math.round(((idx + 1) / total) * 100);
  }, [idx, total]);

  function checkAnswer(opt) {
    if (!current || answered) return;
    setSelected(opt);
    const correct =
      questionType === "name"
        ? (current.name || "").trim()
        : (current.cargo || "").trim();

    const ok = opt === correct;
    setFeedback(ok ? "correct" : "wrong");
    setAnswered(true);
    if (ok) setScore((s) => s + 1);

    setTimeout(() => {
      setIdx((i) => (i + 1) % total);
    }, 900);
  }

  function resetGame() {
    setPool(shuffle(pool));
    setIdx(0);
    setScore(0);
    setSelected("");
    setFeedback(null);
    setAnswered(false);
  }

  if (!current) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Juego de Autoridades</h1>
        <p className="text-gray-600">No hay datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Juego de Autoridades</h1>
        <div className="text-sm text-gray-600">
          Puntaje: <span className="font-semibold">{score}</span> / {total}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-gray-800 h-2 rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500 mb-6">{progressPct}%</div>

      <div className="rounded-2xl shadow p-6 border">
        {current.image ? (
          <img
            src={current.image}
            alt={current.name || "Autoridad"}
            className="w-40 h-40 object-cover rounded-xl mx-auto mb-4"
          />
        ) : (
          <div className="w-40 h-40 rounded-xl mx-auto mb-4 bg-gray-100 grid place-items-center">
            <span className="text-gray-400 text-sm">Sin imagen</span>
          </div>
        )}

        {questionType === "name" ? (
          <h2 className="text-xl font-semibold text-center mb-3">
            ¿Quién es esta autoridad?
          </h2>
        ) : (
          <h2 className="text-xl font-semibold text-center mb-3">
            ¿Qué <span className="font-bold">cargo</span> ocupa {current.name}?
          </h2>
        )}

        <div className="grid grid-cols-1 gap-2">
          {options.map((opt) => {
            const isCorrect =
              feedback && opt === ((questionType === "name" ? current.name : current.cargo) || "").trim();
            const isSelected = selected === opt;

            return (
              <button
                key={opt}
                onClick={() => checkAnswer(opt)}
                disabled={answered}
                className={[
                  "px-4 py-3 rounded-xl border text-left transition",
                  "disabled:opacity-70 disabled:cursor-not-allowed",
                  isSelected && feedback === "wrong" ? "border-red-400 bg-red-50" : "",
                  isCorrect && feedback ? "border-emerald-500 bg-emerald-50" : "hover:bg-gray-50",
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
          <div>
            Pregunta {idx + 1} de {total}
          </div>
          <button
            onClick={resetGame}
            className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
