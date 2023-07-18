import React, { useState, useEffect, useRef } from "react";
import MarkdownView from "react-showdown";
import EmptyState from "../components/EmptyState";
import ContentLoader from "../components/contentLoader";
import DeleteIcon from "../assets/DeleteIcon.svg";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion"

export default function Fridge() {
  const [inputVal, setInputVal] = useState("");
  const [items, setItems] = useState([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const [toggleInput, setToggleInput] = useState(false);
  const { isDarkMode } = useOutletContext();

  const apiURL = import.meta.env.VITE_REACT_API_URL;
  const apiKey = import.meta.env.VITE_REACT_API_KEY;
  const apiOrg = import.meta.env.VITE_REACT_API_ORG;
  const apiModel = import.meta.env.VITE_REACT_API_MODEL;

  const cardDarkTheme = {
    boxShadow: isDarkMode && "-5px 8px 2px 1px rgba(64,68,75, 0.219)",
    backgroundColor: isDarkMode ? "#40444b" : "#FFFFFF",
    border: "none",
  };

  function handleInputUpdate(event) {
    const rawInput = event.target.value;
    const formattedInput =
      rawInput.charAt(0).toUpperCase() + rawInput.slice(1).toLowerCase();
    setInputVal(formattedInput);
  }

  function toggle(event) {
    event.preventDefault();
    setToggleInput((prevVal) => !prevVal);
    if (!toggleInput) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 0);
    }
  }

  function deleteItem(item) {
    setItems((prevItems) => prevItems.filter((prevItem) => prevItem !== item));
  }

  function submit() {
    if (!response) {
      fetchChatGPTResponse(items);
    } else {
      fetchChatGPTResponse(["show me another recipe"]);
    }
  }

  function clearAll(event) {
    event.preventDefault();
    setItems([]);
    setResponse("");
  }

  function back() {
    setResponse("");
    setError(false);
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!inputVal) {
        alert("Input required");
        return;
      } else if (items.includes(inputVal)) {
        alert("Item already added");
        return;
      } else {
        setItems((prevItems) => [...prevItems, inputVal]);
        setInputVal("");
      }
      setInputVal("");
    }
  };

  const fetchChatGPTResponse = async (messages) => {
    try {
      setLoading(true);

      const response = await fetch(`${apiURL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          organization: `${apiOrg}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You: Show me a recipe for " +
                items.join(", ") +
                " only. Strictly in markdown format.",
            },
            { role: "user", content: messages[0] },
          ],
          model: `${apiModel}`,
        }),
      });

      const data = await response.json();
      const message = data.choices[0]?.message?.content || "";
      setResponse(message.replace("AI:", "").trim());
      setLoading(false);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    submit;
  }, [items]);

  const fridgeItems = items.map((item) => (
    <div key={item} className="fridge__items">
      {item}
      <button
        className="fridge__button--delete"
        type="button"
        onClick={() => deleteItem(item)}
      >
        <img className="delete-icon" src={DeleteIcon} alt="" />
      </button>
    </div>
  ));

  const fridgeList = <div className="fridge-list">{fridgeItems}</div>;

  const recipe = (
    <div className="recipe">
      {/* <p className="recipe-content">{response}</p> */}
      <MarkdownView
        className="markdown-component"
        markdown={response}
        // options={{
        //   tables: true,
        //   emoji: true,
        //   tasklists: true,
        //   simpleLineBreaks: true,
        // }}
      />
    </div>
  );

  const fridgeListCard = (
    <div className="submit-wrapper">
      <div className="fridge-card" style={cardDarkTheme}>
        <h3 className="fridge-card__title" style={cardDarkTheme}>
          {!response ? "Ingredients" : "Recipe:"}
        </h3>
        {!response ? fridgeList : recipe}
      </div>

      <div className="fridge-card-controls" style={cardDarkTheme}>
        <button
          type="button"
          onClick={submit}
          className="fridge__button fridge__button--submit"
        >
          {!response ? "Get recipe" : "New"}
        </button>

        {response && (
          <>
            <button
              type="button"
              onClick={back}
              className="fridge__button fridge__button--clear"
            >
              Back
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="fridge__button fridge__button--clear"
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <ContentLoader back={back} fridgeView={true} isLoading={true} />;
  }

  if (error) {
    return <ContentLoader back={back} fridgeView={true} isLoading={false} />;
  }

  return (
    <section>
      <div className="fridge">
        {items.length == 0 ? (
          <EmptyState IngredientState={true} />
        ) : (
          fridgeListCard
        )}

        <motion.div
          className="form-wrap"
          onClick={toggle}
          initial={{

          }}
          animate={{
            opacity: toggleInput ? 1 : 0,
            backgroundColor: toggleInput && "rgba(0, 0, 0, 0.358)",
          }}
          transition={{
            duration: 0.12
          }}
          style={{ display: toggleInput ? "block" : "none" }}
        >
          <form className="fridge__form">
            <div className="fridge__controls">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={handleInputUpdate}
                onKeyDown={handleKeyDown}
                className="fridge__input"
              />
            </div>
          </form>
        </motion.div>

        <button
          style={{ display: toggleInput && "none" }}
          type="button"
          onClick={toggle}
          className="fridge__button fridge__button--add"
        >
          +
        </button>
      </div>
    </section>
  );
}
