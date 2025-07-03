"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Plus,
  Minus,
  Clock
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // segundos
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Recalcular tempo total quando a duração muda
  const totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds;
  
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(totalTimeInSeconds);
    }
  }, [hours, minutes, seconds, isRunning]);

  // Formatar tempo em HH:MM:SS ou MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular progresso para a barra
  const getProgress = () => {
    if (totalTimeInSeconds === 0) return 0;
    return ((totalTimeInSeconds - timeLeft) / totalTimeInSeconds) * 100;
  };

  // Controlar o timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const id = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeLeft]);

  // Iniciar timer com transição suave
  const startTimer = () => {
    if (totalTimeInSeconds > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsRunning(true);
        setIsTransitioning(false);
      }, 500);
    }
  };

  // Pausar/Resumir timer
  const toggleTimer = () => {
    if (isRunning) {
      // Pausar
      setIsRunning(false);
    } else {
      // Resumir
      if (timeLeft > 0) {
        setIsRunning(true);
      }
    }
  };

  // Parar e voltar para UI completa
  const stopTimer = () => {
    setIsTransitioning(true);
    setIsRunning(false);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Resetar timer
  const resetTimer = () => {
    setTimeLeft(totalTimeInSeconds);
    setIsRunning(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Aplicar configurações
  const applySettings = () => {
    resetTimer();
    setSettingsOpen(false);
  };

  // Funções para ajustar tempo
  const adjustTime = (type: 'hours' | 'minutes' | 'seconds', operation: 'add' | 'subtract') => {
    const adjust = (current: number, max: number) => {
      if (operation === 'add') {
        return current >= max ? 0 : current + 1;
      } else {
        return current <= 0 ? max : current - 1;
      }
    };

    switch (type) {
      case 'hours':
        setHours(adjust(hours, 23));
        break;
      case 'minutes':
        setMinutes(adjust(minutes, 59));
        break;
      case 'seconds':
        setSeconds(adjust(seconds, 59));
        break;
    }
  };

  // Determinar se deve mostrar UI minimalista
  const showMinimalUI = isRunning || isTransitioning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 transition-all duration-500">
      {/* Theme Toggle - sempre visível */}
      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>

      <div className="w-full max-w-lg mx-auto">
        <Card className="shadow-2xl border bg-card/95 backdrop-blur-sm transition-all duration-700 ease-in-out">
          <CardContent className={`transition-all duration-700 ease-in-out ${showMinimalUI ? 'p-12' : 'p-0'}`}>
            
            {/* Header - esconde gradualmente quando timer inicia */}
            <div className={`transition-all duration-500 ease-in-out ${
              showMinimalUI ? 'opacity-0 -translate-y-4 max-h-0 overflow-hidden' : 'opacity-100 translate-y-0 max-h-full'
            }`}>
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="transition-all duration-300">
                    <Clock className="h-4 w-4 mr-1" />
                    Timer
                  </Badge>
                  
                  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Configurações do Timer</DialogTitle>
                        <DialogDescription>
                          Ajuste o tempo usando os botões abaixo para evitar erros.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-8 py-6">
                        {/* Horas */}
                        <div className="space-y-4">
                          <div className="text-center font-medium">Horas</div>
                          <div className="flex items-center justify-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => adjustTime('hours', 'subtract')}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="text-3xl font-mono font-bold w-16 text-center">
                              {hours.toString().padStart(2, '0')}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => adjustTime('hours', 'add')}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Minutos */}
                        <div className="space-y-4">
                          <div className="text-center font-medium">Minutos</div>
                          <div className="flex items-center justify-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => adjustTime('minutes', 'subtract')}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="text-3xl font-mono font-bold w-16 text-center">
                              {minutes.toString().padStart(2, '0')}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => adjustTime('minutes', 'add')}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Segundos */}
                        <div className="space-y-4">
                          <div className="text-center font-medium">Segundos</div>
                          <div className="flex items-center justify-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => adjustTime('seconds', 'subtract')}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="text-3xl font-mono font-bold w-16 text-center">
                              {seconds.toString().padStart(2, '0')}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => adjustTime('seconds', 'add')}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={applySettings}>
                          Aplicar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <CardTitle className="text-3xl font-light text-foreground mt-2">
                  Pomodoro Timer
                </CardTitle>
              </CardHeader>
            </div>

            {/* Conteúdo principal - sempre visível mas muda layout */}
            <div className={`space-y-8 transition-all duration-700 ease-in-out ${
              showMinimalUI ? 'py-0' : 'p-8'
            }`}>
              
              {/* Timer Display */}
              <div className="text-center">
                <div className={`font-mono font-light tracking-tight transition-all duration-700 ease-in-out ${
                  showMinimalUI ? 'text-8xl sm:text-9xl' : 'text-7xl sm:text-8xl'
                } ${
                  timeLeft <= 10 && timeLeft > 0 ? 'text-destructive animate-pulse' : 'text-foreground'
                }`}>
                  {formatTime(timeLeft)}
                </div>
                <div className={`text-muted-foreground transition-all duration-500 ease-in-out ${
                  showMinimalUI ? 'mt-4 text-lg' : 'mt-3 text-lg'
                }`}>
                  {timeLeft === 0 ? 
                    "Tempo esgotado! 🎉" : 
                    showMinimalUI ? 
                      (isRunning ? "Timer em andamento..." : "Timer pausado") :
                      (timeLeft === totalTimeInSeconds ? "Pronto para iniciar" : "Configure um tempo para começar")
                  }
                </div>
              </div>

              {/* Progress Bar */}
              <div className={`space-y-3 transition-all duration-500 ease-in-out ${
                showMinimalUI ? 'space-y-4' : 'space-y-3'
              }`}>
                <Progress 
                  value={getProgress()} 
                  className={`transition-all duration-500 ${
                    showMinimalUI ? 'h-4' : 'h-3'
                  }`}
                />
                <div className={`text-sm text-muted-foreground transition-all duration-500 ${
                  showMinimalUI ? 'text-center' : 'flex justify-between'
                }`}>
                  {showMinimalUI ? (
                    <span>{Math.round(getProgress())}% concluído</span>
                  ) : (
                    <>
                      <span>0:00</span>
                      <span className="text-center">
                        {Math.round(getProgress())}% concluído
                      </span>
                      <span>{formatTime(totalTimeInSeconds)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Separator - esconde quando timer roda */}
              <div className={`transition-all duration-500 ease-in-out ${
                showMinimalUI ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-full'
              }`}>
                <Separator className="my-6" />
              </div>

              {/* Controls */}
              <div className={`flex justify-center gap-4 transition-all duration-500 ease-in-out ${
                showMinimalUI ? 'pt-4' : 'pt-0'
              }`}>
                {showMinimalUI ? (
                  /* Controles quando timer está rodando/pausado */
                  <>
                    <Button
                      onClick={toggleTimer}
                      size="lg"
                      className={`px-12 py-6 text-xl font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="mr-3 h-7 w-7" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="mr-3 h-7 w-7" />
                          Resumir
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={stopTimer}
                      size="lg"
                      variant="destructive"
                      className="px-12 py-6 text-xl font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <RotateCcw className="mr-3 h-7 w-7" />
                      Parar
                    </Button>
                  </>
                ) : (
                  /* Controles quando timer não está rodando */
                  <>
                    <Button
                      onClick={startTimer}
                      size="lg"
                      disabled={totalTimeInSeconds === 0}
                      className="px-10 py-6 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Play className="mr-3 h-6 w-6" />
                      Iniciar
                    </Button>
                    
                    <Button
                      onClick={resetTimer}
                      size="lg"
                      variant="outline"
                      className="px-10 py-6 text-lg font-medium rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      <RotateCcw className="mr-3 h-6 w-6" />
                      Resetar
                    </Button>
                  </>
                )}
              </div>

              {/* Tempo configurado - esconde quando timer roda */}
              <div className={`transition-all duration-500 ease-in-out ${
                showMinimalUI ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-full'
              }`}>
                {totalTimeInSeconds > 0 && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Tempo configurado: {formatTime(totalTimeInSeconds)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
