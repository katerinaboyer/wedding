import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { supabase } from '../lib/supabase';

export default function RSVPPage() {
  const [step, setStep] = useState('search'); // 'search' | 'verify' | 'review' | 'form' | 'submitted'
  const [confirmedExisting, setConfirmedExisting] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [dropdownResults, setDropdownResults] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [zipInput, setZipInput] = useState('');
  const [zipError, setZipError] = useState('');
  const [existingRsvp, setExistingRsvp] = useState(null);
  const [attendingCount, setAttendingCount] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredResult, setHoveredResult] = useState(null);
  const fuseRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    supabase
      .from('parties')
      .select('*')
      .then(({ data, error }) => {
        console.log('parties loaded:', data, error);
        if (data?.length) {
          fuseRef.current = new Fuse(data, { keys: ['party_name', 'aliases'], threshold: 0.4 });
        }
      });
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownResults([]);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleNameInput(e) {
    const val = e.target.value;
    setNameInput(val);
    if (val.trim().length < 3 || !fuseRef.current) {
      setDropdownResults([]);
      return;
    }
    const hits = fuseRef.current.search(val).slice(0, 8).map(r => r.item);
    setDropdownResults(hits);
  }

  function handleSelectParty(party) {
    setSelectedParty(party);
    setNameInput(party.party_name);
    setDropdownResults([]);
    setZipInput('');
    setZipError('');
    setStep('verify');
  }

  async function handleZipVerify(e) {
    e.preventDefault();
    setZipError('');
    if (zipInput.trim() !== selectedParty.zip_code) {
      setZipError("ZIP code doesn't match our records. Please check your invitation.");
      return;
    }
    setLoading(true);

    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('*')
      .eq('party_id', selectedParty.id)
      .maybeSingle();

    if (rsvpData) {
      setExistingRsvp(rsvpData);
      setAttendingCount(rsvpData.attending_count ?? '');
      setDietaryNotes(rsvpData.dietary_notes ?? '');
      setNotes(rsvpData.notes ?? '');
      setEmail(rsvpData.email ?? '');
      setStep('review');
    } else {
      setStep('form');
    }
    setLoading(false);
  }

  function handleKeepExisting() {
    setConfirmedExisting(true);
    setStep('submitted');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      party_id: selectedParty.id,
      attending_count: attendingCount === '' ? null : Number(attendingCount),
      dietary_notes: dietaryNotes || null,
      notes: notes || null,
      email: email || null,
      submitted_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from('rsvps')
      .upsert(payload, { onConflict: 'party_id' });

    if (upsertErr) {
      setError('Something went wrong saving your RSVP. Please try again.');
      setLoading(false);
      return;
    }

    if (email) {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('send-rsvp-confirmation', {
        body: {
          email,
          partyName: selectedParty.party_name,
          attendingCount: attendingCount === '' ? 0 : Number(attendingCount),
          maxGuests: selectedParty.max_guests,
          dietaryNotes: dietaryNotes || null,
          notes: notes || null,
        },
      });
      console.log('send-rsvp-confirmation result:', fnData, fnError);
    }

    setStep('submitted');
    setLoading(false);
  }

  if (step === 'submitted') {
    return (
      <main className="page-panel px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <section className="info-window rounded-lg p-8">
            <h1 className="text-2xl font-semibold mb-4">Thank You!</h1>
            <p className="readable-font">
              {confirmedExisting
                ? "Your RSVP is all set — we can't wait to celebrate with you."
                : <>Your RSVP has been received.{' '}{email && 'A confirmation has been sent to your email.'}</>}
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (step === 'review') {
    return (
      <main className="page-panel px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">RSVP</h1>
          <section className="info-window rounded-lg p-6">
            <p className="text-sm text-stone-500 mb-1">
              We already have an RSVP on file for
            </p>
            <h2 className="text-lg font-medium mb-4">{selectedParty.party_name}</h2>

            <dl className="space-y-3 mb-6">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <dt className="text-sm text-stone-500">Guests attending</dt>
                <dd className="text-sm font-medium">
                  {existingRsvp?.attending_count ?? '—'} of {selectedParty.max_guests}
                </dd>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <dt className="text-sm text-stone-500">Dietary restrictions</dt>
                <dd className="text-sm font-medium">{existingRsvp?.dietary_notes || '—'}</dd>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <dt className="text-sm text-stone-500">Notes</dt>
                <dd className="text-sm font-medium">{existingRsvp?.notes || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-stone-500">Email</dt>
                <dd className="text-sm font-medium">{existingRsvp?.email || '—'}</dd>
              </div>
            </dl>

            <p className="text-sm text-stone-600 mb-4">Is this still correct?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleKeepExisting}
                className="readable-font flex-1 py-3.5 rounded-lg font-semibold tracking-wide active:translate-y-0.5 transition-all"
                style={{
                  background: 'linear-gradient(180deg, var(--butter), #ffeaa3)',
                  color: 'var(--accent-dark)',
                  border: '4px solid var(--accent-dark)',
                  boxShadow: '6px 6px 0 0 var(--accent-dark)',
                }}
              >
                Yes, keep my RSVP
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="readable-font flex-1 py-3.5 rounded-lg font-semibold tracking-wide active:translate-y-0.5 transition-all"
                style={{
                  background: '#fffef8',
                  color: 'var(--accent-dark)',
                  border: '4px solid var(--accent-dark)',
                  boxShadow: '6px 6px 0 0 var(--accent-dark)',
                }}
              >
                Make changes
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (step === 'form') {
    const max = selectedParty.max_guests;
    return (
      <main className="page-panel px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">RSVP</h1>
          {existingRsvp && (
            <p className="text-sm text-stone-500 mb-4">
              Update your existing RSVP below.
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <section className="info-window rounded-lg p-6 mb-4">
              <h2 className="text-lg font-medium mb-4">{selectedParty.party_name}</h2>

              <div className="mb-5">
                <label className="readable-font block text-sm font-semibold text-stone-700 mb-2">
                  Number of guests attending
                </label>
                <input
                  type="number"
                  min={0}
                  max={max}
                  value={attendingCount}
                  onChange={e => setAttendingCount(e.target.value)}
                  className="readable-font block w-24 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-shadow"
                  style={{ background: '#fffef8', border: '1px solid #efe6cf' }}
                  placeholder="0"
                />
              </div>

              <div className="mb-5">
                <label className="readable-font block text-sm font-semibold text-stone-700 mb-2">Dietary Restrictions</label>
                <input
                  type="text"
                  value={dietaryNotes}
                  onChange={e => setDietaryNotes(e.target.value)}
                  className="readable-font block w-full rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-shadow"
                  style={{ background: '#fffef8', border: '1px solid #efe6cf' }}
                  placeholder="Allergies, restrictions, etc."
                />
              </div>

              <div>
                <label className="readable-font block text-sm font-semibold text-stone-700 mb-2">Notes</label>
                <p className="readable-font text-xs text-stone-500 mb-2">
                  Children are welcome! If you're bringing little ones who aren't listed on your invitation, please include their names and ages here so we can plan.
                </p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="readable-font block w-full rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-shadow resize-none"
                  style={{ background: '#fffef8', border: '1px solid #efe6cf' }}
                  placeholder="Anything else you'd like us to know?"
                />
              </div>
            </section>

            <section className="info-window rounded-lg p-6 mb-6">
              <label className="readable-font block text-sm font-semibold text-stone-700 mb-2">
                Email for Confirmation <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="readable-font block w-full rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-shadow"
                style={{ background: '#fffef8', border: '1px solid #efe6cf' }}
                placeholder="your@email.com"
              />
            </section>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="readable-font w-full py-3.5 rounded-lg font-semibold tracking-wide active:translate-y-0.5 transition-all disabled:opacity-50 disabled:active:translate-y-0"
              style={{
                background: 'linear-gradient(180deg, var(--butter), #ffeaa3)',
                color: 'var(--accent-dark)',
                border: '4px solid var(--accent-dark)',
                boxShadow: '6px 6px 0 0 var(--accent-dark)',
              }}
            >
              {loading ? 'Submitting…' : existingRsvp ? 'Update RSVP' : 'Submit RSVP'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (step === 'verify') {
    return (
      <main className="page-panel px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">RSVP</h1>
          <button
            type="button"
            onClick={() => { setStep('search'); setSelectedParty(null); }}
            aria-label="Search again"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg font-semibold active:translate-y-0.5 transition-all mb-6"
            style={{
              background: 'linear-gradient(180deg, var(--butter), #ffeaa3)',
              color: 'var(--accent-dark)',
              border: '4px solid var(--accent-dark)',
              boxShadow: '4px 4px 0 0 var(--accent-dark)',
            }}
          >
            ←
          </button>
          <section className="info-window rounded-lg p-6">
            <h2 className="text-lg font-medium mb-1">Welcome, {selectedParty.party_name}</h2>
            <p className="text-sm text-stone-500 mb-6">
              Please confirm your invitation ZIP code.
            </p>
            <form onSubmit={handleZipVerify}>
              <input
                type="text"
                value={zipInput}
                onChange={e => setZipInput(e.target.value)}
                className="readable-font block w-full rounded-md px-4 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-shadow"
                style={{ background: '#fffef8', border: '1px solid #efe6cf' }}
                placeholder="12345"
                maxLength={10}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !zipInput.trim()}
                className="readable-font w-full py-3.5 rounded-lg font-semibold tracking-wide active:translate-y-0.5 transition-all disabled:opacity-50 disabled:active:translate-y-0"
                style={{
                  background: 'linear-gradient(180deg, var(--butter), #ffeaa3)',
                  color: 'var(--accent-dark)',
                  border: '4px solid var(--accent-dark)',
                  boxShadow: '6px 6px 0 0 var(--accent-dark)',
                }}
              >
                {loading ? '…' : 'Continue'}
              </button>
              {zipError && <p className="text-red-600 mt-3 text-sm">{zipError}</p>}
            </form>
          </section>
        </div>
      </main>
    );
  }

  // Search step
  return (
    <main className="page-panel px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">RSVP</h1>
        <section className="info-window rounded-lg p-8 text-center">
          <h2 className="text-xl mb-2">Find Your Invitation</h2>
          <p className="readable-font text-sm text-stone-500 mb-6">
            Start typing the name on your invitation and select it from the list.
          </p>
          <div className="relative max-w-md mx-auto text-left" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={nameInput}
                onChange={handleNameInput}
                className="w-full border border-stone-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 transition-shadow"
                placeholder="e.g. Jane Smith"
                autoComplete="off"
                autoFocus
              />
            </div>
            {dropdownResults.length > 0 && (
              <ul
                className="absolute z-10 w-full mt-2 rounded-lg overflow-hidden m-0 p-0"
                style={{ listStyle: 'none' }}
              >
                {dropdownResults.map((p, i) => (
                  <li key={p.id} style={{ listStyle: 'none' }}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelectParty(p)}
                      onMouseEnter={() => setHoveredResult(p.id)}
                      onMouseLeave={() => setHoveredResult(null)}
                      className="readable-font w-full text-left px-4 py-3 cursor-pointer focus:outline-none transition-colors"
                      style={{
                        background: hoveredResult === p.id
                          ? '#fde68a'
                          : i % 2 === 0 ? '#ffffff' : '#fff7d6',
                        border: 'none',
                      }}
                    >
                      {p.party_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {nameInput.trim().length > 0 && nameInput.trim().length < 3 && (
              <p className="mt-2 text-xs text-stone-400 text-center">Keep typing to search…</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
