import { Search } from 'lucide-react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';

import { getRegionSuggestions, type SearchRegion } from './region-search.js';

interface HomeHeroSearchProps {
  lang: string;
  regions: SearchRegion[];
  regionLookupAvailable: boolean;
}

export function HomeHeroSearch({ lang, regions, regionLookupAvailable }: HomeHeroSearchProps) {
  const [listingType, setListingType] = useState<'SALE' | 'RENT'>('SALE');
  const [query, setQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<SearchRegion | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [selectionError, setSelectionError] = useState('');
  const activeTabIndex = listingType === 'SALE' ? 0 : 1;
  const searchPath = listingType === 'SALE' ? 'property-to-buy' : 'property-to-rent';
  const suggestions = getRegionSuggestions(regions, query);
  const regionsById = new Map(regions.map((region) => [region.id, region]));

  function selectRegion(region: SearchRegion) {
    setQuery(region.name);
    setSelectedRegion(region);
    setSuggestionsOpen(false);
    setActiveSuggestion(0);
    setSelectionError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (query.trim() && !selectedRegion) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setSelectionError('Zgjidh një vendndodhje nga sugjerimet para kërkimit.');
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && suggestionsOpen && suggestions[activeSuggestion]) {
      event.preventDefault();
      selectRegion(suggestions[activeSuggestion]);
    } else if (event.key === 'Escape') {
      setSuggestionsOpen(false);
    }
  }

  function getRegionContext(region: SearchRegion) {
    const parentName = region.parentId ? regionsById.get(region.parentId)?.name : undefined;
    const countryNames =
      lang === 'en'
        ? { AL: 'Albania', XK: 'Kosovo', MK: 'North Macedonia' }
        : { AL: 'Shqipëri', XK: 'Kosovë', MK: 'Maqedoni e Veriut' };
    const countryName = countryNames[region.country as keyof typeof countryNames] ?? region.country;
    return parentName ? `${parentName} · ${countryName}` : countryName;
  }

  return (
    <section
      className="relative px-4 py-16 text-center text-white"
      style={{
        backgroundImage:
          "url('https://jitty-cdn.com/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCQzNoVnhjPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--35edb7a574c5da243c4ee8bbee44f13d52898fe4')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true"></div>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Gjej pronën tënde të ëndrrave
        </h1>
        <p className="mt-4 text-lg text-white/80">
          Apartamente, shtëpi, villa dhe tokë në Shqipëri, Kosovë dhe Maqedoni
        </p>

        <div className="mx-auto mt-8 max-w-4xl text-left">
          <div className="shadow-pop rounded-2xl border border-white/35 bg-white/95 p-2 text-[#0F1A14] backdrop-blur-sm">
            <div className="relative">
              <div
                role="tablist"
                aria-label="Tipi i listimit"
                className="grid grid-cols-2 border-b border-[#E5E7E2]"
              >
                <button
                  role="tab"
                  type="button"
                  id="tab-sale"
                  aria-controls="panel-search"
                  aria-selected={listingType === 'SALE'}
                  tabIndex={listingType === 'SALE' ? 0 : -1}
                  onClick={() => setListingType('SALE')}
                  className="px-4 py-3 text-center text-base font-semibold"
                >
                  Blej
                </button>
                <button
                  role="tab"
                  type="button"
                  id="tab-rent"
                  aria-controls="panel-search"
                  aria-selected={listingType === 'RENT'}
                  tabIndex={listingType === 'RENT' ? 0 : -1}
                  onClick={() => setListingType('RENT')}
                  className="px-4 py-3 text-center text-base font-semibold"
                >
                  Qira
                </button>
              </div>
              <span
                aria-hidden="true"
                className="bg-primary pointer-events-none absolute bottom-0 left-0 h-[3px] w-1/2 rounded-full transition-transform duration-200"
                style={{ transform: `translateX(${activeTabIndex * 100}%)` }}
              />
            </div>

            <div
              role="tabpanel"
              id="panel-search"
              aria-labelledby={listingType === 'SALE' ? 'tab-sale' : 'tab-rent'}
              className="px-2 pb-2 pt-4"
            >
              <h2 className="text-fg mb-4 text-lg font-semibold md:text-xl">
                {listingType === 'SALE' ? 'Kërko prona për blerje' : 'Kërko prona me qira'}
              </h2>

              <form
                action={`/${lang}/${searchPath}`}
                method="get"
                className="flex flex-col gap-3 md:flex-row"
                onSubmit={handleSubmit}
              >
                <div className="relative flex-1">
                  <Search className="text-muted absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  <input
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={suggestionsOpen && query.trim().length > 0}
                    aria-controls="home-region-suggestions"
                    aria-activedescendant={
                      suggestionsOpen && suggestions[activeSuggestion]
                        ? `home-region-option-${suggestions[activeSuggestion].id}`
                        : undefined
                    }
                    aria-invalid={Boolean(selectionError)}
                    aria-describedby={
                      selectionError
                        ? 'home-region-error'
                        : !regionLookupAvailable
                          ? 'home-region-status'
                          : undefined
                    }
                    autoComplete="off"
                    placeholder="Qyteti ose zona, p.sh. Prizren"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSelectedRegion(null);
                      setActiveSuggestion(0);
                      setSuggestionsOpen(true);
                      setSelectionError('');
                    }}
                    onFocus={() => setSuggestionsOpen(true)}
                    onBlur={() => setSuggestionsOpen(false)}
                    onKeyDown={handleKeyDown}
                    className="text-fg border-border focus:ring-primary/40 h-14 w-full rounded-xl border bg-white pl-11 pr-4 text-base focus:outline-none focus:ring-2"
                  />
                  {selectedRegion && (
                    <input type="hidden" name="regionId" value={selectedRegion.id} />
                  )}
                  {suggestionsOpen && query.trim() && (
                    <ul
                      id="home-region-suggestions"
                      role="listbox"
                      aria-label="Sugjerime për vendndodhjen"
                      className="border-border bg-surface absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border py-1 text-left shadow-lg"
                    >
                      {suggestions.length > 0 ? (
                        suggestions.map((region, index) => (
                          <li
                            id={`home-region-option-${region.id}`}
                            key={region.id}
                            role="option"
                            aria-selected={index === activeSuggestion}
                            onPointerDown={(event) => event.preventDefault()}
                            onPointerMove={() => setActiveSuggestion(index)}
                            onClick={() => selectRegion(region)}
                            className={`cursor-pointer px-4 py-3 ${index === activeSuggestion ? 'bg-border/40' : 'hover:bg-border/30'}`}
                          >
                            <span className="text-fg block text-sm font-medium">{region.name}</span>
                            <span className="text-muted block text-xs">
                              {getRegionContext(region)}
                            </span>
                          </li>
                        ))
                      ) : regionLookupAvailable ? (
                        <li role="status" className="text-muted px-4 py-3 text-sm">
                          Nuk u gjet vendndodhje që përputhet.
                        </li>
                      ) : null}
                    </ul>
                  )}
                  {selectionError && (
                    <p id="home-region-error" role="alert" className="text-danger mt-2 text-sm">
                      {selectionError}
                    </p>
                  )}
                  {!regionLookupAvailable && (
                    <p id="home-region-status" role="status" className="text-muted mt-2 text-sm">
                      Vendndodhjet nuk u ngarkuan. Provo përsëri më vonë ose pastro fushën për të
                      kërkuar pa vendndodhje.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-primary text-primary-fg hover:bg-primary/90 h-14 rounded-xl px-8 text-base font-semibold transition-colors md:min-w-[170px]"
                >
                  Kërko
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
