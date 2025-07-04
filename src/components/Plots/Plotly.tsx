// 'use client';

// import { useEffect, useRef, useState } from 'react';


// interface PlotlyComponentProps {
//   figData: any; // Replace with more specific type if known
// }

// const PlotlyComponent = ({ figData }: PlotlyComponentProps) => {
//   const plotRef = useRef(null);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [plotlyModule, setPlotlyModule] = useState(null);


//   // Create the plot when Plotly is loaded and figData changes
//   useEffect(() => {
//     if (isLoaded && plotlyModule && figData && plotRef.current) {
//       try {
//         // Parse the JSON string if it's a string
//         const parsedData =
//           typeof figData === 'string' ? JSON.parse(figData) : figData;

//         // Clear any existing plots
//         plotlyModule.purge(plotRef.current);

//         // Create new plot
//         plotlyModule.newPlot(
//           plotRef.current,
//           parsedData.data || [],
//           parsedData.layout || {},
//           parsedData.config || { responsive: true },
//         );

//         // Optional: Add responsive behavior
//         const handleResize = () => {
//           plotlyModule.Plots.resize(plotRef.current);
//         };

//         window.addEventListener('resize', handleResize);
//         return () => {
//           window.removeEventListener('resize', handleResize);
//           if (plotRef.current) {
//             plotlyModule.purge(plotRef.current);
//           }
//         };
//       } catch (error) {
//         console.error('Error rendering Plotly chart:', error);
//       }
//     }
//   }, [isLoaded, plotlyModule, figData]);

//   return (
//     <div className="w-full">
//       {!isLoaded && (
//         <div className="flex justify-center items-center h-64">
//           Loading plot...
//         </div>
//       )}
//       <div ref={plotRef} className="w-full h-full" />
//     </div>
//   );
// };

// export default PlotlyComponent;
