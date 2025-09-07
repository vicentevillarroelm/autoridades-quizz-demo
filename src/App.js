import React, { useEffect, useMemo, useState } from "react";
import { autoridades } from "./data";

// --- util: barajar (Fisher–Yates)
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- opciones para preguntas de nombre (devuelve objetos autoridad)
function getRandomNameOptions(correct, all) {
  const others = all.filter((a) => a.name !== correct.name);
  const options = [correct, ...shuffle(others).slice(0, 3)];
  return shuffle(options);
}

// --- opciones para preguntas de cargo (devuelve strings)
function getRandomCargoOptions(correctCargo, all) {
  // lista única de cargos
  const cargos = [...new Set(all.map((a) => (a.cargo || "").trim()))].filter(Boolean);
  const distractores = shuffle(cargos.filter((c) => c !== correctCargo)).slice(0, 3);
  return shuffle([correctCargo, ...distractores]);
}

// --- elegir tipo de pregunta 50/50
function pickQuestionType() {
  return Math.random() < 0.5 ? "name" : "cargo"; // "name" | "cargo"
}

function App() {
  // barajar autoridades una sola vez
  const [pool, setPool] = useState([]);
  useEffect(() => {
    const cleaned = (autoridades || []).filter(
      (a) => a && (a.name?.trim() || a.cargo?.trim())
    );
    setPool(shuffle(cleaned));
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionType, setQuestionType] = useState("name"); // "name" | "cargo"
  const [options, setOptions] = useState([]); // para "name": objetos; para "cargo": strings
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null); // puede ser objeto (name) o string (cargo)

  const total = pool.length;
  const current = pool[currentIndex] || null;

  // preparar cada pregunta al cambiar current
  useEffect(() => {
    if (!current) return;
    const t = pickQuestionType();
    setQuestionType(t);

    if (t === "name") {
      setOptions(getRandomNameOptions(current, pool));
    } else {
      const correctCargo = (current.cargo || "").trim();
      setOptions(getRandomCargoOptions(correctCargo, pool));
    }

    setShowAnswer(false);
    setSelected(null);
  }, [currentIndex, current, pool]);

  const progressPct = useMemo(() => {
    if (!total) return 0;
    return Math.round(((currentIndex + 1) / total) * 100);
  }, [currentIndex, total]);

  const handleClick = (option) => {
    if (showAnswer || !current) return;
    setSelected(option);
    setShowAnswer(true);

    if (questionType === "name") {
      // option es objeto autoridad
      if (option.name === current.name) setScore((s) => s + 1);
    } else {
      // option es string (cargo)
      if ((option || "").trim() === (current.cargo || "").trim()) setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (!total) return;
    setCurrentIndex((i) => (i + 1) % total);
    setShowAnswer(false);
    setSelected(null);
  };

  // estilos básicos reutilizables
  const btnBase = {
    padding: 10,
    margin: 5,
    width: 320,
    border: "1px solid #ddd",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
  };

  const correctBg = { backgroundColor: "#10b981", color: "white", borderColor: "#059669" }; // verde
  const wrongBg = { backgroundColor: "#ef4444", color: "white", borderColor: "#dc2626" }; // rojo
  const neutralBg = { backgroundColor: "white", color: "black" };
  const disabledStyle = showAnswer ? { opacity: 0.8, cursor: "not-allowed" } : {};

  if (!current) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <h1>Juego de Autoridades</h1>
        <p>No hay datos disponibles.</p>
      </div>
    );
  }

  const isCorrectOption = (opt) => {
    if (questionType === "name") {
      return opt.name === current.name;
    }
    return (opt || "").trim() === (current.cargo || "").trim();
  };

  const isSelectedOption = (opt) => {
    if (!selected) return false;
    if (questionType === "name") {
      return selected.name === opt.name;
    }
    return selected === opt; // string
  };

  const renderOptionLabel = (opt) => {
    return questionType === "name" ? opt.name : opt; // string si cargo
  };

  return (
    <div style={{ textAlign: "center", padding: 20, maxWidth: 800, margin: "0 auto" }}>
      {/* Título */}
      <h1 style={{ marginBottom: 8 }}>
        {questionType === "name" ? "¿Quién es esta autoridad?" : `¿Qué cargo ocupa ${current.name}?`}
      </h1>

      {/* Progreso */}
      <div
        style={{
          width: "100%",
          height: 8,
          background: "#eee",
          borderRadius: 999,
          overflow: "hidden",
          margin: "12px 0 4px",
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            background: "#111",
            transition: "width 300ms",
          }}
        />
      </div>
      <div style={{ textAlign: "right", color: "#666", fontSize: 12, marginBottom: 12 }}>
        {progressPct}%
      </div>

      {/* Imagen */}
      <img
        src={"/images/" + current.image}
        alt="autoridad"
        style={{ width: 250, height: 320, objectFit: "cover", borderRadius: 12 }}
      />

      {/* Opciones */}
      <div style={{ marginTop: 20 }}>
        {options.map((opt, i) => {
          const isCorrect = showAnswer && isCorrectOption(opt);
          const isSelected = isSelectedOption(opt);

          let style = { ...btnBase, ...neutralBg, ...disabledStyle };
          if (showAnswer) {
            if (isCorrect) style = { ...btnBase, ...correctBg, ...disabledStyle };
            else if (isSelected) style = { ...btnBase, ...wrongBg, ...disabledStyle };
            else style = { ...btnBase, backgroundColor: "#f3f4f6", color: "#111", ...disabledStyle };
          }

          return (
            <div key={i}>
              <button onClick={() => handleClick(opt)} style={style} disabled={showAnswer}>
                {renderOptionLabel(opt)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feedback y siguiente */}
      {showAnswer && (
        <div style={{ marginTop: 20 }}>
          {questionType === "name" ? (
            <p>
              {selected?.name === current.name
                ? "✅ ¡Correcto!"
                : `❌ Incorrecto. Era ${current.name}`}
            </p>
          ) : (
            <p>
              {(selected || "").trim() === (current.cargo || "").trim()
                ? "✅ ¡Correcto!"
                : `❌ Incorrecto. El cargo correcto: ${current.cargo}`}
            </p>
          )}
          <button onClick={nextQuestion} style={{ padding: 10, marginTop: 8 }}>
            Siguiente
          </button>
        </div>
      )}

      <p style={{ marginTop: 30 }}>Puntaje: {score}</p>
    </div>
  );
}

export default App;

