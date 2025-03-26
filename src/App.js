import logo from './logo.svg';
import './App.css';
import ChatBotApp from './chatbot/ChatBot';
import ChatWindow from './chatbot/ChatWindow';

function App() {
  return (
    <div className="App">
     <h1>🛡️ Safe Stay Assistant</h1>
     {/* <ChatBotApp /> */}
     <ChatWindow />
    </div>
  );
}

export default App;
