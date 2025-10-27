<template>
  <div class="stats-view-container">
    <!-- 背景装饰元素 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <el-card class="stats-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-icon">
            <TrendCharts />
          </div>
          <h2 class="gradient-text">学习统计</h2>
        </div>
      </template>
      
      <div class="stats-content">
        <!-- 统计概览 -->
        <el-row :gutter="20" class="stats-grid">
          <el-col :xs="12" :sm="12" :md="6">
            <el-card class="stat-card total-words gradient-card" shadow="hover" :class="{ 'stat-animate': isAnimated }">
              <div class="stat-content">
                <div class="stat-icon"><Document /></div>
                <div class="stat-number">{{ stats.totalWords }}</div>
                <div class="stat-label">总单词数</div>
                <div class="stat-bg-icon"><Document /></div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6">
            <el-card class="stat-card study-days gradient-card" shadow="hover" :class="{ 'stat-animate': isAnimated }">
              <div class="stat-content">
                <div class="stat-icon"><Calendar /></div>
                <div class="stat-number">{{ stats.studyDays }}</div>
                <div class="stat-label">学习天数</div>
                <div class="stat-bg-icon"><Calendar /></div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6">
            <el-card class="stat-card today-words gradient-card" shadow="hover" :class="{ 'stat-animate': isAnimated }">
              <div class="stat-content">
                <div class="stat-icon"><Sunny /></div>
                <div class="stat-number">{{ stats.todayWords }}</div>
                <div class="stat-label">今日单词</div>
                <div class="stat-bg-icon"><Sunny /></div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6">
            <el-card class="stat-card daily-target gradient-card" shadow="hover" :class="{ 'stat-animate': isAnimated }" @click="openTargetDialog">
              <div class="stat-content">
                <div class="stat-icon"><Sunny /></div>
                <div class="stat-number">{{ stats.dailyTarget }}</div>
                <div class="stat-label">每日目标 (点击设置)</div>
                <div class="stat-bg-icon"><Sunny /></div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6">
            <el-card class="stat-card mastered gradient-card" shadow="hover" :class="{ 'stat-animate': isAnimated }">
              <div class="stat-content">
                <div class="stat-icon"><Star /></div>
                <div class="stat-number">{{ stats.mastered }}</div>
                <div class="stat-label">已掌握</div>
                <div class="stat-bg-icon"><Star /></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 学习趋势 -->
        <div class="stats-section" :class="{ 'section-animate': isAnimated }">
          <h3 class="section-title">
            <span class="section-icon"><Histogram /></span>
            <span class="section-text">学习趋势</span>
          </h3>
          <div class="trend-chart gradient-card">
            <div class="trend-bars">
                <div v-for="day in trendData" :key="day.date" class="trend-bar-container">
                  <div class="trend-bar" :style="{ height: day.height + '%' }">
                    <span class="trend-count">{{ day.count }}</span>
                  </div>
                  <div class="trend-label">{{ day.label }}</div>
                  <div class="trend-date">{{ day.shortDate }}</div>
                </div>
              </div>
          </div>
        </div>
        
        <!-- 标签统计 -->
        <div class="stats-section" :class="{ 'section-animate': isAnimated }">
          <h3 class="section-title">
            <span class="section-icon"><Tickets /></span>
            <span class="section-text">标签分布</span>
          </h3>
          <div class="tag-stats gradient-card">
            <div v-if="tagStats.length > 0">
              <div v-for="tag in tagStats" :key="tag.name" class="tag-item">
                <span class="tag-name">{{ tag.name }}</span>
                <el-progress :percentage="tag.percentage" :color="tag.color"></el-progress>
                <span class="tag-count">{{ tag.count }}</span>
              </div>
            </div>
            <div v-else class="empty-stats">
              <p>暂无单词标签数据</p>
            </div>
          </div>
        </div>
        
        <!-- 学习效率 -->
        <div class="stats-section" :class="{ 'section-animate': isAnimated }">
          <h3 class="section-title">
            <span class="section-icon"><Trophy /></span>
            <span class="section-text">学习效率</span>
          </h3>
          <div class="efficiency-stats gradient-card">
            <div class="efficiency-item">
              <div class="efficiency-circle" :class="{ 'efficient': efficiencyScore > 70 }"></div>
              <div class="efficiency-score">{{ efficiencyScore }}</div>
              <div class="efficiency-label">效率评分</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 每日目标设置对话框 -->
    <el-dialog
      v-model="showTargetDialog"
      title="设置每日目标"
      width="30%"
    >
      <div class="target-setting">
        <p>请设置您的每日单词学习目标：</p>
        <el-input-number
          v-model="tempTarget"
          :min="1"
          :max="100"
          label="每日目标"
          class="target-input"
        ></el-input-number>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTargetDialog = false">取消</el-button>
          <el-button type="primary" @click="saveDailyTarget">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { 
  TrendCharts, 
  Document, 
  Calendar, 
  Sunny, 
  Star, 
  Histogram, 
  Refresh, 
  Tickets,
  Trophy
} from '@element-plus/icons-vue'
import { ElDialog, ElInputNumber, ElButton, ElProgress } from 'element-plus'

export default {
  name: 'StatsView',
  components: {
    TrendCharts,
    Document,
    Calendar,
    Sunny,
    Star,
    Histogram,
    Tickets,
    Trophy,
    ElDialog,
    ElInputNumber,
    ElButton,
    ElProgress
  },
  emits: ['update:dailyTarget'],
  props: {
    words: {
      type: Array,
      default: () => []
    },
    dailyTarget: {
      type: Number,
      default: 20
    }
  },
  setup(props, { emit }) {
    const isAnimated = ref(false)
    const showTargetDialog = ref(false)
    const tempTarget = ref(props.dailyTarget)
    
    // 获取今天的日期字符串 (YYYY-MM-DD 格式)
    const getTodayDateString = () => {
      const now = new Date();
      return now.toISOString().split('T')[0];
    }
    
    // 打开目标设置对话框
    const openTargetDialog = () => {
      tempTarget.value = props.dailyTarget
      showTargetDialog.value = true
    }
    
    // 保存每日目标
    const saveDailyTarget = () => {
      if (tempTarget.value > 0) {
        localStorage.setItem('dailyEnglishTarget', tempTarget.value.toString())
        emit('update:dailyTarget', tempTarget.value)
        showTargetDialog.value = false
      }
    }
    
    // 计算统计数据
    const stats = computed(() => {
      // 从localStorage获取所有单词数据
      const allWordsData = localStorage.getItem('dailyEnglishWords')
      const allWords = allWordsData ? JSON.parse(allWordsData) : []
      const today = getTodayDateString();
      
      // 计算今天的单词
      const todayWords = allWords.filter(w => w.date === today);
      
      // 计算学习天数 - 统计所有有单词记录的不重复日期数量
      const studyDateSet = new Set();
      allWords.forEach(word => {
        if (word.date) {
          studyDateSet.add(word.date);
        }
      });
      const studyDaysCount = studyDateSet.size;
      
      // 计算所有已掌握的单词
      const masteredCount = allWords.filter(w => w.mastered).length;
      
      return {
        totalWords: allWords.length, // 总单词数（所有单词）
        todayWords: todayWords.length, // 今天的单词数
        studyDays: studyDaysCount,     // 学习总天数
        dailyTarget: props.dailyTarget,
        mastered: masteredCount        // 所有已掌握的单词
      }
    })
    
    // 生成过去14天的日期和标签，显示更完整的趋势
    const generateLast7Days = () => {
      const days = [];
      const today = new Date();
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = weekDays[date.getDay()];
        
        days.push({
          date: dateStr,
          count: 0, // 默认为0
          height: 0,
          label: dayOfWeek,
          shortDate: `${date.getMonth() + 1}/${date.getDate()}` // 显示月/日格式
        });
      }
      return days;
    }
    
    // 计算学习趋势数据
    const trendData = computed(() => {
      const days = generateLast7Days();
      
      // 从localStorage获取所有单词数据
      const allWordsData = localStorage.getItem('dailyEnglishWords')
      const allWords = allWordsData ? JSON.parse(allWordsData) : []
      
      // 统计每天的单词数
      const dailyCounts = {};
      allWords.forEach(word => {
        if (word.date) {
          dailyCounts[word.date] = (dailyCounts[word.date] || 0) + 1;
        }
      });
      
      // 更新高度
      const maxCount = Math.max(...Object.values(dailyCounts), 1);
      days.forEach(day => {
        day.count = dailyCounts[day.date] || 0;
        day.height = day.count > 0 ? (day.count / maxCount) * 100 : 0;
      });
      
      return days;
    })
    
    // 标签统计 - 统计所有单词的标签分布，而不仅是今天的
    const tagStats = computed(() => {
      const tags = {};
      
      // 从localStorage获取所有单词数据
      const allWordsData = localStorage.getItem('dailyEnglishWords')
      const allWords = allWordsData ? JSON.parse(allWordsData) : []
      
      // 统计所有单词的标签
      allWords.forEach(word => {
        if (word.tags && word.tags.length > 0) {
          word.tags.forEach(tag => {
            tags[tag] = (tags[tag] || 0) + 1;
          });
        }
      });
      
      const total = Object.values(tags).reduce((sum, count) => sum + count, 0);
      if (total === 0) {
        return []; // 如果没有数据，返回空数组
      }
      
      return Object.keys(tags).map(name => ({
        name,
        count: tags[name],
        percentage: Math.round((tags[name] / total) * 100),
        color: getRandomColor()
      }));
    })
    
    // 效率评分
    const efficiencyScore = computed(() => {
      const today = getTodayDateString();
      
      // 从localStorage获取所有单词数据
      const allWordsData = localStorage.getItem('dailyEnglishWords')
      const allWords = allWordsData ? JSON.parse(allWordsData) : []
      
      // 只使用今天的单词计算效率
      const todayWords = allWords.filter(w => w.date === today);
      
      if (todayWords.length === 0) {
        return 0; // 没有数据时显示0
      }
      
      const masteredRate = todayWords.filter(w => w.mastered).length / todayWords.length;
      const avgReviewCount = todayWords.reduce((sum, w) => sum + (w.reviewCount || 0), 0) / todayWords.length;
      
      return Math.round(masteredRate * 60 + (2 - Math.min(avgReviewCount / 5, 1)) * 40);
    })
    
    // 生成随机颜色
    function getRandomColor() {
      const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
      return colors[Math.floor(Math.random() * colors.length)]
    }
    
    // 监听滚动显示动画
    onMounted(() => {
      // 添加一些延迟以确保元素已渲染
      setTimeout(() => {
        isAnimated.value = true
      }, 300)
      
      const handleScroll = () => {
        const statsSection = document.querySelector('.stats-section')
        if (statsSection) {
          const rect = statsSection.getBoundingClientRect()
          if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
            isAnimated.value = true
          }
        }
      }
      
      const handleWordUpdate = () => {
        // 当单词更新时，统计组件不需要重新加载数据，因为它依赖props.words
        // 但可以重新计算动画状态
        isAnimated.value = false
        setTimeout(() => {
          isAnimated.value = true
        }, 100)
      }
      
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('wordUpdated', handleWordUpdate)
      
      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('wordUpdated', handleWordUpdate)
      }
    })
    
    return {
        stats,
        trendData,
        tagStats,
        efficiencyScore,
        isAnimated,
        showTargetDialog,
        tempTarget,
        openTargetDialog,
        saveDailyTarget
      }
  }
}
</script>

<style scoped>
.stats-view-container {
  padding: 16px;
  background: var(--background-card);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 背景装饰元素 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
}

.bg-circle-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  top: -100px;
  right: -100px;
}

.bg-circle-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, var(--danger-color) 0%, var(--secondary-color) 100%);
  bottom: -75px;
  left: -75px;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
  z-index: 1;
}

.stats-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  position: relative;
  margin-bottom: var(--space-xl);
  transition: all var(--transition-normal) var(--ease-bounce);
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--danger-color), var(--success-color));
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.stats-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent !important;
  border-bottom: none !important;
  padding: var(--space-md) var(--space-lg) var(--space-md) var(--space-lg) !important;
}

.header-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3);
  animation: float 6s ease-in-out infinite;
}

.gradient-text {
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.5s var(--ease-out);
  margin: 0;
  font-size: 1.5rem;
}

.gradient-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all var(--transition-normal) var(--ease-bounce);
  position: relative;
  overflow: hidden;
}

.gradient-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.gradient-card:hover::before {
  opacity: 1;
}

.stat-card {
  height: 80px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transform: translateY(15px);
  opacity: 0;
  display: flex;
  align-items: center;
}

.stat-card.stat-animate {
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.5s var(--ease-out), opacity 0.5s var(--ease-out);
}

.stat-card.total-words {
  transition-delay: 0.1s;
}

.stat-card.study-days {
  transition-delay: 0.2s;
}

.stat-card.daily-target {
  transition-delay: 0.3s;
}

.stat-card.mastered {
  transition-delay: 0.4s;
}

.stats-section {
  margin-bottom: 30px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s var(--ease-out);
}

.stats-section.section-animate {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.5s;
}

.trend-chart, .tag-stats, .efficiency-stats {
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

/* 统计内容样式 */
.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  height: 100%;
  justify-content: center;
}

.stat-icon {
  font-size: 16px;
  color: var(--primary-color);
  margin-bottom: 4px;
  opacity: 0.9;
  background: rgba(67, 97, 238, 0.1);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-number {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 2px;
  transition: transform 0.3s ease;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 500;
}

.stat-bg-icon {
  position: absolute;
  right: 8px;
  bottom: 6px;
  font-size: 20px;
  color: rgba(102, 126, 234, 0.05);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1em; /* 与文字大小相同 */
}

.section-text {
  display: inline-block;
}

/* 趋势图样式 */
.trend-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding: 20px 0;
}

.trend-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
}

.trend-bar {
  width: 100%;
  background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  min-height: 10px;
}

.trend-bar:hover {
  background: linear-gradient(180deg, #66b1ff, #91ccff);
  transform: scaleX(1.2);
}

.trend-count {
  position: absolute;
  top: -25px;
  color: var(--primary-color);
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
}

.trend-label {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.trend-date {
  margin-top: 2px;
  font-size: 11px;
  color: #909399;
  text-align: center;
}

/* 标签统计样式 */
.tag-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.tag-name {
  flex: 0 0 50px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 13px;
}

.tag-count {
  flex: 0 0 25px;
  text-align: right;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
}

/* 效率评分样式 */
.efficiency-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.efficiency-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: conic-gradient(var(--primary-color) 0deg, var(--primary-color) calc(var(--efficiency-score, 70) * 3.6deg), #f0f2f5 calc(var(--efficiency-score, 70) * 3.6deg), #f0f2f5 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  transition: transform 0.3s ease;
  position: relative;
}

.efficiency-circle::before {
  content: '';
  position: absolute;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: white;
}

.efficiency-score {
  font-size: 16px;
  font-weight: bold;
  color: var(--primary-color);
  z-index: 1;
  transition: transform 0.3s ease;
}

.efficiency-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 动画定义 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}

.stat-animate .stat-card {
  animation: statSlideIn 0.6s ease forwards;
}

.stat-animate .stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-animate .stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-animate .stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-animate .stat-card:nth-child(4) { animation-delay: 0.4s; }

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-view-container {
    padding: 10px;
  }
  
  .card-header h2 {
    font-size: 1.1rem;
  }
  
  .stat-number {
    font-size: 1.6rem;
  }
  
  .efficiency-circle {
    width: 60px;
    height: 60px;
  }
  
  .efficiency-circle::before {
    width: 48px;
    height: 48px;
  }
  
  .efficiency-score {
    font-size: 1.5rem;
  }
  
  .trend-bars {
    height: 80px;
  }
  
  .trend-bar {
    width: 16px;
  }
}

/* 悬停效果增强 */
.stat-card:hover .stat-number {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

.trend-bar:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 加载动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading .stat-number,
.loading .trend-bar,
.loading .el-progress-bar__inner {
  animation: pulse 1.5s ease-in-out infinite;
}

/* 空状态样式 */
.empty-stats {
  text-align: center;
  padding: 20px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

/* 添加变量支持 */
.efficiency-circle {
  --efficiency-score: v-bind(efficiencyScore);
}
</style>