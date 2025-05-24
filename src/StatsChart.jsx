import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function StatsChart({ logsData }) {
  const barRef = useRef(null);
  const lineRef = useRef(null);
  const pieRef = useRef(null);

  useEffect(() => {
    if (!logsData || logsData.length === 0) return;

    // 数据聚合
    const cityMap = {};
    const monthMap = {};
    logsData.forEach(log => {
      const city = log.location_name || '未知';
      const month = new Date(log.created_at).toISOString().slice(0, 7);
      cityMap[city] = (cityMap[city] || 0) + 1;
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    const sortedCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
    const cityNames = sortedCities.map(e => e[0]);
    const cityCounts = sortedCities.map(e => e[1]);

    const sortedMonths = Object.entries(monthMap).sort((a, b) => a[0].localeCompare(b[0]));
    const monthNames = sortedMonths.map(e => e[0]);
    const monthCounts = sortedMonths.map(e => e[1]);

    const barChart = echarts.init(barRef.current);
    barChart.setOption({
      title: { text: '📊 城市标记排行', left: 'center' },
      tooltip: {},
      xAxis: { type: 'category', data: cityNames },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        name: '标记数',
        type: 'bar',
        data: cityCounts,
        itemStyle: { color: '#5470c6' },
      }]
    });

    const lineChart = echarts.init(lineRef.current);
    lineChart.setOption({
      title: { text: '📈 每月上传趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: monthNames },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        name: '上传日志数',
        type: 'line',
        smooth: true,
        data: monthCounts,
        areaStyle: {},
        itemStyle: { color: '#73c0de' },
      }]
    });

    const pieChart = echarts.init(pieRef.current);
    pieChart.setOption({
      title: { text: '🥧 城市占比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: '60%',
        data: cityNames.map((name, i) => ({ name, value: cityCounts[i] })),
      }]
    });

    // 清理函数放在 useEffect 内部 return
    return () => {
      barChart.dispose();
      lineChart.dispose();
      pieChart.dispose();
    };
  }, [logsData]);

  return (
    <div>
      <div ref={barRef} style={{ width: '100%', height: '300px', marginBottom: '20px' }} />
      <div ref={lineRef} style={{ width: '100%', height: '300px', marginBottom: '20px' }} />
      <div ref={pieRef} style={{ width: '100%', height: '300px' }} />
    </div>
  );
}
