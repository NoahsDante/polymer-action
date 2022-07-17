import logo from './logo.svg';
import './App.css';
import useInit from "./hooks";
function App() {
const [state,action] = useInit();
  return (
    <div className="button" onClick={() => {
      action.click()
    }}>
      {`点我呀${state.val}`}
    </div>
  );
}

export default App;
