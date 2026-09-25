import preview0 from '../assets/sales_snapshots/india-june.webp';
import preview1 from '../assets/sales_snapshots/us-july.webp';
import preview2 from '../assets/sales_snapshots/us-june.webp';
import preview3 from '../assets/sales_snapshots/india-short-july.webp';
import preview4 from '../assets/sales_snapshots/india-july.webp';
import firstSnapshotSource from '../assets/sales_snapshots/amazon-sales-snapshots-india-us-row.png';
import secondSnapshotSource from '../assets/sales_snapshots/amazon-sales-snapshots-four-marketplace-periods.png';

export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SalesSnapshot {
  id: string;
  sourceImage: string;
  sourceWidth: number;
  sourceHeight: number;
  crop: ImageCrop;
  alt: string;
  previewImage: string | null;
  caption: string;
  marketplace: string;
  published: boolean;
  featured: boolean;
}

// Lossless cropped WebP previews preserve the supplied screenshot pixels. The
// sales figures are never reconstructed as HTML or altered in a generated image.
export const SALES_SNAPSHOTS: readonly SalesSnapshot[] = [
  {
    id: 'amazon-india-june-2025',
    previewImage: preview0,
    caption: 'June 2025',
    marketplace: 'Amazon India',
    published: true,
    featured: true,
    sourceImage: firstSnapshotSource,
    sourceWidth: 2940,
    sourceHeight: 1228,
    crop: { x: 315, y: 500, width: 1142, height: 696 },
    alt: 'Amazon India sales analysis screenshot for 1/6/2025 to 30/6/2025',
  },
  {
    id: 'amazon-us-july-2025',
    previewImage: preview1,
    caption: 'July 2025',
    marketplace: 'Amazon US',
    published: true,
    featured: true,
    sourceImage: firstSnapshotSource,
    sourceWidth: 2940,
    sourceHeight: 1228,
    crop: { x: 1482, y: 500, width: 1142, height: 696 },
    alt: 'Amazon US sales analysis screenshot for 7/1/2025 to 7/31/2025',
  },
  {
    id: 'amazon-us-june-2025',
    previewImage: preview2,
    caption: 'June 2025',
    marketplace: 'Amazon US',
    published: true,
    featured: false,
    sourceImage: secondSnapshotSource,
    sourceWidth: 2940,
    sourceHeight: 1524,
    crop: { x: 315, y: 15, width: 1142, height: 696 },
    alt: 'Amazon US sales analysis screenshot for 6/1/2025 to 6/30/2025',
  },
  {
    id: 'amazon-india-december-january-2025',
    previewImage: null,
    caption: 'Source period requires clarification',
    marketplace: 'Amazon India',
    published: false,
    featured: false,
    sourceImage: secondSnapshotSource,
    sourceWidth: 2940,
    sourceHeight: 1524,
    crop: { x: 1482, y: 15, width: 1142, height: 696 },
    alt: 'Amazon India sales analysis screenshot for 12/1/2025 to 1/31/2025',
  },
  {
    id: 'amazon-india-july-short-period-2025',
    previewImage: preview3,
    caption: '10–11 July 2025',
    marketplace: 'Amazon India',
    published: true,
    featured: false,
    sourceImage: secondSnapshotSource,
    sourceWidth: 2940,
    sourceHeight: 1524,
    crop: { x: 315, y: 735, width: 1142, height: 696 },
    alt: 'Amazon India sales analysis screenshot for 10/7/2025 to 11/7/2025',
  },
  {
    id: 'amazon-india-july-2025',
    previewImage: preview4,
    caption: 'July 2025',
    marketplace: 'Amazon India',
    published: true,
    featured: false,
    sourceImage: secondSnapshotSource,
    sourceWidth: 2940,
    sourceHeight: 1524,
    crop: { x: 1482, y: 735, width: 1142, height: 696 },
    alt: 'Amazon India sales analysis screenshot for 1/7/2025 to 31/7/2025',
  },
] as const;

export const PUBLISHED_SALES_SNAPSHOTS = SALES_SNAPSHOTS.filter(snapshot => snapshot.published && snapshot.previewImage);
