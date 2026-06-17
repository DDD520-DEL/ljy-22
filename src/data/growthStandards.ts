export interface PercentileData {
  monthAge: number;
  P3: number;
  P15: number;
  P50: number;
  P85: number;
  P97: number;
}

export type GrowthMetric = 'weight' | 'height' | 'headCircumference';
export type Gender = '男' | '女';

export const WEIGHT_BOYS: PercentileData[] = [
  { monthAge: 0, P3: 2.5, P15: 2.9, P50: 3.3, P85: 3.9, P97: 4.3 },
  { monthAge: 1, P3: 3.4, P15: 3.9, P50: 4.5, P85: 5.1, P97: 5.7 },
  { monthAge: 2, P3: 4.4, P15: 5.0, P50: 5.7, P85: 6.4, P97: 7.0 },
  { monthAge: 3, P3: 5.1, P15: 5.8, P50: 6.4, P85: 7.2, P97: 7.9 },
  { monthAge: 4, P3: 5.6, P15: 6.3, P50: 7.0, P85: 7.8, P97: 8.6 },
  { monthAge: 5, P3: 6.1, P15: 6.8, P50: 7.5, P85: 8.4, P97: 9.2 },
  { monthAge: 6, P3: 6.4, P15: 7.1, P50: 7.9, P85: 8.8, P97: 9.7 },
  { monthAge: 7, P3: 6.7, P15: 7.4, P50: 8.3, P85: 9.2, P97: 10.1 },
  { monthAge: 8, P3: 7.0, P15: 7.7, P50: 8.6, P85: 9.5, P97: 10.5 },
  { monthAge: 9, P3: 7.2, P15: 8.0, P50: 8.9, P85: 9.9, P97: 10.8 },
  { monthAge: 10, P3: 7.4, P15: 8.2, P50: 9.2, P85: 10.2, P97: 11.2 },
  { monthAge: 11, P3: 7.6, P15: 8.4, P50: 9.4, P85: 10.5, P97: 11.5 },
  { monthAge: 12, P3: 7.7, P15: 8.6, P50: 9.6, P85: 10.7, P97: 11.8 },
  { monthAge: 15, P3: 8.2, P15: 9.1, P50: 10.2, P85: 11.3, P97: 12.5 },
  { monthAge: 18, P3: 8.6, P15: 9.6, P50: 10.7, P85: 11.9, P97: 13.2 },
  { monthAge: 21, P3: 9.0, P15: 10.0, P50: 11.2, P85: 12.5, P97: 13.8 },
  { monthAge: 24, P3: 9.3, P15: 10.3, P50: 11.6, P85: 13.0, P97: 14.4 },
  { monthAge: 27, P3: 9.6, P15: 10.7, P50: 12.0, P85: 13.4, P97: 14.9 },
  { monthAge: 30, P3: 9.9, P15: 11.0, P50: 12.4, P85: 13.9, P97: 15.4 },
  { monthAge: 33, P3: 10.1, P15: 11.3, P50: 12.7, P85: 14.3, P97: 15.9 },
  { monthAge: 36, P3: 10.4, P15: 11.6, P50: 13.1, P85: 14.7, P97: 16.4 },
  { monthAge: 42, P3: 10.9, P15: 12.2, P50: 13.8, P85: 15.5, P97: 17.3 },
  { monthAge: 48, P3: 11.4, P15: 12.8, P50: 14.5, P85: 16.4, P97: 18.3 },
  { monthAge: 54, P3: 11.9, P15: 13.4, P50: 15.2, P85: 17.2, P97: 19.3 },
  { monthAge: 60, P3: 12.4, P15: 14.0, P50: 15.9, P85: 18.1, P97: 20.3 },
  { monthAge: 72, P3: 13.5, P15: 15.3, P50: 17.4, P85: 19.9, P97: 22.5 },
  { monthAge: 84, P3: 14.7, P15: 16.7, P50: 19.1, P85: 21.9, P97: 24.9 },
];

export const WEIGHT_GIRLS: PercentileData[] = [
  { monthAge: 0, P3: 2.4, P15: 2.8, P50: 3.2, P85: 3.7, P97: 4.2 },
  { monthAge: 1, P3: 3.2, P15: 3.6, P50: 4.2, P85: 4.8, P97: 5.4 },
  { monthAge: 2, P3: 4.0, P15: 4.5, P50: 5.1, P85: 5.8, P97: 6.5 },
  { monthAge: 3, P3: 4.6, P15: 5.2, P50: 5.8, P85: 6.6, P97: 7.4 },
  { monthAge: 4, P3: 5.1, P15: 5.7, P50: 6.4, P85: 7.3, P97: 8.2 },
  { monthAge: 5, P3: 5.5, P15: 6.1, P50: 6.9, P85: 7.8, P97: 8.8 },
  { monthAge: 6, P3: 5.8, P15: 6.4, P50: 7.3, P85: 8.3, P97: 9.3 },
  { monthAge: 7, P3: 6.1, P15: 6.7, P50: 7.6, P85: 8.7, P97: 9.8 },
  { monthAge: 8, P3: 6.3, P15: 7.0, P50: 7.9, P85: 9.0, P97: 10.2 },
  { monthAge: 9, P3: 6.6, P15: 7.2, P50: 8.2, P85: 9.3, P97: 10.5 },
  { monthAge: 10, P3: 6.7, P15: 7.5, P50: 8.5, P85: 9.6, P97: 10.9 },
  { monthAge: 11, P3: 6.9, P15: 7.7, P50: 8.7, P85: 9.9, P97: 11.2 },
  { monthAge: 12, P3: 7.0, P15: 7.8, P50: 8.9, P85: 10.1, P97: 11.5 },
  { monthAge: 15, P3: 7.5, P15: 8.3, P50: 9.4, P85: 10.7, P97: 12.2 },
  { monthAge: 18, P3: 7.9, P15: 8.8, P50: 10.0, P85: 11.3, P97: 12.8 },
  { monthAge: 21, P3: 8.3, P15: 9.2, P50: 10.4, P85: 11.9, P97: 13.5 },
  { monthAge: 24, P3: 8.7, P15: 9.6, P50: 10.8, P85: 12.4, P97: 14.1 },
  { monthAge: 27, P3: 9.0, P15: 9.9, P50: 11.3, P85: 12.9, P97: 14.7 },
  { monthAge: 30, P3: 9.3, P15: 10.3, P50: 11.7, P85: 13.4, P97: 15.3 },
  { monthAge: 33, P3: 9.5, P15: 10.6, P50: 12.1, P85: 13.9, P97: 15.8 },
  { monthAge: 36, P3: 9.8, P15: 10.9, P50: 12.4, P85: 14.3, P97: 16.4 },
  { monthAge: 42, P3: 10.3, P15: 11.5, P50: 13.2, P85: 15.2, P97: 17.4 },
  { monthAge: 48, P3: 10.8, P15: 12.1, P50: 13.9, P85: 16.0, P97: 18.5 },
  { monthAge: 54, P3: 11.3, P15: 12.7, P50: 14.6, P85: 16.9, P97: 19.5 },
  { monthAge: 60, P3: 11.8, P15: 13.2, P50: 15.2, P85: 17.7, P97: 20.5 },
  { monthAge: 72, P3: 12.8, P15: 14.5, P50: 16.7, P85: 19.5, P97: 22.8 },
  { monthAge: 84, P3: 14.0, P15: 15.9, P50: 18.4, P85: 21.5, P97: 25.2 },
];

export const HEIGHT_BOYS: PercentileData[] = [
  { monthAge: 0, P3: 46.1, P15: 47.5, P50: 49.9, P85: 52.0, P97: 53.7 },
  { monthAge: 1, P3: 50.8, P15: 52.3, P50: 54.7, P85: 57.1, P97: 59.0 },
  { monthAge: 2, P3: 54.4, P15: 56.0, P50: 58.4, P85: 60.9, P97: 62.9 },
  { monthAge: 3, P3: 57.3, P15: 59.0, P50: 61.4, P85: 64.0, P97: 66.1 },
  { monthAge: 4, P3: 59.7, P15: 61.4, P50: 63.9, P85: 66.5, P97: 68.7 },
  { monthAge: 5, P3: 61.7, P15: 63.5, P50: 65.9, P85: 68.6, P97: 70.8 },
  { monthAge: 6, P3: 63.3, P15: 65.1, P50: 67.6, P85: 70.3, P97: 72.6 },
  { monthAge: 7, P3: 64.8, P15: 66.6, P50: 69.2, P85: 71.9, P97: 74.3 },
  { monthAge: 8, P3: 66.0, P15: 67.9, P50: 70.6, P85: 73.3, P97: 75.8 },
  { monthAge: 9, P3: 67.1, P15: 69.0, P50: 71.7, P85: 74.5, P97: 77.0 },
  { monthAge: 10, P3: 68.1, P15: 70.1, P50: 72.8, P85: 75.6, P97: 78.2 },
  { monthAge: 11, P3: 69.0, P15: 71.0, P50: 73.8, P85: 76.7, P97: 79.3 },
  { monthAge: 12, P3: 69.8, P15: 71.8, P50: 74.6, P85: 77.5, P97: 80.2 },
  { monthAge: 15, P3: 71.9, P15: 74.1, P50: 76.9, P85: 79.9, P97: 82.7 },
  { monthAge: 18, P3: 73.6, P15: 75.9, P50: 78.9, P85: 82.0, P97: 84.9 },
  { monthAge: 21, P3: 75.2, P15: 77.6, P50: 80.6, P85: 83.8, P97: 86.8 },
  { monthAge: 24, P3: 76.5, P15: 79.0, P50: 82.0, P85: 85.3, P97: 88.4 },
  { monthAge: 27, P3: 77.8, P15: 80.3, P50: 83.4, P85: 86.8, P97: 90.0 },
  { monthAge: 30, P3: 79.1, P15: 81.7, P50: 84.8, P85: 88.2, P97: 91.5 },
  { monthAge: 33, P3: 80.5, P15: 83.1, P50: 86.3, P85: 89.7, P97: 93.1 },
  { monthAge: 36, P3: 81.7, P15: 84.4, P50: 87.7, P85: 91.2, P97: 94.7 },
  { monthAge: 42, P3: 84.0, P15: 86.9, P50: 90.4, P85: 94.0, P97: 97.5 },
  { monthAge: 48, P3: 86.4, P15: 89.4, P50: 93.0, P85: 96.7, P97: 100.4 },
  { monthAge: 54, P3: 89.0, P15: 92.0, P50: 95.7, P85: 99.5, P97: 103.3 },
  { monthAge: 60, P3: 91.5, P15: 94.7, P50: 98.4, P85: 102.3, P97: 106.2 },
  { monthAge: 72, P3: 96.5, P15: 99.9, P50: 103.7, P85: 107.8, P97: 112.0 },
  { monthAge: 84, P3: 101.5, P15: 105.2, P50: 109.2, P85: 113.6, P97: 118.0 },
];

export const HEIGHT_GIRLS: PercentileData[] = [
  { monthAge: 0, P3: 45.4, P15: 46.8, P50: 49.1, P85: 51.3, P97: 53.0 },
  { monthAge: 1, P3: 49.8, P15: 51.2, P50: 53.7, P85: 56.1, P97: 58.1 },
  { monthAge: 2, P3: 53.0, P15: 54.6, P50: 57.1, P85: 59.6, P97: 61.7 },
  { monthAge: 3, P3: 55.6, P15: 57.2, P50: 59.8, P85: 62.3, P97: 64.5 },
  { monthAge: 4, P3: 57.8, P15: 59.4, P50: 62.1, P85: 64.7, P97: 67.0 },
  { monthAge: 5, P3: 59.6, P15: 61.3, P50: 64.0, P85: 66.7, P97: 69.0 },
  { monthAge: 6, P3: 61.2, P15: 62.9, P50: 65.7, P85: 68.5, P97: 70.8 },
  { monthAge: 7, P3: 62.7, P15: 64.4, P50: 67.3, P85: 70.1, P97: 72.5 },
  { monthAge: 8, P3: 64.0, P15: 65.8, P50: 68.7, P85: 71.5, P97: 74.0 },
  { monthAge: 9, P3: 65.1, P15: 67.0, P50: 69.9, P85: 72.8, P97: 75.3 },
  { monthAge: 10, P3: 66.1, P15: 68.0, P50: 71.0, P85: 74.0, P97: 76.5 },
  { monthAge: 11, P3: 67.0, P15: 69.0, P50: 72.0, P85: 75.0, P97: 77.6 },
  { monthAge: 12, P3: 67.9, P15: 69.8, P50: 72.8, P85: 75.9, P97: 78.5 },
  { monthAge: 15, P3: 70.2, P15: 72.3, P50: 75.4, P85: 78.6, P97: 81.3 },
  { monthAge: 18, P3: 72.2, P15: 74.3, P50: 77.5, P85: 80.8, P97: 83.6 },
  { monthAge: 21, P3: 74.0, P15: 76.1, P50: 79.4, P85: 82.8, P97: 85.8 },
  { monthAge: 24, P3: 75.5, P15: 77.7, P50: 81.1, P85: 84.6, P97: 87.7 },
  { monthAge: 27, P3: 77.0, P15: 79.3, P50: 82.7, P85: 86.4, P97: 89.6 },
  { monthAge: 30, P3: 78.5, P15: 80.8, P50: 84.3, P85: 88.1, P97: 91.4 },
  { monthAge: 33, P3: 79.9, P15: 82.3, P50: 85.8, P85: 89.7, P97: 93.1 },
  { monthAge: 36, P3: 81.2, P15: 83.7, P50: 87.2, P85: 91.2, P97: 94.6 },
  { monthAge: 42, P3: 83.6, P15: 86.2, P50: 89.8, P85: 94.0, P97: 97.5 },
  { monthAge: 48, P3: 86.0, P15: 88.7, P50: 92.5, P85: 96.9, P97: 100.7 },
  { monthAge: 54, P3: 88.4, P15: 91.2, P50: 95.1, P85: 99.5, P97: 103.5 },
  { monthAge: 60, P3: 90.5, P15: 93.5, P50: 97.5, P85: 102.2, P97: 106.4 },
  { monthAge: 72, P3: 95.3, P15: 98.6, P50: 102.7, P85: 107.3, P97: 111.8 },
  { monthAge: 84, P3: 100.2, P15: 103.7, P50: 107.9, P85: 112.8, P97: 117.7 },
];

export const HEAD_CIRCUMFERENCE_BOYS: PercentileData[] = [
  { monthAge: 0, P3: 31.7, P15: 32.6, P50: 34.5, P85: 36.1, P97: 37.2 },
  { monthAge: 1, P3: 35.1, P15: 36.0, P50: 37.3, P85: 38.6, P97: 39.5 },
  { monthAge: 2, P3: 36.8, P15: 37.7, P50: 39.1, P85: 40.5, P97: 41.5 },
  { monthAge: 3, P3: 38.1, P15: 39.0, P50: 40.5, P85: 41.9, P97: 43.0 },
  { monthAge: 4, P3: 39.2, P15: 40.1, P50: 41.6, P85: 43.0, P97: 44.1 },
  { monthAge: 6, P3: 40.9, P15: 41.8, P50: 43.3, P85: 44.7, P97: 45.8 },
  { monthAge: 9, P3: 42.1, P15: 43.1, P50: 44.6, P85: 46.0, P97: 47.1 },
  { monthAge: 12, P3: 43.0, P15: 44.0, P50: 45.5, P85: 46.9, P97: 48.0 },
  { monthAge: 18, P3: 44.3, P15: 45.3, P50: 46.8, P85: 48.2, P97: 49.4 },
  { monthAge: 24, P3: 45.3, P15: 46.3, P50: 47.8, P85: 49.2, P97: 50.4 },
  { monthAge: 36, P3: 46.6, P15: 47.7, P50: 49.2, P85: 50.7, P97: 51.9 },
  { monthAge: 48, P3: 47.7, P15: 48.8, P50: 50.3, P85: 51.8, P97: 53.1 },
  { monthAge: 60, P3: 48.5, P15: 49.6, P50: 51.2, P85: 52.7, P97: 54.0 },
];

export const HEAD_CIRCUMFERENCE_GIRLS: PercentileData[] = [
  { monthAge: 0, P3: 31.2, P15: 32.1, P50: 33.9, P85: 35.5, P97: 36.5 },
  { monthAge: 1, P3: 34.3, P15: 35.2, P50: 36.5, P85: 37.8, P97: 38.8 },
  { monthAge: 2, P3: 36.0, P15: 36.9, P50: 38.3, P85: 39.7, P97: 40.7 },
  { monthAge: 3, P3: 37.2, P15: 38.2, P50: 39.5, P85: 40.9, P97: 42.0 },
  { monthAge: 4, P3: 38.2, P15: 39.2, P50: 40.5, P85: 41.8, P97: 42.9 },
  { monthAge: 6, P3: 39.8, P15: 40.8, P50: 42.1, P85: 43.5, P97: 44.6 },
  { monthAge: 9, P3: 41.0, P15: 42.0, P50: 43.3, P85: 44.7, P97: 45.8 },
  { monthAge: 12, P3: 41.9, P15: 42.9, P50: 44.2, P85: 45.6, P97: 46.7 },
  { monthAge: 18, P3: 43.2, P15: 44.2, P50: 45.5, P85: 46.9, P97: 48.0 },
  { monthAge: 24, P3: 44.2, P15: 45.2, P50: 46.5, P85: 47.9, P97: 49.0 },
  { monthAge: 36, P3: 45.6, P15: 46.7, P50: 48.0, P85: 49.4, P97: 50.6 },
  { monthAge: 48, P3: 46.8, P15: 47.9, P50: 49.2, P85: 50.6, P97: 51.8 },
  { monthAge: 60, P3: 47.7, P15: 48.8, P50: 50.1, P85: 51.5, P97: 52.7 },
];

export function getGrowthData(metric: GrowthMetric, gender: Gender): PercentileData[] {
  switch (metric) {
    case 'weight':
      return gender === '男' ? WEIGHT_BOYS : WEIGHT_GIRLS;
    case 'height':
      return gender === '男' ? HEIGHT_BOYS : HEIGHT_GIRLS;
    case 'headCircumference':
      return gender === '男' ? HEAD_CIRCUMFERENCE_BOYS : HEAD_CIRCUMFERENCE_GIRLS;
  }
}

export function interpolatePercentile(
  monthAge: number,
  data: PercentileData[]
): { P3: number; P15: number; P50: number; P85: number; P97: number } {
  if (monthAge <= data[0].monthAge) {
    return { P3: data[0].P3, P15: data[0].P15, P50: data[0].P50, P85: data[0].P85, P97: data[0].P97 };
  }
  if (monthAge >= data[data.length - 1].monthAge) {
    const last = data[data.length - 1];
    return { P3: last.P3, P15: last.P15, P50: last.P50, P85: last.P85, P97: last.P97 };
  }

  let lowerIndex = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].monthAge <= monthAge && data[i + 1].monthAge >= monthAge) {
      lowerIndex = i;
      break;
    }
  }

  const lower = data[lowerIndex];
  const upper = data[lowerIndex + 1];
  const ratio = (monthAge - lower.monthAge) / (upper.monthAge - lower.monthAge);

  const interpolate = (a: number, b: number) => a + (b - a) * ratio;

  return {
    P3: interpolate(lower.P3, upper.P3),
    P15: interpolate(lower.P15, upper.P15),
    P50: interpolate(lower.P50, upper.P50),
    P85: interpolate(lower.P85, upper.P85),
    P97: interpolate(lower.P97, upper.P97),
  };
}

export function calculatePercentileRank(
  value: number,
  monthAge: number,
  data: PercentileData[]
): number {
  const percentiles = interpolatePercentile(monthAge, data);
  
  if (value <= percentiles.P3) return 2;
  if (value >= percentiles.P97) return 98;
  
  const keys: Array<'P3' | 'P15' | 'P50' | 'P85' | 'P97'> = ['P3', 'P15', 'P50', 'P85', 'P97'];
  const percentileValues = [3, 15, 50, 85, 97];
  
  for (let i = 0; i < keys.length - 1; i++) {
    const lowerVal = percentiles[keys[i]];
    const upperVal = percentiles[keys[i + 1]];
    const lowerPct = percentileValues[i];
    const upperPct = percentileValues[i + 1];
    
    if (value >= lowerVal && value <= upperVal) {
      const ratio = (value - lowerVal) / (upperVal - lowerVal);
      return lowerPct + (upperPct - lowerPct) * ratio;
    }
  }
  
  return 50;
}

export function getGrowthStatus(percentile: number): { label: string; color: string; level: 'low' | 'normal' | 'high' } {
  if (percentile < 3) return { label: '偏低', color: 'text-red-500', level: 'low' };
  if (percentile < 15) return { label: '偏下', color: 'text-amber-500', level: 'low' };
  if (percentile <= 85) return { label: '正常', color: 'text-mint-500', level: 'normal' };
  if (percentile <= 97) return { label: '偏上', color: 'text-blue-500', level: 'high' };
  return { label: '偏高', color: 'text-purple-500', level: 'high' };
}

export function getDeviationFromMedian(
  value: number,
  monthAge: number,
  data: PercentileData[]
): { deviation: number; deviationPercent: number } {
  const percentiles = interpolatePercentile(monthAge, data);
  const deviation = value - percentiles.P50;
  const deviationPercent = ((value - percentiles.P50) / percentiles.P50) * 100;
  return { deviation, deviationPercent };
}
