
import React, { useState } from 'react';
import { autoridades } from './data';

function getRandomOptions(correct, all) {
  const others = all.filter(a => a.name !== correct.name);
  const options = [correct, ...others.sort(() => 0.5 - Math.random()).slice(0, 3)];
  return options.sort(() => 0.5 - Math.random());
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);

  const current = autoridades[currentIndex];
  const options = getRandomOptions(current, autoridades);

  const handleClick = (option) => {
    if (showAnswer) return;
    setSelected(option);
    setShowAnswer(true);
    if (option.name === current.name) setScore(score + 1);
  };

  const nextQuestion = () => {
    setCurrentIndex((currentIndex + 1) % autoridades.length);
    setShowAnswer(false);
    setSelected(null);
  };

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h1>¿Quién es esta autoridad?</h1>
      <img src={"/images/" + current.image} alt="autoridad" style={{ width: 250, height: 320, objectFit: 'cover' }} />
      <div style={{ marginTop: 20 }}>
        {options.map((opt, i) => (
          <div key={i}>
            <button
              onClick={() => handleClick(opt)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: showAnswer
                  ? opt.name === current.name
                    ? 'green'
                    : (selected && opt.name === selected.name ? 'red' : 'lightgray')
                  : 'white',
                color: showAnswer ? 'white' : 'black',
                width: 300
              }}
            >
              {opt.name}
            </button>
          </div>
        ))}
      </div>
      {showAnswer && (
        <div style={{ marginTop: 20 }}>
          <p>{selected.name === current.name ? "✅ ¡Correcto!" : `❌ Incorrecto. Era ${current.name}`}</p>
          <button onClick={nextQuestion}>Siguiente</button>
        </div>
      )}
      <p style={{ marginTop: 30 }}>Puntaje: {score}</p>
    </div>
  );
}

export default App;
