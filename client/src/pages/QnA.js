import React, { useState, useEffect } from "react";
import axios from "axios";

function QnA() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5001/qna")
      .then((response) => setQuestions(response.data))
      .catch((error) => console.error(error));
  }, []);

  const submitQuestion = () => {
    axios
      .post("http://localhost:5001/qna", { question: newQuestion })
      .then(() => {
        setQuestions([...questions, { question: newQuestion }]);
        setNewQuestion("");
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <h1>Q&A</h1>
      <ul>
        {questions.map((q, index) => (
          <li key={index}>{q.question}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Ask a question"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
      />
      <button onClick={submitQuestion}>Submit</button>
    </div>
  );
}

export default QnA;
