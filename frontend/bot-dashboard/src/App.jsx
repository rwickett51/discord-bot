import React, { useState } from "react";

import Drawer from './Components/Drawer/Drawer'
import Dashboard from "./Components/Dashboard/Dashboard"
import Header from './Components/Header/Header'
import "./App.css"

function App() {
  const [drawerState, setDrawerState] = useState(false);

  const toggleDrawer = (newValue) => {
    setDrawerState(newValue);
  };

  return <div className="App">
    <Drawer />
    <Header />
    <Dashboard />
  </div>;
}

export default App;
