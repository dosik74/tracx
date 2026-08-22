import { useState } from 'react';
import type { Tab } from './types';
import { useTasks } from './hooks/useTasks';
import { SettingsProvider, useSettings } from './hooks/useSettings';
import { exportBackup } from './utils/backup';
import { today } from './utils/date';
import Sidebar from './components/Sidebar';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import CalendarTab from './components/CalendarTab';
import Profile from './components/Profile';
import BackupManager from './components/BackupManager';
import SettingsPage from './components/SettingsPage';

function Shell() {
  const [tab, setTab] = useState<Tab>('tasks');
  const store = useTasks();
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

export default function App() {
  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  );
}
