import { describe, it, expect } from 'vitest';
import { TicketmasterCatalogProvider } from '../providers/TicketmasterCatalogProvider';
import { CatalogService } from '../services/CatalogService';

describe('Ticketmaster Discovery Catalog Provider', () => {
  const provider = new TicketmasterCatalogProvider();
  const catalogService = new CatalogService();

  it('should search Ticketmaster events and return mapped catalog items', async () => {
    const results = await provider.search('Coldplay');
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    const first = results[0];
    expect(first.title).toContain('Coldplay');
    expect(first.source).toBe('TICKETMASTER');
    expect(first.category).toBe('CONCERT');
    expect(first.venue).toBeDefined();
  });

  it('should get trending Ticketmaster events', async () => {
    const results = await provider.getTrending();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].source).toBe('TICKETMASTER');
  });

  it('should get a Ticketmaster event by ID', async () => {
    const item = await provider.getById('tm-rockinrio-2026');
    expect(item).not.toBeNull();
    expect(item?.title).toContain('Rock World Festival');
    expect(item?.category).toBe('CONCERT');
    expect(item?.venue).toContain('Cidade do Rock');
  });

  it('should support searching across multi-source catalogs via CatalogService', async () => {
    const allResults = await catalogService.search('', 'ALL');
    expect(allResults.length).toBeGreaterThan(0);

    const hasTicketmaster = allResults.some((i) => i.source === 'TICKETMASTER');
    const hasTmdb = allResults.some((i) => i.source === 'TMDB');
    expect(hasTicketmaster).toBe(true);
    expect(hasTmdb).toBe(true);
  });
});
