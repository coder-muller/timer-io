"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Coffee, 
  Clock,
  CheckCircle2 
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

type TimerMode = 'work' | 'break';

export default function Home() {
  const [workDuration, setWorkDuration] = useState(25); // minutos
  const [breakDuration, setBreakDuration] = useState(5); // minutos
  const [timeLeft, setTimeLeft] = useState(25 * 60); // segundos
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [mode, setMode] = useState<TimerMode>('work');
  const [completedCycles, setCompletedCycles] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Recalcular tempo quando a duração muda
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
    }
  }, [workDuration, breakDuration, mode, isRunning]);

  // Formatar tempo em MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular progresso para a barra
  const getProgress = () => {
    const totalTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Alternar entre modo trabalho e descanso
  const switchMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? workDuration * 60 : breakDuration * 60);
    setIsRunning(false);
    
    if (mode === 'work') {
      setCompletedCycles(prev => prev + 1);
    }
  };

  // Controlar o timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const id = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Auto-switch para o próximo modo quando o tempo acabar
            setTimeout(() => {
              switchMode();
            }, 1000);
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

  // Iniciar/Pausar timer
  const toggleTimer = () => {
    if (timeLeft === 0) {
      resetTimer();
    } else {
      setIsRunning(!isRunning);
    }
  };

  // Resetar timer
  const resetTimer = () => {
    const newTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
    setTimeLeft(newTime);
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

  const currentModeLabel = mode === 'work' ? 'Trabalho' : 'Descanso';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 transition-all duration-500">
      {/* Header com Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>

      {/* Estatísticas no canto superior esquerdo */}
      <div className="absolute top-6 left-6 z-10">
        <Card className="bg-card/80 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {completedCycles} ciclos concluídos
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full max-w-lg mx-auto shadow-2xl border bg-card/90 backdrop-blur-sm transition-all duration-300 hover:shadow-3xl transform hover:scale-[1.02]">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant={mode === 'work' ? 'default' : 'secondary'}
                className="transition-all duration-300"
              >
                {mode === 'work' ? <Clock className="h-4 w-4 mr-1" /> : <Coffee className="h-4 w-4 mr-1" />}
                {currentModeLabel}
              </Badge>
            </div>
            
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
                    Ajuste os tempos de trabalho e descanso conforme sua preferência.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="work-duration">Tempo de Trabalho (minutos)</Label>
                    <Input
                      id="work-duration"
                      type="number"
                      min="1"
                      max="120"
                      value={workDuration}
                      onChange={(e) => setWorkDuration(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="break-duration">Tempo de Descanso (minutos)</Label>
                    <Input
                      id="break-duration"
                      type="number"
                      min="1"
                      max="60"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number(e.target.value))}
                    />
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
        
        <CardContent className="space-y-8 p-8">
          {/* Timer Display */}
          <div className="text-center transform transition-all duration-300">
            <div className={`text-7xl sm:text-8xl font-mono font-light tracking-tight transition-all duration-500 ${
              timeLeft <= 10 && timeLeft > 0 ? 'text-destructive animate-pulse' : 'text-foreground'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <div className="mt-3 text-lg text-muted-foreground transition-all duration-300">
              {timeLeft === 0 ? 
                "Tempo esgotado! 🎉" : 
                isRunning ? 
                  `${currentModeLabel} em andamento...` : 
                  `${currentModeLabel} pausado`
              }
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress 
              value={getProgress()} 
              className="h-3 transition-all duration-500"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0:00</span>
              <span className="text-center">
                {Math.round(getProgress())}% concluído
              </span>
              <span>{formatTime(mode === 'work' ? workDuration * 60 : breakDuration * 60)}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={toggleTimer}
              size="lg"
              className="px-10 py-6 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-3 h-6 w-6" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="mr-3 h-6 w-6" />
                  {timeLeft === 0 ? "Iniciar" : "Continuar"}
                </>
              )}
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
          </div>

          {/* Próximo ciclo info */}
          {timeLeft > 0 && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              Próximo: {mode === 'work' ? `Descanso (${breakDuration}min)` : `Trabalho (${workDuration}min)`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
