import React, { useState, useEffect } from "react";
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useParams, useNavigate, Link } from "react-router-dom";
import MarkdownView from "react-showdown";

export default function SaveRecipeDetail() {
  const [loading, setLoading] = useState(true);
  const [saveRecipe, setSaveRecipe] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "recipes", "recipes");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // console.log("Retrieved data:", data);
          setSaveRecipe(data.recipes);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (recipeId) => {
    try {
      const docRef = doc(db, "recipes", "recipes");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedRecipes = data.recipes.filter(
          (recipe) => recipe.recipeId !== recipeId
        );

        await deleteDoc(docRef);
        await setDoc(docRef, { recipes: updatedRecipes });
        setSaveRecipe(updatedRecipes);
        navigate(-1);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("Error deleting recipe:", error);
    }
  };

  const saveRecipeEls = saveRecipe.map((item) => {
    if (id === item.recipeId) {
      return (
        <div key={item.recipeId} className="save-recipe-detail-wrapper">
          <Link to="/saved-recipes"> &larr; Back to Saved Recipes</Link>
          <button
            className="save-recipe-detail-btn"
            onClick={() => handleDelete(item.recipeId)}
          >
            Delete
          </button>
          <MarkdownView className="markdown-component" markdown={item.recipe} />
        </div>
      );
    }
  });

  return (
    <div className="save-recipe-detail">
      {loading ? (
        <div className="save-recipe-detail-wrapper">
          <p>Loading...</p>
        </div>
      ) : saveRecipeEls.length > 0 ? (
        <div>{saveRecipeEls}</div>
      ) : (
        <div className="save-recipe-detail-wrapper">
          <p>No saved recipe found.</p>
        </div>
      )}
    </div>
  );
}
