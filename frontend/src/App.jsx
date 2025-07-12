import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './styles/App.css'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
        
            
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
