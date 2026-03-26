<template>
    <div style="padding: 20px;">
      <el-card title="用户数据统计">
        <el-row :gutter="20">
          <!-- 数据卡片 -->
          <el-col :span="6">
            <div class="stat-card" style="background: #e5f3ff; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 30px; color: #1989fa;">{{ totalUser }}</div>
              <div style="color: #666; margin-top: 5px;">总用户数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card" style="background: #f0f9eb; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 30px; color: #52c41a;">{{ activeUser }}</div>
              <div style="color: #666; margin-top: 5px;">活跃用户数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card" style="background: #fff7e6; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 30px; color: #faad14;">{{ inactiveUser }}</div>
              <div style="color: #666; margin-top: 5px;">禁用用户数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card" style="background: #fff0f0; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 30px; color: #ff4d4f;">{{ newUserToday }}</div>
              <div style="color: #666; margin-top: 5px;">今日新增</div>
            </div>
          </el-col>
        </el-row>
  
        <!-- 图表区域 -->
        <div style="margin-top: 20px; height: 400px;" ref="chart"></div>
      </el-card>
    </div>
  </template>
  
  <script>
  import echarts from 'echarts'
  
  export default {
    name: 'DataChart',
    data() {
      return {
        totalUser: 128,
        activeUser: 96,
        inactiveUser: 32,
        newUserToday: 8,
        chart: null
      }
    },
    mounted() {
      // 初始化图表
      this.chart = echarts.init(this.$refs.chart)
      this.renderChart()
    },
    methods: {
      renderChart() {
        const option = {
          title: { text: '近7天用户新增趋势' },
          tooltip: { trigger: 'axis' },
          legend: { data: ['新增用户', '活跃用户'] },
          xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: { type: 'value' },
          series: [
            {
              name: '新增用户',
              type: 'line',
              data: [5, 7, 8, 6, 9, 12, 8],
              smooth: true
            },
            {
              name: '活跃用户',
              type: 'bar',
              data: [80, 85, 88, 90, 92, 95, 96]
            }
          ]
        }
        this.chart.setOption(option)
        // 自适应窗口大小
        window.addEventListener('resize', () => {
          this.chart.resize()
        })
      }
    }
  }
  </script>