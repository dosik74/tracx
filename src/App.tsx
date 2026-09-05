import { useState } from 'react';
import type { Tab } from './types';
import { useTasks } from './hooks/useTasks';
import { SettingsProvider, useSettings } from './hooks/useSettings';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { exportBackup } from './utils/backup';
import { today } from './utils/date';
import { supabaseEnabled } from './utils/supabase';
import Sidebar from './components/Sidebar';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import CalendarTab from './components/CalendarTab';
import Profile from './components/Profile';
import BackupManager from './components/BackupManager';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/AuthPage';
import { Loader2 } from 'lucide-react';

function Shell() {
  const [tab, setTab] = useState<Tab>('tasks');
  const { user } = useAuth();
  const store = useTasks(user?.id);
  const { tasks } = store;
  const { settings } = useSettings();

  const content = () => {
    switch (tab) {
      case 'tasks':
        return (
            <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center px-1 py-6 md:min-h-[calc(100dvh-4rem)] md:items-start md:pt-[18vh]">
            <div className="w-full space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="font-monplesir text-center text-6xl font-normal tracking-wide text-zinc-100 [text-shadow:0_6px_32px_rgba(0,0,0,1)] sm:text-8xl md:text-9xl">
                  tracx
                </h1>
                <p className="px-4 text-center text-sm text-zinc-500 sm:text-base">
                  Опишите задачу или вставьте сообщение клиента
                </p>
              </div>
              <TaskInput
                defaultDate={today()}
                onAdd={store.addMany}
                onAdded={() => setTab('list')}
              />
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="space-y-5">
            <TaskList tasks={tasks} api={store} />
            <BackupManager tasks={tasks} onImport={store.replaceAll} />
          </div>
        );
      case 'calendar':
        return (
          <CalendarTab
            tasks={tasks}
            onToggle={store.toggle}
            onUpdate={store.update}
            onRemove={store.remove}
          />
        );
      case 'profile':
        return (
          <div className="space-y-5">
            <Profile tasks={tasks} />
            <BackupManager tasks={tasks} onImport={store.replaceAll} />
          </div>
        );
      case 'settings':
        return <SettingsPage />;
    }
  };

  return (
    <div className={`flex h-dvh flex-col overflow-hidden bg-zinc-950 text-zinc-100 md:flex-row ${settings.allEnabled ? 'anim-all' : ''}`}>
      <Sidebar tab={tab} onChange={setTab} onExport={() => exportBackup(tasks)} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-28 pt-4 md:p-8 md:pb-8">
        <main key={tab} className={`mx-auto w-full max-w-3xl ${settings.tabTransition ? 'anim-tab-in' : ''}`}>
          {content()}
        </main>
      </div>
    </div>
  );
}

function Gate() {
  const { session, loading } = useAuth();

  if (!supabaseEnabled) return <Shell />; // офлайн-режим без базы
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }
  if (!session) return <AuthPage />;
  return <Shell />;
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Gate />
      </SettingsProvider>
    </AuthProvider>
  );
}
