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
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-3xl space-y-8">
              <div className="space-y-4">
                <h1 className="font-monplesir text-center text-8xl font-normal tracking-wide text-zinc-100 [text-shadow:0_6px_32px_rgba(0,0,0,1)] md:text-9xl">
                  tracx
                </h1>
                <p className="text-center text-base text-zinc-500">
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
    <div className={`flex h-screen bg-zinc-950 text-zinc-100 ${settings.allEnabled ? 'anim-all' : ''}`}>
      <Sidebar tab={tab} onChange={setTab} onExport={() => exportBackup(tasks)} />
      <main key={tab} className={`flex-1 overflow-y-auto p-4 md:p-8 ${settings.tabTransition ? 'anim-tab-in' : ''}`}>
        {content()}
      </main>
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
