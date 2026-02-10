import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

const playlist = [
  { src: '/audio/background-music.mp3', title: 'Música Ambiente' },
  { src: '/audio/cidadao-dos-ceus.mp3', title: 'Cidadão dos Céus' },
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
        src={playlist[currentTrack].src}
        preload="auto"
        onEnded={handleTrackEnd}
      />
      <div className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center px-4 py-1.5 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Button
            onClick={toggleMusic}
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
          >
            {isPlaying ? (
              <Volume2 className="h-4 w-4 text-primary" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Music className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {isPlaying ? playlist[currentTrack].title : 'Música desligada'}
            </span>
          </div>

          {isPlaying && (
            <Button
              onClick={nextTrack}
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Próxima música"
            >
              <SkipForward className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default BackgroundMusic;
