import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { PhytoplanktonPredictor, PredictionData, PREDICTION_MODELS } from '@/lib/predictions/phytoplankton-predictor';
import { TrendingUp, Brain, Target, Calendar, BarChart3 } from 'lucide-react';
import { FigureExportControls } from '@/components/figure-export-controls';

interface PredictionChartProps {
  data: PredictionData[];
  className?: string;
}

const colors = {
  diatoms: '#2563EB',
  dinoflagellates: '#10B981',
  small_phyto: '#F59E0B',
  n_fixers: '#EF4444',
  microcystis: '#8B5CF6',
};

const groupLabels = {
  diatoms: 'Diatoms',
  dinoflagellates: 'Dinoflagellates',
  small_phyto: 'Small Phytoplankton',
  n_fixers: 'N-fixers',
  microcystis: 'Microcystis',
};

export function PredictionChart({ data, className }: PredictionChartProps) {
  const [selectedGroup, setSelectedGroup] = useState<keyof Omit<PredictionData, 'date'>>('diatoms');
  const [selectedModel, setSelectedModel] = useState(PREDICTION_MODELS[0]);
  const [monthsAhead, setMonthsAhead] = useState([12]);
  const [showConfidence, setShowConfidence] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const predictor = useMemo(() => new PhytoplanktonPredictor(data), [data]);

  const predictions = useMemo(() => {
    return predictor.predict(selectedGroup, selectedModel, monthsAhead[0]);
  }, [predictor, selectedGroup, selectedModel, monthsAhead]);

  const modelAccuracy = useMemo(() => {
    return predictor.getModelAccuracy(selectedGroup);
  }, [predictor, selectedGroup]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const historical = data.map(item => ({
      date: item.date,
      value: item[selectedGroup],
      type: 'Historical',
      confidence: 1
    }));

    const predicted = predictions.map(pred => ({
      date: pred.date,
      value: pred.predicted,
      type: 'Predicted',
      confidence: pred.confidence,
      confidenceUpper: pred.predicted * (1 + pred.confidence * 0.2),
      confidenceLower: pred.predicted * (1 - pred.confidence * 0.2)
    }));

    return [...historical, ...predicted];
  }, [data, selectedGroup, predictions]);

  const accuracyScore = modelAccuracy[selectedModel.name] || 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Prediction Controls
          </CardTitle>
          <CardDescription>
            Configure prediction parameters and models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Group Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phytoplankton Group</label>
              <Select value={selectedGroup} onValueChange={(value: any) => setSelectedGroup(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colors[key as keyof typeof colors] }}
                        />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prediction Model</label>
              <Select value={selectedModel.name} onValueChange={(value) => {
                const model = PREDICTION_MODELS.find(m => m.name === value);
                if (model) setSelectedModel(model);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREDICTION_MODELS.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Accuracy: {modelAccuracy[model.name]?.toFixed(1) || 0}%
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Horizon */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Prediction Horizon: {monthsAhead[0]} months
              </label>
              <Slider
                value={monthsAhead}
                onValueChange={setMonthsAhead}
                max={24}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 month</span>
                <span>24 months</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant={showConfidence ? "default" : "outline"}
              size="sm"
              onClick={() => setShowConfidence(!showConfidence)}
            >
              <Target className="h-4 w-4 mr-2" />
              Show Confidence
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      <Card ref={cardRef}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Prediction Results
              </CardTitle>
              <CardDescription>
                {groupLabels[selectedGroup]} - {selectedModel.name} Model
              </CardDescription>
            </div>
            <FigureExportControls
              elementRef={cardRef as React.RefObject<HTMLElement>}
              metadata={{
                title: `${groupLabels[selectedGroup]} Prediction`,
                subtitle: `${selectedModel.name} Model - ${monthsAhead[0]} months ahead`,
                caption: `Prediction accuracy: ${accuracyScore.toFixed(1)}%. Generated using ${selectedModel.description.toLowerCase()}.`,
                units: 'Biomass (μg/L)',
                source: 'Lake Kinneret 3D Biogeochemical Model',
                timestamp: new Date().toISOString(),
                appName: 'Kinneret3D Dynamics',
                appVersion: '1.0.0'
              }}
              filename={`prediction-${selectedGroup}-${selectedModel.name.toLowerCase().replace(/\s+/g, '-')}`}
              pageName="Statistics"
              figureKey="prediction-chart"
              supportsSVG={true}
              researchOptions={{
                groupId: selectedGroup,
                month: monthsAhead[0],
                season: new Date().getMonth() >= 4 && new Date().getMonth() <= 9 ? 'summer' : 'winter'
              }}
              className="sm:ml-4"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Model Performance */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Model Performance</span>
              </div>
              <Badge variant={accuracyScore > 70 ? "default" : accuracyScore > 50 ? "secondary" : "destructive"}>
                {accuracyScore.toFixed(1)}% Accuracy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedModel.description}
            </p>
          </div>

          {/* Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                />
                <YAxis 
                  domain={[0, 'dataMax + 0.1']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number, _name: string, props: any) => [
                    `${value.toFixed(3)} mmol P/m³`,
                    props.payload.type
                  ]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                />
                
                {/* Historical Data */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors[selectedGroup]}
                  strokeWidth={2}
                  fill={colors[selectedGroup]}
                  fillOpacity={0.3}
                  connectNulls={false}
                  data={chartData.filter(d => d.type === 'Historical')}
                />
                
                {/* Predicted Data */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors[selectedGroup]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill={colors[selectedGroup]}
                  fillOpacity={0.1}
                  data={chartData.filter(d => d.type === 'Predicted')}
                />

                {/* Confidence Interval */}
                {showConfidence && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="confidenceUpper"
                      stroke="none"
                      fill={colors[selectedGroup]}
                      fillOpacity={0.05}
                      data={chartData.filter(d => d.type === 'Predicted')}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidenceLower"
                      stroke="none"
                      fill={colors[selectedGroup]}
                      fillOpacity={0.05}
                      data={chartData.filter(d => d.type === 'Predicted')}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-0.5 bg-current" 
                style={{ color: colors[selectedGroup] }}
              />
              <span>Historical Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-0.5 bg-current border-dashed border-t-2" 
                style={{ color: colors[selectedGroup] }}
              />
              <span>Predictions</span>
            </div>
            {showConfidence && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 opacity-20" 
                  style={{ backgroundColor: colors[selectedGroup] }}
                />
                <span>Confidence Interval</span>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Prediction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prediction Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {predictions[predictions.length - 1]?.predicted.toFixed(3) || 'N/A'}
              </div>
              <div className="text-sm text-blue-800">Final Prediction (mmol P/m³)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {((predictions[predictions.length - 1]?.confidence || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-800">Confidence Level</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {monthsAhead[0]}
              </div>
              <div className="text-sm text-purple-800">Months Ahead</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
