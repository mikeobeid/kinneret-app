/**
 * Phytoplankton Biomass Prediction System
 * Implements multiple forecasting algorithms for Lake Kinneret data
 */

export interface PredictionData {
  date: string;
  diatoms: number;
  dinoflagellates: number;
  small_phyto: number;
  n_fixers: number;
  microcystis: number;
}

export interface PredictionResult {
  date: string;
  predicted: number;
  confidence: number;
  actual?: number;
}

export interface PredictionModel {
  name: string;
  description: string;
  algorithm: 'linear' | 'polynomial' | 'seasonal' | 'exponential' | 'arima';
}

export const PREDICTION_MODELS: PredictionModel[] = [
  {
    name: 'Linear Trend',
    description: 'Simple linear regression based on historical trends',
    algorithm: 'linear'
  },
  {
    name: 'Polynomial Fit',
    description: 'Quadratic polynomial regression for non-linear trends',
    algorithm: 'polynomial'
  },
  {
    name: 'Seasonal Decomposition',
    description: 'Accounts for seasonal patterns and cycles',
    algorithm: 'seasonal'
  },
  {
    name: 'Exponential Smoothing',
    description: 'Weighted moving average with exponential decay',
    algorithm: 'exponential'
  },
  {
    name: 'ARIMA Model',
    description: 'AutoRegressive Integrated Moving Average',
    algorithm: 'arima'
  }
];

export class PhytoplanktonPredictor {
  private historicalData: PredictionData[] = [];

  constructor(data: PredictionData[]) {
    this.historicalData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Generate predictions for a specific phytoplankton group
   */
  public predict(
    group: keyof Omit<PredictionData, 'date'>,
    model: PredictionModel,
    monthsAhead: number = 12
  ): PredictionResult[] {
    const values = this.historicalData.map(d => ({ 
      x: this.getDateIndex(d.date), 
      y: d[group] 
    }));

    const predictions: PredictionResult[] = [];
    const lastDate = new Date(this.historicalData[this.historicalData.length - 1].date);

    for (let i = 1; i <= monthsAhead; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      const predictedValue = this.calculatePrediction(values, model, i);
      const confidence = this.calculateConfidence(values, model, i);

      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predicted: Math.max(0, predictedValue), // Ensure non-negative
        confidence: Math.max(0, Math.min(1, confidence))
      });
    }

    return predictions;
  }

  /**
   * Calculate prediction based on selected model
   */
  private calculatePrediction(
    values: { x: number; y: number }[],
    model: PredictionModel,
    stepsAhead: number
  ): number {
    switch (model.algorithm) {
      case 'linear':
        return this.linearPrediction(values, stepsAhead);
      case 'polynomial':
        return this.polynomialPrediction(values, stepsAhead);
      case 'seasonal':
        return this.seasonalPrediction(values, stepsAhead);
      case 'exponential':
        return this.exponentialSmoothing(values, stepsAhead);
      case 'arima':
        return this.arimaPrediction(values, stepsAhead);
      default:
        return this.linearPrediction(values, stepsAhead);
    }
  }

  /**
   * Linear regression prediction
   */
  private linearPrediction(values: { x: number; y: number }[], stepsAhead: number): number {
    const n = values.length;
    const sumX = values.reduce((sum, v) => sum + v.x, 0);
    const sumY = values.reduce((sum, v) => sum + v.y, 0);
    const sumXY = values.reduce((sum, v) => sum + v.x * v.y, 0);
    const sumXX = values.reduce((sum, v) => sum + v.x * v.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const lastX = values[n - 1].x;
    return slope * (lastX + stepsAhead) + intercept;
  }

  /**
   * Polynomial regression prediction (quadratic)
   */
  private polynomialPrediction(values: { x: number; y: number }[], stepsAhead: number): number {
    // Simplified quadratic fit
    const n = values.length;
    if (n < 3) return this.linearPrediction(values, stepsAhead);

    // Use last 3 points for quadratic fit
    const recent = values.slice(-3);
    const x1 = recent[0].x, y1 = recent[0].y;
    const x2 = recent[1].x, y2 = recent[1].y;
    const x3 = recent[2].x, y3 = recent[2].y;

    // Calculate quadratic coefficients (simplified)
    const a = ((y3 - y1) / ((x3 - x1) * (x3 - x2))) - ((y2 - y1) / ((x2 - x1) * (x3 - x2)));
    const b = (y2 - y1) / (x2 - x1) - a * (x1 + x2);
    const c = y1 - a * x1 * x1 - b * x1;

    const lastX = values[n - 1].x;
    const futureX = lastX + stepsAhead;
    return a * futureX * futureX + b * futureX + c;
  }

  /**
   * Seasonal decomposition prediction
   */
  private seasonalPrediction(values: { x: number; y: number }[], stepsAhead: number): number {
    // Calculate seasonal component (assuming 12-month cycle)
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    values.forEach(v => {
      const month = (v.x - 1) % 12;
      monthlyAverages[month] += v.y;
      monthlyCounts[month]++;
    });

    for (let i = 0; i < 12; i++) {
      if (monthlyCounts[i] > 0) {
        monthlyAverages[i] /= monthlyCounts[i];
      }
    }

    // Calculate trend component
    const trend = this.linearPrediction(values, stepsAhead);

    // Get seasonal component for future month
    const futureMonth = (values[values.length - 1].x + stepsAhead - 1) % 12;
    const seasonalComponent = monthlyAverages[futureMonth] || 0;

    // Combine trend and seasonal components
    return trend * 0.7 + seasonalComponent * 0.3;
  }

  /**
   * Exponential smoothing prediction
   */
  private exponentialSmoothing(values: { x: number; y: number }[], stepsAhead: number): number {
    if (values.length < 2) return values[values.length - 1]?.y || 0;

    const alpha = 0.3; // Smoothing factor
    let smoothed = values[0].y;

    // Apply exponential smoothing
    for (let i = 1; i < values.length; i++) {
      smoothed = alpha * values[i].y + (1 - alpha) * smoothed;
    }

    // For future predictions, apply trend
    const recentTrend = values.length > 1 ? 
      (values[values.length - 1].y - values[values.length - 2].y) : 0;

    return smoothed + recentTrend * stepsAhead;
  }

  /**
   * ARIMA-like prediction (simplified)
   */
  private arimaPrediction(values: { x: number; y: number }[], stepsAhead: number): number {
    if (values.length < 3) return this.linearPrediction(values, stepsAhead);

    // Calculate first differences (ARIMA(1,1,0) approximation)
    const differences = [];
    for (let i = 1; i < values.length; i++) {
      differences.push(values[i].y - values[i - 1].y);
    }

    // Calculate autoregressive coefficient
    let sum = 0;
    for (let i = 1; i < differences.length; i++) {
      sum += differences[i] * differences[i - 1];
    }
    const sumSquares = differences.slice(0, -1).reduce((s, d) => s + d * d, 0);
    const arCoeff = sumSquares > 0 ? sum / sumSquares : 0;

    // Predict next difference
    const lastDiff = differences[differences.length - 1];
    const predictedDiff = arCoeff * lastDiff;

    // Return predicted value
    const lastValue = values[values.length - 1].y;
    return lastValue + predictedDiff * stepsAhead;
  }

  /**
   * Calculate prediction confidence (simplified)
   */
  private calculateConfidence(
    values: { x: number; y: number }[],
    model: PredictionModel,
    stepsAhead: number
  ): number {
    // Confidence decreases with time horizon and varies by model
    const baseConfidence = {
      'linear': 0.8,
      'polynomial': 0.75,
      'seasonal': 0.85,
      'exponential': 0.7,
      'arima': 0.9
    };

    const modelConfidence = baseConfidence[model.algorithm] || 0.8;
    const timeDecay = Math.exp(-stepsAhead / 12); // Decay over 12 months
    const dataQuality = Math.min(1, values.length / 24); // Better with more data

    return modelConfidence * timeDecay * dataQuality;
  }

  /**
   * Get date index for calculations
   */
  private getDateIndex(dateString: string): number {
    const date = new Date(dateString);
    return date.getFullYear() * 12 + date.getMonth();
  }

  /**
   * Get model accuracy metrics
   */
  public getModelAccuracy(group: keyof Omit<PredictionData, 'date'>): Record<string, number> {
    const values = this.historicalData.map(d => d[group]);
    if (values.length < 12) return {};

    // Split data for validation (use last 25% for testing)
    const splitIndex = Math.floor(values.length * 0.75);
    const trainingData = values.slice(0, splitIndex);
    const testData = values.slice(splitIndex);

    const accuracies: Record<string, number> = {};

    PREDICTION_MODELS.forEach(model => {
      try {
        const trainingValues = trainingData.map((v, i) => ({ x: i, y: v }));
        const predictions = [];
        
        for (let i = 0; i < testData.length; i++) {
          const prediction = this.calculatePrediction(trainingValues, model, i + 1);
          predictions.push(prediction);
        }

        // Calculate RMSE
        const rmse = Math.sqrt(
          predictions.reduce((sum, pred, i) => sum + Math.pow(pred - testData[i], 2), 0) / predictions.length
        );
        
        // Convert RMSE to accuracy percentage (inverse relationship)
        accuracies[model.name] = Math.max(0, 100 - rmse * 100);
      } catch (error) {
        accuracies[model.name] = 0;
      }
    });

    return accuracies;
  }
}
