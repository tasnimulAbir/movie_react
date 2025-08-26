import React, { useState, useEffect } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { buildEndpoint, mapJikanAnime, sendMetric, getTrendingAnimes } from './parseHelper';



const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [contentList, setContentList] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(false);




  const fetchContent = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = buildEndpoint(query);
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed: ${res.status} ${res.statusText}`);
      const json = await res.json();
      const items = (json?.data ?? []).map(mapJikanAnime);
      if (items.length === 0) throw new Error('Jikan returned no results');
      setContentList(items);
      if (query && items.length > 0) {
        sendMetric(query, items[0]);
      }
      console.log(' Fetched Jikan content successfully:', items);

    } catch (error) {
      console.error(' Error fetching content:', error);
      setErrorMessage(error.message || 'Error fetching content.');
      setContentList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingAnimes = async() => {
    try{
      const animes = await getTrendingAnimes();
      setTrendingAnime(animes);

    }catch(e){
      console.error(`Error fetching trending movies:${e}`)
    }
    
  }

  // Initial load: fetch Top Anime
  useEffect(() => {
    fetchContent('');
    loadTrendingAnimes();
  }, []);

  // Debounce API calls by 500ms whenever searchTerm changes
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchContent(searchTerm);
    }, 500);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">

        <header>
          <img src="./anime.png" alt="Anime Banner"/>
          <h1>
            Find <span className="text-gradient">Anime</span>
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        {trendingAnime.length > 0 && (
          <section className="trending">
            <h2 className='text-gradient'>Trending Anime</h2>
            <ul>
              {trendingAnime.map((anime, index) => (
                <li key={anime.id ?? `${anime.title}-${index}`}>
                  <p>{index + 1}</p>
                  <img src={anime.image || '/no-anime.png'} alt={anime.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="all-content">
          <h2 className='text-gradient'>Popular</h2>
          {isLoading ? 
          (<Spinner/>):
          errorMessage ? 
          (<p className="text-red-500">{errorMessage}</p>):
          (
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {contentList.map((anime) => (
                <li key={anime.id}>
                  <MovieCard anime={anime} />
                </li>
              ))}
            </ul>
          )
        }
        

        </section>
      </div>
  
    </main>

  )
}

export default App