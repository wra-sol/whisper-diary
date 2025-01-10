import { json, type ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { mergeTranscripts } from '~/utils/transcriptMerger';
import { useEffect } from 'react';

type ActionData = 
  | { error: string; details?: string }
  | { 
      success: true; 
      csvData: string;
      markdownWithTimestamps: string;
      markdownClean: string;
      filename: string;
    };

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  const whisperFile = formData.get('whisper') as File;
  const premiereFile = formData.get('premiere') as File;

  if (!whisperFile || !premiereFile) {
    return json<ActionData>({ 
      error: 'Both files are required'
    });
  }

  try {
    const whisperText = await whisperFile.text();
    const premiereText = await premiereFile.text();
    
    if (!whisperText.trim() || !premiereText.trim()) {
      return json<ActionData>({ 
        error: 'Files appear to be empty',
        details: 'Please check that your CSV files contain valid data.'
      });
    }

    const { csv, markdownWithTimestamps, markdownClean } = mergeTranscripts(whisperText, premiereText);
    
    if (!csv.trim()) {
      return json<ActionData>({ 
        error: 'No valid segments were found to merge',
        details: 'Please check that your CSV files have the correct format and contain valid data.'
      });
    }
    
    const baseFilename = new Date().toISOString().split('T')[0];
    
    return json<ActionData>({ 
      success: true, 
      csvData: csv,
      markdownWithTimestamps,
      markdownClean,
      filename: baseFilename
    });
  } catch (error) {
    console.error(error);
    
    let errorMessage = 'Error processing files.';
    let details = 'Please ensure they are valid CSV files.';
    
    if (error instanceof Error) {
      if (error.message.includes('INVALID_OPENING_QUOTE')) {
        details = 'One of your CSV files has invalid quote formatting. Please check for mismatched quotes or try re-exporting the file.';
      } else if (error.message.includes('columns')) {
        details = 'The CSV files appear to have an incorrect column structure. Please ensure they match the expected format.';
      }
    }

    return json<ActionData>({ 
      error: errorMessage,
      details
    });
  }
}

export default function MergeRoute() {
  const actionData = useActionData<typeof action>();

  // Function to randomize a single particle
  const randomizeParticle = (index: number) => {
    const root = document.documentElement;
    const gridSize = 60;
    const maxGridsX = Math.floor(window.innerWidth / gridSize);
    const maxGridsY = Math.floor(window.innerHeight / gridSize);

    const isVertical = Math.random() > 0.5;
    const isPositive = Math.random() > 0.5;
    const gridLine = isVertical 
      ? Math.floor(Math.random() * maxGridsX) 
      : Math.floor(Math.random() * maxGridsY);
    
    root.style.setProperty(`--particle-${index}-pos`, `${gridLine * gridSize}px`);
    root.style.setProperty(`--particle-${index}-is-vertical`, isVertical ? '1' : '0');
    root.style.setProperty(`--particle-${index}-is-positive`, isPositive ? '1' : '0');
    
    // Reset the animation by removing and re-adding the particle
    const particle = document.querySelector(`.particle-${index}`) as HTMLElement;
    if (particle) {
      particle.classList.remove(`particle-${index}`);
      void particle.offsetWidth; // Force reflow
      particle.classList.add(`particle-${index}`);
    }
  };

  // Initial setup
  useEffect(() => {
    const initializeParticles = () => {
      // Stagger the initial generation
      [1, 2, 3].forEach((index, i) => {
        setTimeout(() => randomizeParticle(index), i * 2000);
      });

      // Set up animation end listeners for each particle
      [1, 2, 3].forEach(index => {
        const particle = document.querySelector(`.particle-${index}`);
        if (particle) {
          particle.addEventListener('animationend', () => randomizeParticle(index));
        }
      });
    };

    // Initialize after a short delay to ensure DOM is ready
    setTimeout(initializeParticles, 100);

    // Cleanup listeners on unmount
    return () => {
      [1, 2, 3].forEach(index => {
        const particle = document.querySelector(`.particle-${index}`);
        if (particle) {
          particle.removeEventListener('animationend', () => randomizeParticle(index));
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6 font-['Space_Mono'] relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15"></div>
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="max-w-4xl mx-auto py-12 relative">
        <h1 className="text-4xl font-bold mb-8 text-center text-cyan-300 tracking-[0.2em] glow-strong uppercase">
          Whisper Diary
        </h1>
        
        <div className="bg-slate-800/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] rounded-none p-8 border-2 border-cyan-400/30 backdrop-blur-sm">
          <Form method="post" encType="multipart/form-data" className="space-y-8">
            <div>
              <label className="block text-lg font-bold text-cyan-300 mb-3 tracking-[0.1em] uppercase">
                Whisper CSV File
              </label>
              <input
                type="file"
                name="whisper"
                accept=".csv"
                className="block w-full text-sm text-cyan-100
                  file:mr-4 file:py-2.5 file:px-6
                  file:rounded-none file:border-2 file:border-cyan-400/30
                  file:text-sm file:font-bold file:uppercase file:tracking-wider
                  file:bg-cyan-400/10 file:text-cyan-300
                  hover:file:bg-cyan-400/20 hover:file:border-cyan-400/50
                  hover:file:shadow-[0_0_20px_rgba(34,211,238,0.2)]
                  transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-cyan-300 mb-3 tracking-[0.1em] uppercase">
                Adobe Premiere CSV File
              </label>
              <input
                type="file"
                name="premiere"
                accept=".csv"
                className="block w-full text-sm text-cyan-100
                  file:mr-4 file:py-2.5 file:px-6
                  file:rounded-none file:border-2 file:border-cyan-400/30
                  file:text-sm file:font-bold file:uppercase file:tracking-wider
                  file:bg-cyan-400/10 file:text-cyan-300
                  hover:file:bg-cyan-400/20 hover:file:border-cyan-400/50
                  hover:file:shadow-[0_0_20px_rgba(34,211,238,0.2)]
                  transition-all duration-200"
                required
              />
            </div>

            <button
              type="submit"
              className="group relative w-full bg-cyan-500/20 text-cyan-300 py-4 px-6 rounded-none
                border-2 border-cyan-400/30 font-bold tracking-[0.2em] uppercase
                hover:bg-cyan-400/30 hover:border-cyan-400/50 hover:text-cyan-100
                focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.15)]
                hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] overflow-hidden"
            >
              <span className="relative z-10">Merge Transcripts</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0
                animate-shine"></div>
            </button>
          </Form>

          {actionData?.error && (
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-red-900/20 border-2 border-red-400/30 text-red-300 rounded-none shadow-[0_0_20px_rgba(248,113,113,0.15)]">
                {actionData.error}
              </div>
              {actionData.details && (
                <div className="p-4 bg-red-900/10 border-2 border-red-400/20 text-red-200 rounded-none text-sm">
                  {actionData.details}
                </div>
              )}
            </div>
          )}

          {actionData?.success && (
            <div className="mt-8 space-y-6">
              <div className="p-4 bg-emerald-900/20 border-2 border-emerald-400/30 text-emerald-300 rounded-none text-center uppercase tracking-wider shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                Transcripts merged successfully!
              </div>
              <div className="grid grid-cols-3 gap-6">
                <a
                  href={`data:text/csv;charset=utf-8,${encodeURIComponent(actionData.csvData)}`}
                  download={`${actionData.filename}-transcript.csv`}
                  className="group relative text-center bg-cyan-500/20 text-cyan-300 py-3 px-4
                    rounded-none border-2 border-cyan-400/30 font-bold tracking-[0.1em] uppercase
                    hover:bg-cyan-400/30 hover:border-cyan-400/50 hover:text-cyan-100
                    transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.15)]
                    hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] overflow-hidden"
                >
                  <span className="relative z-10">Download CSV</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0
                    animate-shine"></div>
                </a>
                <a
                  href={`data:text/markdown;charset=utf-8,${encodeURIComponent(actionData.markdownWithTimestamps)}`}
                  download={`${actionData.filename}-transcript-with-timestamps.md`}
                  className="group relative text-center bg-cyan-500/20 text-cyan-300 py-3 px-4
                    rounded-none border-2 border-cyan-400/30 font-bold tracking-[0.1em] uppercase
                    hover:bg-cyan-400/30 hover:border-cyan-400/50 hover:text-cyan-100
                    transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.15)]
                    hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] overflow-hidden"
                >
                  <span className="relative z-10">Download Markdown (with timestamps)</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0
                    animate-shine"></div>
                </a>
                <a
                  href={`data:text/markdown;charset=utf-8,${encodeURIComponent(actionData.markdownClean)}`}
                  download={`${actionData.filename}-transcript-clean.md`}
                  className="group relative text-center bg-cyan-500/20 text-cyan-300 py-3 px-4
                    rounded-none border-2 border-cyan-400/30 font-bold tracking-[0.1em] uppercase
                    hover:bg-cyan-400/30 hover:border-cyan-400/50 hover:text-cyan-100
                    transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.15)]
                    hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] overflow-hidden"
                >
                  <span className="relative z-10">Download Markdown (clean)</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0
                    animate-shine"></div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 