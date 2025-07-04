import { Message } from '@/components/ChatWindow';

export const getSuggestions = async (chatHisory: Message[]) => {
  const chatModel = localStorage.getItem('chatModel');
  const chatModelProvider = localStorage.getItem('chatModelProvider');

  const customOpenAIKey = localStorage.getItem('openAIApiKey');
  const customOpenAIBaseURL = localStorage.getItem('openAIBaseURL');

  const res = await fetch(`/api/suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatHistory: chatHisory,
      chatModel: {
        provider: chatModelProvider,
        model: chatModel,
        ...(chatModelProvider === 'custom_openai' && {
          customOpenAIKey,
          customOpenAIBaseURL,
        }),
      },
    }),
  });

  const data = (await res.json()) as { suggestions: string[] };

  return data.suggestions;
};

export const fetchHtmlPlot = async () => {
  try {
    // hit our rate‑limited API
    const res = await fetch('/api/plot');
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `${res.status} ${res.statusText}`);
    }
    return await res.text();
  } catch (error) {
    console.error('Error fetching plot:', error);
    throw error;
  }
};

export const savePlotData = async (messageId: string, plotData: string) => {
  try {
    const response = await fetch('/api/plot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId,
        plotData,
      }),
    });
  } catch (error) {
    console.error('Error saving plot data:', error);
    throw error;
  }
};
