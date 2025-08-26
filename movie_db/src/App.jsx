import React, { useState } from 'react'
import Search from './components/Search'

const App = () => {

  const [searchTerm, setSearchTerm] = useState("")
  return (
    <main>
      <div classnmae="pattern"/>
      <div className="wrappper">

        <header>
          <img src="./hero.png" alt="Hero Banner"/>
          <h1>
            Find <span className="text-gradient">Movies</span>
          </h1>
        </header>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </div>
  
    </main>

  )
}

export default App