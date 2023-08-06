import React, { useEffect, useState } from "react";
import MarkdownView from "react-showdown";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

const recipeRef = collection(db, "recipes");

export default function Meal() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigateBack = useNavigate();
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_REACT_API_URL;
  const apiKey = import.meta.env.VITE_REACT_API_KEY;
  const apiOrg = import.meta.env.VITE_REACT_API_ORG;
  const apiModel = import.meta.env.VITE_REACT_API_MODEL;

  async function saveRecipe() {
    if (auth.currentUser) {
      const dish = prompt("Please name your recipe.")
      const newRecipe = {
        recipe: response,
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

  const handleNavigateBack = () => {
    navigateBack(-1); // Navigate back to the previous link
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const messages = [
          {
            role: "system",
            content:
              "You: Give me a random recipe for this time of day day strictly in markdown format.",
          },
          {
            role: "user",
            content:
              "You: Give me a random recipe for this time of day strictly in markdown format.",
          },
        ];

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
        setResponse(data.choices[0].message.content);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-card">
        <div className="loading-text">
          <img
            src={
              "https://www.gstatic.com/android/keyboard/emojikitchen/20220815/u1f602/u1f602_u1f957.png"
            }
          />
          <h2>Searching Recipe...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        <div className="error-text">
          <img
            src={
              "https://www.gstatic.com/android/keyboard/emojikitchen/20220815/u1f97a/u1f97a_u1f957.png"
            }
          />
          <h3>Aww... No recipe found :( </h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      {response && (
        <div className="meal-card">
          <span className="meal-back-to-home" onClick={handleNavigateBack}>
            &larr; Home
          </span>
          <h3>Try this one!</h3>
          <div className="meal-response">
            <button onClick={saveRecipe} className="save-recipe-btn">save</button>
            <MarkdownView
              className="markdown-component"
              markdown={response}
              options={{ tasklists: true }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
