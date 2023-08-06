import React, { useState } from "react";
import ContentLoader from "../components/ContentLoader";
import MarkdownView from "react-showdown";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, useOutletContext } from "react-router-dom";
import { nanoid } from "nanoid";

const recipeRef = collection(db, "recipes");

export default function Search() {
  const [inputVal, setInputVal] = useState("");
  const [dish, setDish] = useState("");
  const [recipe, setRecipe] = useState("");
  const [response, setResponse] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();

  const apiURL = import.meta.env.VITE_REACT_API_URL;
  const apiKey = import.meta.env.VITE_REACT_API_KEY;
  const apiOrg = import.meta.env.VITE_REACT_API_ORG;
  const apiModel = import.meta.env.VITE_REACT_API_MODEL;

  async function saveRecipe() {
    if (auth.currentUser) {
      const newRecipe = {
        recipe,
        username: auth.currentUser.displayName,
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
        name: dish.charAt(0).toUpperCase() + dish.slice(1),
        recipeId: nanoid(),
      };

      const recipesDocRef = doc(recipeRef, "recipes");
      const recipesDocSnapshot = await getDoc(recipesDocRef);
      if (recipesDocSnapshot.exists() && recipesDocSnapshot.data().recipes) {
        const existingRecipes = recipesDocSnapshot.data().recipes;
        const updatedRecipes = [...existingRecipes, newRecipe];

        await updateDoc(recipesDocRef, { recipes: updatedRecipes });
        navigate("/saved-recipes");
      } else {
        await setDoc(recipesDocRef, { recipes: [newRecipe] });
      }
    } else {
      navigate("/saved-recipes");
    }
  }

  function back() {
    setError(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const messages = [
      {
        role: "system",
        content:
          "You: Show me a recipe for " +
          inputVal +
          "strictly in markdown format.",
      },
      { role: "user", content: inputVal },
    ];
    setDish(inputVal);
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
          messages: messages,
          model: `${apiModel}`,
        }),
      });
      const data = await response.json();
      console.log(data.choices[0].message.content);
      setRecipe(data.choices[0].message.content);
      setResponse(false);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  function handleInputUpdate(event) {
    const userInput = event.target.value;
    setInputVal(userInput);
  }

  if (loading) {
    return <ContentLoader back={back} fridgeView={false} isLoading={true} />;
  }

  if (error) {
    return <ContentLoader back={back} fridgeView={false} isLoading={false} />;
  }

  return (
    <section>
      <div className="search-wrapper">
        <div className="search">
          {!recipe && (
            <form
              style={{ border: isDarkMode && "1px solid rgb(187, 187, 187)" }}
              className="search-form"
              onSubmit={handleSubmit}
            >
              <input
                className="search-form__input"
                type="text"
                onChange={handleInputUpdate}
                placeholder="Search for recipes"
                style={{ color: isDarkMode && "white" }}
              />
              <button className="search-form__button" type="submit">
                Search
              </button>
            </form>
          )}
          {recipe && (
            <>
              <form
                style={{ border: isDarkMode && "1px solid rgb(187, 187, 187)" }}
                className="search-form"
                onSubmit={handleSubmit}
              >
                <input
                  className="search-form__input"
                  type="text"
                  onChange={handleInputUpdate}
                  placeholder="Search for recipes"
                  style={{
                    color: isDarkMode && "white",
                  }}
                />
                <button className="search-form__button" type="submit">
                  Search
                </button>
              </form>
              <div className="recipe-card">
                {/* <h3>Recipe for {dish}:</h3> */}
                <button className="save-recipe-btn" onClick={saveRecipe}>
                  save
                </button>
                <MarkdownView
                  className="markdown-component"
                  markdown={recipe}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
