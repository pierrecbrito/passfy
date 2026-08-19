import { Request, Response } from 'express';
import { CatalogService } from '../services/CatalogService';

const catalogService = new CatalogService();

export class CatalogController {
  static async search(req: Request, res: Response): Promise<Response> {
    const query = req.query.query ? String(req.query.query) : '';
    const items = await catalogService.search(query);
    return res.status(200).json({ items });
  }

  static async trending(req: Request, res: Response): Promise<Response> {
    const items = await catalogService.getTrending();
    return res.status(200).json({ items });
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const item = await catalogService.getById(id);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        code: 'CATALOG_ITEM_NOT_FOUND',
        message: 'Item do catálogo não encontrado.',
      });
    }
    return res.status(200).json({ item });
  }
}
