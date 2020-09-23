import React from 'react';
import Room from './components/Room'
import JoinRoom from './components/JoinRoom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

function App() {
  
  return (
    <Router>
      <Switch>
        <Route path="/:roomId">
          <Room/>
        </Route>
        <Route path="/">
          <JoinRoom />
        </Route>
      </Switch>
   
  </Router>
  );
}

export default App;
