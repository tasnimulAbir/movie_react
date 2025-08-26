import React from 'react'


const MovieCard = ({anime: 
    {title, startDate, score, image,episodes}
}) => {
  return (
    <div className="anime-card rounded-lg overflow-hidden bg-white/5">
      <img
        src={image || "/no-anime.png"}
        alt={title || "Anime poster"}
        className="w-full aspect-[2/3] object-cover"
      />
      <div className='mt-4'>
        <h3>{title}</h3>

        <div className='content'>
            <div className='rating'>
                <img src="star.svg" alt="Star Icon"/>
                <p>{score ? score.toFixed(1): 'N/A'}</p>
            </div>
            <span>•</span>
            <p className='lang'>Ep{episodes}</p>
            <span>•</span>
            <p className='year'>
                {startDate ? startDate.split('-')[0]: 'N/A'} 
            </p>
        </div>
      </div>
    </div>
    
  )
}

export default MovieCard