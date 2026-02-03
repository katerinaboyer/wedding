import React from 'react';
import '../App.css';

export default function Engagement() {
  // Use webpack require.context to import any images in the photos folder
  let images = [];
  try {
    // allow nested folders and sort alphabetically
    const req = require.context('../assets/photos', true, /\.(png|jpe?g|webp|gif)$/i);
    images = req.keys().sort().map((k) => req(k));
  } catch (e) {
    // no photos or require not supported
    images = [];
  }

  return (
    <main className="page-panel page-event px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Our Engagement</h1>
        <p className="readable-font mb-6">Jack proposed during a Sunday evening walk through Central Park. Afterwards, he surprised me with a pizza party on our roof. It was perfect.</p>

        <section className="info-window rounded-lg p-6">
          <div className="readable-font">
            {images.length === 0 ? (
              <p className="text-sm text-slate-700">No engagement photos yet. If you have photos you'd like to include, drop them into <code>src/assets/photos</code> and they will show up here.</p>
            ) : (
              <div className="photo-grid">
                {images.map((src, i) => (
                  <figure key={i} className="photo-item">
                    <img src={src} alt={`engagement-${i}`} loading="lazy" />
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
