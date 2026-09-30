import React from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { useAppStore } from '@/store/useAppStore';
import { Editor } from '@/components/Editor/Editor';

const theme = createTheme({
  fontFamily: 'Mukta, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  primaryColor: 'blue',
  defaultRadius: 'md',
});

export const App: React.FC = () => {
  const { config } = useAppStore();

  return (
    <MantineProvider
      theme={theme}
      forceColorScheme={config.nightMode ? 'dark' : 'light'}
    >
      <Editor />
    </MantineProvider>
  );
};

export default App;
