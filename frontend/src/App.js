// App.js
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ChooseScenarioScreen from './screens/ChooseScenario';
import MeetingFeedbackGPTForm from './screens/MeetingFeedbackGPTForm';
import MeetingDebriefInfoScreen from './screens/MeetingDebriefInfoScreen';
import ManagerViewInfoScreen from './screens/ManagerViewInfoScreen';
import FeedbackForm from './screens/FeedbackForm';
import EnterUserDetailsForm from './screens/EnterUserDetailsForm';
import { UserProvider } from './UserContext';
import "./App.css";

function App() {

  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<ChooseScenarioScreen />} />
          <Route path="/welcome" element={<MeetingDebriefInfoScreen />} />
          <Route path="/welcome-manager" element={<ManagerViewInfoScreen />} />
          <Route path="/new-user" element={<EnterUserDetailsForm />} />
          <Route path="/meeting-debrief" element={<MeetingFeedbackGPTForm />} />
          <Route path="/feedback" element={<FeedbackForm />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
