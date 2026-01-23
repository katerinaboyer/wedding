function Event() {
  return (
    <main className="page-event px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Weekend Schedule</h1>

        {/* Yellow dress-code window */}
        <section className="dress-window rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-2">Dress Code</h2>
          <p className="readable-font">Cocktail Attire - Our celebration will be held mainly outdoors, keep that in mind when considering your dress.</p>
        </section>

        {/* Event information window */}
        <section className="info-window rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">Saturday, September 19</h2>
          <div className="readable-font space-y-2">
            <div>
              <strong>Ceremony</strong>
              <div>Details to follow</div>
            </div>

            <div>
              <strong>Dinner & Reception</strong>
              <div>Details to follow</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Event;