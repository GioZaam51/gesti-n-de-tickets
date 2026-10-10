/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TicketProvider, useTickets } from './context/TicketContext';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { KanbanBoard } from './components/KanbanBoard';
import { TicketList } from './components/TicketList';
import { AnalyticsView } from './components/AnalyticsView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { TeamDirectoryView } from './components/TeamDirectoryView';
import { CustomerPortalView } from './components/CustomerPortalView';
import { PhpProjectView } from './components/PhpProjectView';
import { AiExtractorView } from './components/AiExtractorView';
import { TicketDetailModal } from './components/TicketDetailModal';
import { CreateTicketModal } from './components/CreateTicketModal';

const AppContent: React.FC = () => {
  const { viewMode } = useTickets();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Only show top quick metrics on ticket management views */}
        {(viewMode === 'kanban' || viewMode === 'list') && <MetricsBar />}

        {/* Dynamic view rendering */}
        {viewMode === 'kanban' && <KanbanBoard />}
        {viewMode === 'list' && <TicketList />}
        {viewMode === 'ai_extractor' && <AiExtractorView />}
        {viewMode === 'analytics' && <AnalyticsView />}
        {viewMode === 'php' && <PhpProjectView />}
        {viewMode === 'knowledge' && <KnowledgeBaseView />}
        {viewMode === 'team' && <TeamDirectoryView />}
        {viewMode === 'portal' && <CustomerPortalView />}
      </main>

      {/* Modals */}
      <TicketDetailModal />
      <CreateTicketModal />
    </div>
  );
};

export default function App() {
  return (
    <TicketProvider>
      <AppContent />
    </TicketProvider>
  );
}
