function Event() {
  return (
    <main className="page-event px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Weekend Schedule</h1>

        {/* Event information window */}
        <section className="info-window rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">Friday, September 18</h2>
          <div className="readable-font space-y-2">
            <div>
              <p>Details to follow</p>
            </div>
          </div>
        </section>

        <section className="info-window rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">Saturday, September 19</h2>
          <h4 className="text-md font-medium mb-2">Dress Code</h4>
                    <p className="readable-font">Cocktail Attire - Our celebration will be held mainly outdoors, keep that in mind when considering your dress.</p>
          <div className="readable-font space-y-2">
            <div>
              <strong>4:00 PM - Welcome Cocktails</strong>
            </div>
            <div>
              <strong>5:00 - Ceremony</strong>
            </div>
            <div>
              <strong>Cocktails, Dinner, and Dancing to follow</strong>
            </div>
          </div>
        </section>

        {/* Event information window */}
        <section className="info-window rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">Sunday, September 20</h2>
          <div className="readable-font space-y-2">
            <div>
              <p>Details to follow</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Event;