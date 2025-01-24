import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [catImage, setCatImage] = useState(null)
  const [breeds, setBreeds] = useState([])
  const [bannedBreeds, setBannedBreeds] = useState(new Set())
  const [currentBreed, setCurrentBreed] = useState(null)

  // Fetch all available breeds once when component mounts
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds')
        const data = await response.json()
        setBreeds(data)
      } catch (error) {
        console.error('Error fetching breeds:', error)
      }
    }
    fetchBreeds()
  }, [])

  const fetchCat = async () => {
    try {
      // Modified URL to ensure we get images with breed information
      const excludeBreeds = Array.from(bannedBreeds).join(',')
      const url = `https://api.thecatapi.com/v1/images/search?has_breeds=1${excludeBreeds ? `&breed_ids_exclude=${excludeBreeds}` : ''}`
      
      const response = await fetch(url)
      const [data] = await response.json()
      console.log('Cat data:', data) // Add this to debug
      setCatImage(data.url)
      setCurrentBreed(data.breeds?.[0] || null)
    } catch (error) {
      console.error('Error fetching cat:', error)
    }
  }

  const banBreed = (breedId) => {
    setBannedBreeds(prev => new Set([...prev, breedId]))
    fetchCat() // Fetch a new cat that isn't of the banned breed
  }

  useEffect(() => {
    fetchCat()
  }, [count])

  return (
    <div className="game-container">
      <div className="main-content">
        <h1>Feline Clicker</h1>
        {catImage && (
          <div className="cat-image">
            <img src={catImage} alt="Random cat" />
            {currentBreed && (
              <div className="breed-info">
                <h3>Breed: {currentBreed.name}</h3>
                <button 
                  className="ban-button"
                  onClick={() => banBreed(currentBreed.id)}
                >
                  Ban {currentBreed.name} Cats
                </button>
              </div>
            )}
          </div>
        )}
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Cats clicked: {count}
          </button>
        </div>
      </div>
      <h2>Banned Breeds</h2>
      <div className="ban-list">
        <div className="banned-breeds">
          {Array.from(bannedBreeds).map(breedId => {
            const breed = breeds.find(b => b.id === breedId)
            return (
              <div key={breedId} className="banned-breed">
                {breed?.name}
                <button 
                  onClick={() => {
                    setBannedBreeds(prev => {
                      const next = new Set(prev)
                      next.delete(breedId)
                      return next
                    })
                  }}
                >
                  Unban
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App
