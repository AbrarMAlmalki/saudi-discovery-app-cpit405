import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GNEWS_API_KEY = '17712ff1a4ea9efa8ae3b02b862e3d17'; // Get free from gnews.io

const SportsNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSportsNews();
  }, []);

  const fetchSportsNews = async () => {
    try {
      const response = await axios.get(
        `https://gnews.io/api/v4/top-headlines?country=sa&category=sports&token=${GNEWS_API_KEY}`
      );
      setNews(response.data.articles.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('News fetch error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="news-section">
      <h3>Latest Saudi Sports News</h3>
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="news-list">
          {news.map((article, index) => (
            <div key={index} className="news-item">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <h4>{article.title}</h4>
                <small>{new Date(article.publishedAt).toLocaleDateString()}</small>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SportsNews;