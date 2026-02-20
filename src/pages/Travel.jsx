function Travel() {
  return (
    <main className="page-panel page-event px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Getting Here</h1>
        
        <section className="info-window rounded-lg p-6 mb-6">
          <div className="font-bold mb-3" style={{ color: 'var(--accent-dark)', fontSize: '1.25rem' }}>
            Hotel Lilien
          </div>
          <div className="readable-font" style={{ color: 'var(--forest)' }}>
            <p><strong>6629 Route 23A</strong></p>
            <p><strong>Tannersville, NY 12485</strong></p>
          </div>
          <div className="readable-font mt-3" style={{ color: 'var(--forest)', fontSize: '0.9rem' }}>
            <p><a href="https://www.hotellilien.com/" className="underline hover:no-underline">Visit Hotel Lilien →</a></p>
          </div>
        </section>

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
            <p>We have a room block at Kaatskill Mountain Club, about 7 minutes from the venue. Please use the booking link below, or use the group code: <b>SHUBOY26</b>
            <br></br>
            <a href="https://be.synxis.com/?adult=1&arrive=2026-09-18&chain=6521&child=0&currency=USD&depart=2026-09-20&dest=HUNTER&hotel=31194&level=hotel&locale=en-US&productcurrency=USD&promo=SHUBOY26&rooms=1&segment=STUDIO">Kaatskill Mountain Club Group Booking Link</a></p>
            <p>Feel free to book other lodging in the area, including:</p>
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