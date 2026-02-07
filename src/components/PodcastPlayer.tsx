import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface PodcastPlayerProps {
  podcastUrl: string;
  podcastUrlHindi?: string;
  ideaTitle: string;
  ideaId: number;
  duration?: number;
  onClose: () => void;
}

export function PodcastPlayer({ podcastUrl, podcastUrlHindi, ideaTitle, ideaId, duration, onClose }: PodcastPlayerProps) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  
  const currentUrl = language === 'hi' && podcastUrlHindi ? podcastUrlHindi : podcastUrl;

  // Track analytics event
  const trackEvent = async (eventType: 'play' | 'pause' | 'complete' | 'seek') => {
    try {
      await supabase.from('podcast_analytics').insert({
        idea_id: ideaId,
        user_id: user?.id || null,
        event_type: eventType,
        progress_seconds: Math.floor(currentTime),
        session_id: sessionId,
      });
    } catch (error) {
      logger.error('Failed to track podcast analytics:', error);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      trackEvent('pause');
    } else {
      audioRef.current.play();
      trackEvent('play');
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Track completion at 95%
      if (audioRef.current.currentTime / audioRef.current.duration >= 0.95) {
        trackEvent('complete');
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      trackEvent('seek');
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentUrl;
    link.download = `${ideaTitle}_${language}.mp3`;
    link.click();
  };
  
  const handleLanguageChange = (newLang: 'en' | 'hi') => {
    const wasPlaying = isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setLanguage(newLang);
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Restart playback after a short delay if it was playing
    if (wasPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 shadow-lg">
      <audio
        key={currentUrl}
        ref={audioRef}
        src={currentUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="container mx-auto px-4 py-3">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-xs text-muted-foreground mb-1">🎧 Don't have time to read? Listen instead</p>
              <p className="font-medium text-sm truncate">{ideaTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {podcastUrlHindi && (
                <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                  <Button
                    size="sm"
                    variant={language === 'en' ? 'default' : 'ghost'}
                    onClick={() => handleLanguageChange('en')}
                    className="h-6 px-2 text-xs rounded-full"
                  >
                    EN
                  </Button>
                  <Button
                    size="sm"
                    variant={language === 'hi' ? 'default' : 'ghost'}
                    onClick={() => handleLanguageChange('hi')}
                    className="h-6 px-2 text-xs rounded-full"
                  >
                    HI
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="icon"
              onClick={togglePlayPause}
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={totalDuration || 100}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="default"
              size="icon"
              onClick={togglePlayPause}
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            
            {podcastUrlHindi && (
              <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                <Button
                  size="sm"
                  variant={language === 'en' ? 'default' : 'ghost'}
                  onClick={() => handleLanguageChange('en')}
                  className="h-7 px-3 text-xs rounded-full"
                >
                  EN
                </Button>
                <Button
                  size="sm"
                  variant={language === 'hi' ? 'default' : 'ghost'}
                  onClick={() => handleLanguageChange('hi')}
                  className="h-7 px-3 text-xs rounded-full"
                >
                  HI
                </Button>
              </div>
            )}
            
            <div className="min-w-0 flex-shrink">
              <p className="text-xs text-muted-foreground">🎧 Don't have time to read? Listen instead</p>
              <p className="font-medium text-sm truncate">{ideaTitle}</p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            <Slider
              value={[currentTime]}
              max={totalDuration || 100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
            
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
