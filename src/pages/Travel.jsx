function Travel() {
  return (
    <main className="page-panel page-event px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Getting Here</h1>

        <section className="info-window rounded-lg p-6 mb-6">
          <div className="readable-font">
            <p>We recommend renting a car to get to the venue. Rideshares may or may not be readily available from airports or train stations.</p>

            <h3 className="mt-4">Air Travel</h3>
            <ul>
              <li>Albany International Airport ~1 hour 15 minutes drive</li>
              <li>Newark Liberty International Airport ~2 hours 15 minutes drive</li>
              <li>LaGuardia Airport ~2 hours 15 minutes drive</li>
            </ul>

            <h3 className="mt-4">Amtrak</h3>
            <p>The nearest Amtrak station is in Hudson, NY ~40 minutes drive to the venue.</p>
          </div>
        </section>

        <section className="info-window rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-2">Stay</h2>
          <div className="readable-font">
            <p>We are working on potential room blocks at nearby hotels. Feel free to peruse potential stays and AirBnbs for this area.</p>
            <ul>
              <li><a href="https://scribnerslodge.com/">Scribner's Lodge</a> ~5 minutes from venue</li>
              <li><a href="https://www.bluebirdhotels.com/hotels/the-hunter">Hunter Lodge</a> ~5 minutes from venue</li>
              <li><a href="https://www.airbnb.com/">AirBnbs</a></li>
            </ul>
          </div>
        </section>

        <section className="info-window rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Activities</h2>
          <div className="readable-font">Details about local activities and recommendations will be posted here.</div>
        </section>
      </div>
    </main>
  );
}

export default Travel;