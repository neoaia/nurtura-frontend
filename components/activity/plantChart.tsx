import { typography } from '@/assets/fonts/Text';
import { PlantChartDTO } from '@/types/activity.dto';
import * as shape from 'd3-shape';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';

export const PlantChart = ({
  title,
  data,
  yLabels,
  tooltipLabel,
  chartWidth = 300,
  chartColor = "#5EA3B4",
}: PlantChartDTO) => {

  const getXAxisDates = () => {
    const dates: string[] = [];
    const today = new Date();
    const offsets = [-14, -7, 0, 7, 14];
    
    offsets.forEach(offset => {
      const d = new Date();
      d.setDate(today.getDate() + offset);
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    });
    return dates;
  };

  const xLabels = getXAxisDates();

  return (
    <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4 w-full">
      <Text style={typography["button-bold"]} className="text-xl font-bold text-black mb-4">
        {title}
      </Text>

      <View className="flex-row">
        {/* Y-Axis */}
        <View className="justify-between pr-3 pb-12 pt-2">
          {yLabels.map((label, index) => (
            <Text key={index} style={typography["label"]} className="text-gray-400 text-[10px]">
              {label}
            </Text>
          ))}
        </View>

        {/* Scrollable Chart Content */}
       <View style={{ flex: 1 }}> 
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: chartWidth }}>
              <LineChart.Provider data={data}>
                <LineChart height={200} width={chartWidth}>
                {/* @ts-ignore */}
                <LineChart.Path color={chartColor} curve={shape.curveBasis}>
                   <LineChart.Gradient color={chartColor} />
                </LineChart.Path>
                <LineChart.Tooltip>
                   <LineChart.PriceText format={({ value }) => { 
                     'worklet'; 
                     return `${value} ${tooltipLabel}`; 
                   }} />
                </LineChart.Tooltip>
              </LineChart>
            </LineChart.Provider>

            {/* X-Axis Labels */}
            <View className="flex-row justify-between mt-2" style={{ width: chartWidth }}>
              {xLabels.map((date, index) => (
                <View key={index} style={{ width: chartWidth / 5, alignItems: 'center' }}>
                  <Text 
                    style={[
                      typography["label"], 
                      { 
                        color: index === 2 ? chartColor : '#9CA3AF', 
                        fontWeight: index === 2 ? '700' : '400',
                        fontSize: 10
                      }
                    ]}
                  >
                    {date}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        </View>
      </View>
    </View>
  );
};