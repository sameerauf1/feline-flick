import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isStarted, setIsStarted] = useState(false)
  const [count, setCount] = useState(0)
  const [catImage, setCatImage] = useState(null)
  const [breeds, setBreeds] = useState([])
  const [favoriteBreeds, setFavoriteBreeds] = useState(new Map())
  const [currentBreed, setCurrentBreed] = useState(null)
  const [allBreeds, setAllBreeds] = useState([])

  // Add a debug log for breeds array
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds')
        const data = await response.json()
        console.log('Fetched breeds:', data)  // Debug log
        setBreeds(data)
      } catch (error) {
        console.error('Error fetching breeds:', error)
      }
    }
    fetchBreeds()
  }, [])

  const fetchCat = async () => {
    try {
      console.log('Fetching new cat...')  // Debug log

      const excludeBreeds = Array.from(favoriteBreeds.keys()).join(',')
      const url = `https://api.thecatapi.com/v1/images/search?has_breeds=1&limit=1${excludeBreeds ? `&breed_ids_exclude=${excludeBreeds}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'x-api-key': 'DEMO-API-KEY'
        }
      })
      const [data] = await response.json()
      console.log('Cat data:', data)
      
      if (data.breeds && data.breeds.length > 0) {
        const breedInfo = data.breeds[0]
        setCatImage(data.url)
        setCurrentBreed(breedInfo)
        console.log('Breed info:', breedInfo)
      }
    } catch (error) {
      console.error('Error fetching cat:', error)
    }
  }

  const addToFavorites = (breed) => {
    if (favoriteBreeds.has(breed.id)) {
      alert('This breed is already in your favorites!')
      return
    }
    setFavoriteBreeds(prev => {
      const next = new Map(prev)
      next.set(breed.id, {
        id: breed.id,
        name: breed.name,
        wikipedia_url: breed.wikipedia_url  // Save the wiki URL
      })
      return next
    })
  }

  const removeFromFavorites = (breedId) => {
    console.log('Removing breed:', breedId)  // Debug log
    console.log('Current favorites before:', Array.from(favoriteBreeds))  // Debug log
    
    setFavoriteBreeds(prev => {
      const next = new Map(prev)
      next.delete(breedId)
      console.log('New favorites will be:', Array.from(next))  // Debug log
      return next
    })
  }

  useEffect(() => {
    fetchCat()
  }, [count])

  // Add this helper function at the top of your component
  const getFirstSentence = (text) => {
    if (!text) return '';
    // Split by period followed by a space or end of string
    const sentences = text.split(/\.\s|\.$/)
    return sentences[0] + '.'
  }

  // Welcome screen with Discover Cats button
  if (!isStarted) {
    return (
      <div className="welcome-screen">
        <div className="welcome-content">
          <h1>Feline Clicker</h1>
          <p>Ready to meet some amazing cats? Click below to start your pawsome adventure!</p>
          <button 
            className="discover-button"
            onClick={() => {
              setIsStarted(true)
            }}
          >
            Start Exploring
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="main-content">
        <h1>Feline Clicker</h1>
        {catImage && (
          <div className="cat-image">
            <img src={catImage} alt="Random cat" />
            {currentBreed && (
              <div className="breed-info">
                <div className="button-group">
                  <button 
                    className="favorite-button"
                    onClick={() => addToFavorites(currentBreed)}
                  >
                    ❤️ Add to Favorites
                  </button>
                  <button 
                    className="next-cat-button"
                    onClick={() => {
                      setCount(count + 1)
                    }}
                  >
                    Next Cat ({count} viewed)
                  </button>
                </div>
                <h3>Breed: {currentBreed.name}</h3>
                <p><strong>Description: </strong>{getFirstSentence(currentBreed.description)}</p>
                <div className="breed-traits">
                  <p><strong>Origin:</strong> {currentBreed.origin}</p>
                  <p><strong>Temperament:</strong> {currentBreed.temperament}</p>
                  <p><strong>Life Span:</strong> {currentBreed.life_span} years</p>
                  {currentBreed.wikipedia_url && (
                    <a 
                      href={currentBreed.wikipedia_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="wiki-link"
                    >
                      Learn More on Wikipedia
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="favorites-list">
        <h2>Favorite Breeds ({favoriteBreeds.size})</h2>
        <div className="favorite-breeds">
          {Array.from(favoriteBreeds.values()).map(breed => (
            <div key={breed.id} className="favorite-breed">
              <span className="breed-name">{breed.name}</span>
              <div className="breed-actions">
                {breed.wikipedia_url && (
                  <a 
                    href={breed.wikipedia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wiki-link"
                  >
                    Wiki Link
                  </a>
                )}
                <button 
                  className="remove-favorite"
                  onClick={() => removeFromFavorites(breed.id)}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
