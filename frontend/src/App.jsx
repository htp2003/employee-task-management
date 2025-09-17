import useRouteElements from './useRouteElements';
import './styles/forms.css';

function App() {
  const routeElements = useRouteElements();

  return (
    <div className="App">
      {routeElements}
    </div>
  );
}

export default App;