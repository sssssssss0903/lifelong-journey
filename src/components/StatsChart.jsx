import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function StatsChart({ logsData }) {
  const barRef = useRef(null);
  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const geoRef = useRef(null);

  useEffect(() => {
    if (!logsData || logsData.length === 0) return;

    const cityMap = {};
    const monthMap = {};
    const geoPoints = [];

    logsData.forEach(log => {
      const city = log.location_name || '未知';
      const month = new Date(log.created_at).toISOString().slice(0, 7);
      cityMap[city] = (cityMap[city] || 0) + 1;
      monthMap[month] = (monthMap[month] || 0) + 1;

      if (log.longitude && log.latitude) {
        geoPoints.push({
          name: log.location_display_name || log.location_name || '未知',
          value: [parseFloat(log.longitude), parseFloat(log.latitude)],
        });
      }
    });

    const sortedCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
    const cityNames = sortedCities.map(e => e[0]);
    const cityCounts = sortedCities.map(e => e[1]);

    const sortedMonths = Object.entries(monthMap).sort((a, b) => a[0].localeCompare(b[0]));
    const monthNames = sortedMonths.map(e => e[0]);
    const monthCounts = sortedMonths.map(e => e[1]);

    // 安全初始化与配置图表
    try {
      if (barRef.current) {
        const barChart = echarts.getInstanceByDom(barRef.current) || echarts.init(barRef.current);
        barChart.clear();
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
      }
    } catch (err) {
      console.error('[柱状图渲染失败]', err);
    }

    try {
      if (lineRef.current) {
        const lineChart = echarts.getInstanceByDom(lineRef.current) || echarts.init(lineRef.current);
        lineChart.clear();
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
      }
    } catch (err) {
      console.error('[折线图渲染失败]', err);
    }

    try {
      if (pieRef.current) {
        const pieChart = echarts.getInstanceByDom(pieRef.current) || echarts.init(pieRef.current);
        pieChart.clear();
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
      }
    } catch (err) {
      console.error('[饼图渲染失败]', err);
    }

    try {
      if (geoRef.current) {
        const geoChart = echarts.getInstanceByDom(geoRef.current) || echarts.init(geoRef.current);
        geoChart.clear();
       geoChart.setOption({
  title: { text: '📍 经纬度分布图', left: 'center' },
  tooltip: { trigger: 'item', formatter: '{b}<br/>经度: {c[0]}<br/>纬度: {c[1]}' },
  xAxis: {
    type: 'value',
    name: '经度',
    min: -180,
    max: 180,
    splitNumber: 12,
    axisLabel: { formatter: '{value}°' },
    splitLine: { show: true, lineStyle: { type: 'dashed', color: '#ccc' } }
  },
  yAxis: {
    type: 'value',
    name: '纬度',
    min: -90,
    max: 90,
    splitNumber: 9,
    axisLabel: { formatter: '{value}°' },
    splitLine: { show: true, lineStyle: { type: 'dashed', color: '#ccc' } }
  },
  series: [{
    name: '日志位置',
    type: 'scatter',
    data: geoPoints,
    symbolSize: 10,
    itemStyle: { color: '#91cc75' }
  }]
});

      }
    } catch (err) {
      console.error('[经纬度散点图渲染失败]', err);
    }

    // 无需销毁图表：避免 init/init/dispose 冲突，只更新数据即可

  }, [logsData]);

  return (
    <div>
      <div ref={barRef} style={{ width: '100%', height: '300px', marginBottom: '20px' }} />
      <div ref={lineRef} style={{ width: '100%', height: '300px', marginBottom: '20px' }} />
      <div ref={pieRef} style={{ width: '100%', height: '300px', marginBottom: '20px' }} />
      <div ref={geoRef} style={{ width: '100%', height: '300px' }} />
    </div>
  );
}
