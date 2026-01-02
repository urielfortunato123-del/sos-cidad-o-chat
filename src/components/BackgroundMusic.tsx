import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

const playlist = [
  '/audio/background-music.mp3',
  '/audio/cidadao-dos-ceus.mp3',
];

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.08;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  const handleTrackEnd = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={playlist[currentTrack]}
        preload="auto"
        onEnded={handleTrackEnd}
      />
      <div className="fixed bottom-4 left-4 z-50 flex gap-1">
        <Button
          onClick={toggleMusic}
          variant="outline"
          size="icon"
          className="rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 shadow-lg"
          aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
        >
          {isPlaying ? (
            <Volume2 className="h-5 w-5 text-primary" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
        {isPlaying && (
          <Button
            onClick={nextTrack}
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 shadow-lg"
            aria-label="Próxima música"
          >
            <SkipForward className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </>
  );
};

export default BackgroundMusic;
