import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

interface PremiereSegment {
  'Speaker Name': string;
  'Start Time': string;
  'End Time': string;
  'Text': string;
}

interface EnhancedSegment {
  speaker: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptOutput {
  csv: string;
  markdownWithTimestamps: string;
  markdownClean: string;
}

// Convert timecode (HH;MM;SS;FF) to milliseconds
function timecodeToMs(timecode: string): number {
  const [hours, minutes, seconds, frames] = timecode.split(';').map(Number);
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + Math.floor(frames * (1000 / 30));
}

// Convert milliseconds to timecode
function msToTimecode(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const frames = Math.floor((ms % 1000) * 30 / 1000);
  
  return `${hours.toString().padStart(2, '0')};${minutes.toString().padStart(2, '0')};${seconds.toString().padStart(2, '0')};${frames.toString().padStart(2, '0')}`;
}

// Find the speaker for a given timestamp
function findSpeakerAtTime(timeMs: number, premiereSegments: PremiereSegment[]): string {
  for (const segment of premiereSegments) {
    const startMs = timecodeToMs(segment['Start Time']);
    const endMs = timecodeToMs(segment['End Time']);
    if (timeMs >= startMs && timeMs <= endMs) {
      return segment['Speaker Name'];
    }
  }
  return 'Unknown';
}

// Generate markdown from enhanced segments
function generateMarkdown(segments: EnhancedSegment[], includeTimestamps: boolean): string {
  let markdown = '';
  let currentSpeaker = '';
  let currentSegments: { text: string; startTime: number; endTime: number }[] = [];

  segments.forEach((segment, index) => {
    // If speaker changes or it's the last segment
    if (segment.speaker !== currentSpeaker || index === segments.length - 1) {
      // Add current segment to collection before processing
      if (index === segments.length - 1) {
        currentSegments.push({
          text: segment.text,
          startTime: segment.startTime,
          endTime: segment.endTime
        });
      }

      // Output previous speaker's segments if we have any
      if (currentSegments.length > 0) {
        markdown += `**${currentSpeaker}**\n`;
        currentSegments.forEach(seg => {
          if (includeTimestamps) {
            markdown += `[${msToTimecode(seg.startTime)} - ${msToTimecode(seg.endTime)}] ${seg.text}\n`;
          } else {
            markdown += `${seg.text}\n`;
          }
        });
        markdown += '\n';
      }

      // Reset for new speaker
      currentSpeaker = segment.speaker;
      currentSegments = [];
      
      // Add current segment unless it's the last one (already added above)
      if (index !== segments.length - 1) {
        currentSegments.push({
          text: segment.text,
          startTime: segment.startTime,
          endTime: segment.endTime
        });
      }
    } else {
      // Same speaker, add to current segments
      currentSegments.push({
        text: segment.text,
        startTime: segment.startTime,
        endTime: segment.endTime
      });
    }
  });

  return markdown;
}

export function mergeTranscripts(whisperCsv: string, premiereCsv: string): TranscriptOutput {
  // Parse input CSVs
  const whisperSegments = parse(whisperCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: true,
  }) as WhisperSegment[];

  const premiereSegments = parse(premiereCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
    skip_records_with_empty_values: true,
    quote: '"',
    escape: '"',
  }) as PremiereSegment[];

  // Enhance Whisper segments with speaker information
  const enhancedSegments: EnhancedSegment[] = whisperSegments.map(whisperSegment => {
    // Find speaker at the midpoint of the segment
    const midpointMs = whisperSegment.start + (whisperSegment.end - whisperSegment.start) / 2;
    const speaker = findSpeakerAtTime(midpointMs, premiereSegments);

    return {
      speaker,
      startTime: whisperSegment.start,
      endTime: whisperSegment.end,
      text: whisperSegment.text.trim()
    };
  });

  // Generate CSV output
  const csv = stringify(
    enhancedSegments.map(segment => ({
      speaker: segment.speaker,
      startTime: msToTimecode(segment.startTime),
      endTime: msToTimecode(segment.endTime),
      text: segment.text
    })), {
      header: true,
      columns: ['speaker', 'startTime', 'endTime', 'text'],
      quoted: true,
      quote: '"',
      escape: '"',
    }
  );

  // Generate both Markdown versions
  const markdownWithTimestamps = generateMarkdown(enhancedSegments, true);
  const markdownClean = generateMarkdown(enhancedSegments, false);

  return { csv, markdownWithTimestamps, markdownClean };
} 