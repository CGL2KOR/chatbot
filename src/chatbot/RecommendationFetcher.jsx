import React, { useEffect, useState } from 'react';
import { useChatBot } from 'react-simple-chatbot';

const RecommendationFetcher = () => {
  const [result, setResult] = useState('Loading...');
  const { steps } = useChatBot();

  useEffect(() => {
    fetch('/recommendations.json')  // Fetches from public folder
      .then(res => res.json())
      .then(data => {
        const top = data.recommended_stays.slice(0, 3);
        const formatted = top.map(stay =>
          `🏨 ${stay.name} (Score: ${stay.score})\n🛏 Amenities: ${stay.amenities.join(', ')}\n📍 Distance: ${stay.distance_to_office_km}km\n⚠ Alerts: ${stay.alert_badges.join(', ') || 'None'}`
        ).join('\n\n');
        setResult(formatted);
      });
  }, []);

  return <div style={{ whiteSpace: 'pre-line' }}>{result}</div>;
};

export default RecommendationFetcher;
