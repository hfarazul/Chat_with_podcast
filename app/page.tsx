import PodcastSummary from '../components/PodcastSummary'

export default function Home() {

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <svg width="50" height="50" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-4">
            <circle cx="100" cy="100" r="95" fill="#4338CA" stroke="white" strokeWidth="10"/>
            <path d="M100 30C61.34 30 30 61.34 30 100C30 138.66 61.34 170 100 170C138.66 170 170 138.66 170 100C170 61.34 138.66 30 100 30ZM135 105L80 140V70L135 105Z" fill="white"/>
            <path d="M80 70V140L135 105L80 70Z" fill="#EF4444"/>
          </svg>
          <h1 className="text-2xl font-bold text-indigo-800">The Podcast Summary</h1>
        </div>
      </header>

      <PodcastSummary />

      <footer className="bg-gray-200 text-center py-4 mt-8">
        <p className="text-gray-600">
          The Podcast Summary was created by
          <a href="https://www.instagram.com/haque.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition duration-300"> Haque Farazul</a>
          ❤️
        </p>
      </footer>
    </div>
  )
}
