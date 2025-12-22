import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FilterBar from './Filter.tsx';
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
      <div>
             <FilterBar/>
      </div>
  )
}
export default App