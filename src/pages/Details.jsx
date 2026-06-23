function Details() {
  return (
    <main className="page-panel page-event px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Details</h1>

        <section className="info-window rounded-lg p-6 mb-6">
          <div className="font-bold mb-3" style={{ color: 'var(--accent-dark)', fontSize: '1.25rem' }}>
            Weekend Schedule
          </div>

          <h2 className="text-lg font-medium mb-3">Saturday, September 19</h2>
          <div className="readable-font space-y-2 mb-3">
            <div><strong>4:00 PM - Welcome Cocktails</strong></div>
            <div><strong>5:00 - Ceremony</strong></div>
            <div><strong>Dinner and Dancing to follow</strong></div>
          </div>
          <h4 className="text-md font-medium mb-2">Dress Code</h4>
          <p className="readable-font mb-5">Cocktail Attire - Our celebration will be held mainly outdoors; keep that in mind when considering your dress.</p>

          <h2 className="text-lg font-medium mb-3">Sunday, September 20</h2>
          <div className="readable-font space-y-2">
            <p>You're welcome to stop by the hotel on your way out of town to say goodbye!</p>
          </div>
        </section>

        <section className="info-window rounded-lg p-6 mb-6">
          <div className="font-bold mb-3" style={{ color: 'var(--accent-dark)', fontSize: '1.25rem' }}>
            Registry
          </div>
          <div className="readable-font" style={{ color: 'var(--forest)' }}>
            <p>We are registered with Zola at the following link</p>
            <p className="mt-3">
              <a
                href="https://www.zola.com/registry/jackandkaterina2026/"
                className="underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                Zola Registry →
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Details;
