import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout';
import { AddCoinPage } from './pages/AddCoinPage';
import { ArchivePage } from './pages/ArchivePage';
import { AuctionsPage } from './pages/AuctionsPage';
import { CoinDetailPage } from './pages/CoinDetailPage';
import { CollectionPage } from './pages/CollectionPage';
import { EditCoinPage } from './pages/EditCoinPage';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { ScanCoinPage } from './pages/ScanCoinPage';
import { SettingsPage } from './pages/SettingsPage';
import { ValueEstimatePage } from './pages/ValueEstimatePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'scan', element: <ScanCoinPage /> },
      { path: 'add', element: <AddCoinPage /> },
      { path: 'collection', element: <CollectionPage /> },
      { path: 'collection/:coinId', element: <CoinDetailPage /> },
      { path: 'collection/:coinId/edit', element: <EditCoinPage /> },
      { path: 'value-estimate', element: <ValueEstimatePage /> },
      { path: 'archive', element: <ArchivePage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'auctions', element: <AuctionsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
