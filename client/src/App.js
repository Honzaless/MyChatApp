import React, { useContext } from "react";
import axios from "axios";
import { UserContextProvider, UserContext } from "./components/userContext.js";
import Routing from "./components/routes.js";

 const App = () => {
  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
  axios.defaults.withCredentials = true;
  const {id} = useContext(UserContext);

  return (
    <div>
      <UserContextProvider>
        <Routing />
      </UserContextProvider>
    </div>
  );
};
 export default App;