import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BusinessRules {
  horasPorTurno: number;
  horasMaxVenezuela: number;
  horasMaxColombia: number;
  horasMaxMexico: number;
  horasMaxItalia: number;
  horasMaxEuropa: number;
  turnos: {
    madrugada: { inicio: string; fin: string; horas: number };
    manana: { inicio: string; fin: string; horas: number };
    tarde: { inicio: string; fin: string; horas: number };
    senior_nocturno: { inicio: string; fin: string; horas: number };
  };
}

interface BusinessRulesEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rules: BusinessRules) => void;
}

export const BusinessRulesEditor: React.FC<BusinessRulesEditorProps> = ({
  open,
  onOpenChange,
  onSave
}) => {
  const [rules, setRules] = useState<BusinessRules>({
    horasPorTurno: 8,
    horasMaxVenezuela: 45,
    horasMaxColombia: 44,
    horasMaxMexico: 44,
    horasMaxItalia: 45,
    horasMaxEuropa: 40,
    turnos: {
      madrugada: { inicio: '00:00', fin: '08:00', horas: 8 },
      manana: { inicio: '08:00', fin: '16:00', horas: 8 },
      tarde: { inicio: '16:00', fin: '00:00', horas: 8 },
      senior_nocturno: { inicio: '20:00', fin: '04:00', horas: 8 }
    }
  });

  const updateRule = (field: keyof BusinessRules, value: any) => {
    setRules(prev => ({ ...prev, [field]: value }));
  };

  const updateTurno = (turno: string, field: string, value: any) => {
    setRules(prev => ({
      ...prev,
      turnos: {
        ...prev.turnos,
        [turno]: {
          ...prev.turnos[turno as keyof typeof prev.turnos],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    onSave(rules);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reglas de Negocio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Horas de Trabajo por País</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venezuela">Venezuela (horas/semana)</Label>
                  <Input
                    id="venezuela"
                    type="number"
                    value={rules.horasMaxVenezuela}
                    onChange={(e) => updateRule('horasMaxVenezuela', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="colombia">Colombia (horas/semana)</Label>
                  <Input
                    id="colombia"
                    type="number"
                    value={rules.horasMaxColombia}
                    onChange={(e) => updateRule('horasMaxColombia', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="mexico">México (horas/semana)</Label>
                  <Input
                    id="mexico"
                    type="number"
                    value={rules.horasMaxMexico}
                    onChange={(e) => updateRule('horasMaxMexico', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="italia">Italia (horas/semana)</Label>
                  <Input
                    id="italia"
                    type="number"
                    value={rules.horasMaxItalia}
                    onChange={(e) => updateRule('horasMaxItalia', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="europa">Europa (horas/semana)</Label>
                  <Input
                    id="europa"
                    type="number"
                    value={rules.horasMaxEuropa}
                    onChange={(e) => updateRule('horasMaxEuropa', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Turnos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(rules.turnos).map(([turno, config]) => (
                <div key={turno} className="border rounded p-3">
                  <Label className="font-medium capitalize mb-2 block">{turno.replace('_', ' ')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Inicio</Label>
                      <Input
                        type="time"
                        value={config.inicio}
                        onChange={(e) => updateTurno(turno, 'inicio', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fin</Label>
                      <Input
                        type="time"
                        value={config.fin}
                        onChange={(e) => updateTurno(turno, 'fin', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Horas</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={config.horas}
                        onChange={(e) => updateTurno(turno, 'horas', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar Reglas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};