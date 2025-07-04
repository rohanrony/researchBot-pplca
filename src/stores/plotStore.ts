import { create } from 'zustand'

interface PlotState {
  plotEnabled: boolean
  setPlotEnabled: (v: boolean) => void
  togglePlot: () => void
}

export const usePlotStore = create<PlotState>(set => ({
  plotEnabled: false,
  setPlotEnabled: (v: boolean) => set({ plotEnabled: v }),
  togglePlot: () => set(state => ({ plotEnabled: !state.plotEnabled })),
}))
