import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const apiUrl = 'http://localhost:5500';  // Replace with your actual API URL

const App = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [source, setSource] = useState('');
  const [urls, setUrls] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [topUrls, setTopUrls] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  

  const fetchUrls = async () => {
    try {
      const response = await axios.get(`${apiUrl}/links`);
      setUrls(response.data);
      setTopUrls([response.data[0]]);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };


  const createShortUrl = async () => {
    if (!originalUrl) {
      alert('Please enter a valid URL.');
      return;
    }

    const urlData = { url: originalUrl, alias, source };

    try {
      const response = await axios.post(`${apiUrl}/`, urlData);
      alert(`Short URL created: ${response.data.shortUrl}`);
      fetchUrls();  // Refresh the list
      setOriginalUrl('');
      setAlias('');
      setSource('');
    } catch (error) {
      console.error('Error creating short URL:', error);
      alert('Failed to create short URL');
    }
  };

  const deleteUrl = async (originalUrl) => {
    try {
      await axios.delete(`${apiUrl}/`, { data: { url: originalUrl } });
      fetchUrls();  // Refresh the list
    } catch (error) {
      console.error('Error deleting URL:', error);
      alert('Failed to delete URL');
    }
  };

  const deleteAllUrls = async () => {
    try {
      await axios.delete(`${apiUrl}/all`);
      fetchUrls();  // Refresh the list
    } catch (error) {
      console.error('Error deleting all URLs:', error);
      alert('Failed to delete all URLs');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'} p-10 flex flex-col items-center transition duration-500`}>
      <h1 className={`text-4xl font-bold ${darkMode ? 'text-gray-200' : 'text-white'} text-center mb-10`}>URL Shortener</h1>

      {/* Dark mode toggle button */}
      <button 
        onClick={toggleDarkMode} 
        className="absolute top-5 right-5 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300"
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* URL Shortening Form */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : 'shadow-xl'} rounded-lg p-8 w-full max-w-lg mb-10`}>
        <div className="space-y-6">
          <div className="flex flex-col">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Original URL</label>
            <input
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter URL to shorten"
              className={`p-4 rounded-md border ${darkMode ? 'border-gray-600 text-black' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
          </div>

          <div className="flex flex-col">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Optional Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Custom alias (optional)"
              className={`p-4 rounded-md border ${darkMode ? 'border-gray-600 text-black' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
          </div>

          <div className="flex flex-col">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Traffic Source (optional)</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter source (e.g., google, facebook)"
              className={`p-4 rounded-md border ${darkMode ? 'border-gray-600 text-black' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
          </div>

          <button
            onClick={createShortUrl}
            className={`w-full ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white p-4 rounded-md hover:bg-blue-800 transition duration-300 transform hover:scale-105`}
          >
            Create Short URL
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : 'shadow-xl'} rounded-lg p-8 w-full max-w-lg mb-10`}>
        <h3 className={`text-2xl font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Performance Metrics</h3>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Total Clicks Across All URLs: {totalClicks}</p>

        <h4 className={`text-xl ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Top Clicked URLs</h4>
        <ul className="space-y-4">
          {topUrls.map((url) => (
            <li key={url.shortUrl} className={`bg-gray-50 ${darkMode ? 'bg-gray-700' : 'shadow-md'} p-4 rounded-lg hover:shadow-lg transition-shadow duration-300`}>
              <a href={`${apiUrl}/${url.shortUrl}`} target="_blank" rel="noopener noreferrer" className={`text-blue-600 ${darkMode ? 'hover:text-blue-400' : 'hover:underline'} font-medium`}>
                {url.originalUrl} - {url.clicks} clicks
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* List of URLs */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : 'shadow-xl'} rounded-lg p-8 w-full max-w-lg mb-10`}>
        <h3 className={`text-2xl font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>All Shortened URLs</h3>
        {urls.length === 0 ? (
          <p className={`text-gray-500 ${darkMode ? 'text-gray-400' : ''}`}>No URLs found</p>
        ) : (
          <ul className="space-y-6">
            {urls.map((url) => (
              <li key={url.shortUrl} className={`bg-gray-50 ${darkMode ? 'bg-gray-700' : 'shadow-lg'} p-4 rounded-lg hover:shadow-xl transition-shadow duration-300`}>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong>Original URL:</strong>{' '}
                      <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className={`text-blue-600 ${darkMode ? 'hover:text-blue-400' : 'hover:underline'}`}>
                        {url.originalUrl}
                      </a>
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong>Short URL:</strong>{' '}
                      <a href={`${apiUrl}/${url.shortUrl}`} target="_blank" rel="noopener noreferrer" className={`text-blue-600 ${darkMode ? 'hover:text-blue-400' : 'hover:underline'}`}>
                        {apiUrl}/{url.shortUrl}
                      </a>
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong>Source:</strong> {url.source || 'No source'}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong>Click Count:</strong> {url.clicks}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteUrl(url.originalUrl)}
                    className={`text-red-600 ${darkMode ? 'hover:text-red-400' : 'hover:text-red-800'} text-sm`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={deleteAllUrls}
        className={`mt-10 ${darkMode ? 'bg-red-700' : 'bg-red-600'} text-white p-4 rounded-lg w-full max-w-lg hover:bg-red-800 transition duration-300`}
      >
        Delete All URLs
      </button>
    </div>
  );
};

export default App;
