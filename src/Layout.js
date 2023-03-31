import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import NoteList from "./NoteList";
import { v4 as uuidv4 } from "uuid";
import { currentDate } from "./utils";
import React from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

// Update the custom hook to use localStorage instead of sessionStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}



const localStorageKey = "lotion-v1";

function Layout() {
  const navigate = useNavigate();
  const mainContainerRef = useRef(null);
  const [collapse, setCollapse] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState(-1);
  const [user, setUser] = useLocalStorage("user", null);
  const [profile, setProfile] = useLocalStorage("profile", null);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse); // Set user state
      window.sessionStorage.setItem("user", JSON.stringify(codeResponse)); // Store user data in session storage
    },
    onError: (error) => console.log('Login Failed:', error)
  });


  useEffect(() => {
    const existing = localStorage.getItem(localStorageKey);
    if (existing) {
      try {
        setNotes(JSON.parse(existing));
      } catch {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (currentNote < 0) {
      return;
    }
    if (!editMode) {
      navigate(`/notes/${currentNote + 1}`);
      return;
    }
    navigate(`/notes/${currentNote + 1}/edit`);
  }, [notes]);
  useEffect(() => {
    const sessionUser = JSON.parse(window.sessionStorage.getItem("user"));
    const sessionProfile = JSON.parse(window.sessionStorage.getItem("profile"));
    if (sessionUser && sessionProfile) {
      setUser(sessionUser);
      setProfile(sessionProfile);
      fetchNotes(sessionProfile.email, sessionUser.access_token); // Fetch notes after setting user data from session storage
    }
  }, []);
  const saveNote = async (note, index) => {
    note.body = note.body.replaceAll("<p><br></p>", "");
    if (!note.body) {
      note.body = " "; // Replace with your preferred placeholder value
    }
    const requestOptions = {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "email": profile.email,
        "access_token": profile.access_token,
      },
      body: JSON.stringify({
        id: note.id,
        body: note.body,
        title: note.title,
        when: note.when,
      }),
    };
  
  
    try {
      const response = await fetch(
        "https://ij7pm6qrxppxkxj4jl4vobzque0gdlmk.lambda-url.ca-central-1.on.aws/",
        requestOptions
      );
      const data = await response.json();
  
      // Update the notes state only if the Lambda function succeeded
      if (data.success) {
        setNotes([
          ...notes.slice(0, index),
          { ...note },
          ...notes.slice(index + 1),
        ]);
        setCurrentNote(index);
        setEditMode(false);
      } else {

        console.error("Error saving note:", data.error);
      }
    } catch (error) {
      console.error("Error calling Lambda function:", error);
    }
  };

  const deleteNote = async (id) => {
    const queryString = `id=${id}`; // construct the query string with the ID value
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "email": profile.email,
        "access_token": profile.access_token,
      },
      body: JSON.stringify({
        id: id,
      }),
    };
  
    try {
      const url = `https://tjbknrmqgprnqgi5gqhwjisrri0nbrbg.lambda-url.ca-central-1.on.aws/?${queryString}`;
      const response = await fetch(url, requestOptions);
  
      if (response.ok) {
        console.log("Note deleted successfully");
  
        const index = notes.findIndex(note => note.id === id);
        setNotes([...notes.slice(0, index), ...notes.slice(index + 1)]);
        setCurrentNote(0);
        setEditMode(false);
      } else {
        console.error("Error deleting note:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };
  const addNote = () => {
    setNotes([
      {
        id: uuidv4(),
        title: "Untitled",
        body: "",
        when: currentDate(),
      },
      ...notes,
    ]);
    setEditMode(true);
    setCurrentNote(0);
  };
  const logOut = () => {
    googleLogout();
    setUser(null);
    setProfile(null);
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("profile");
  };

  useEffect(
    () => {
      if (user) {
        axios
          .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: 'application/json'
            }
          })
          .then((res) => {
            setProfile(res.data);
            fetchNotes(res.data.email, user.access_token); // Fetch notes after successful login
          })
          .catch((err) => console.log(err));
      }
    },
    [user]
  );
  const fetchNotes = async (email, access_token) => {
    try {
      const url = `https://npvpbdjwccick7upzp23knkrhu0nofpm.lambda-url.ca-central-1.on.aws/?email=${email}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "email": email,
          "access_token": access_token,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        console.error("Error fetching notes:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  return (
    <div id="container">
      <div id = "top-header">
          <button id="menu-button" onClick={()=> setCollapse(!collapse)}> &#9776; </button>
        <div id="app-header">
          <h1>
            <Link to="/notes">Lotion</Link>
          </h1>
          <h6 id="app-memo">like notion, but worse</h6>
          </div>
          <aside>&nbsp;</aside>
          {profile && (
        <div id="user-email">
          {profile.email} <button id="log-out" onClick={logOut}>(Log out)</button>
        </div>
      )}

      </div>
      <div id="container">
        {profile ? (
          <div>
            <div id="main-container" ref={mainContainerRef}>
              <aside id="sidebar" className={collapse ? "hidden" : null}>
                <header>
                  <div id="notes-list-heading">
                    <h2>Notes</h2>
                    <button id="new-note-button" onClick={addNote}> + </button>
                  </div>
                </header>
                <div id="notes-holder">
                  <NoteList notes={notes} />
                </div>
              </aside>
              <div id="write-box">
                <Outlet context={[notes, saveNote, deleteNote]} />
              </div>
            </div>
          </div>
        ) : (
          <div className="login-container">
          <button className="google-login-button" onClick={() => login()}>
          Sign in to lotion with
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google logo" />
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

export default Layout;