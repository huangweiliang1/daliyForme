<template>
  <div class="diary-container">
    <div class="diary-header">
      <h2>学习日记</h2>
      <div class="diary-tabs">
        <el-tabs v-model="activeTab" @tab-click="onTabChange">
          <el-tab-pane label="写日记" name="edit">
            <div class="diary-date-selector">
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="onDateChange"
              >
              </el-date-picker>
              <el-button type="primary" @click="resetDate">今天</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="日记列表" name="list">
            <el-input
              v-model="searchQuery"
              placeholder="搜索日记"
              prefix-icon="el-icon-search"
              class="search-input"
            ></el-input>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <!-- 编辑日记界面 -->
    <div v-if="activeTab === 'edit'" class="diary-content">
      <el-input
        v-model="currentDiary.title"
        placeholder="日记标题"
        class="diary-title-input"
      ></el-input>
      <el-input
        v-model="currentDiary.content"
        type="textarea"
        :rows="12"
        placeholder="记录今天的学习心得和笔记..."
      ></el-input>
      
      <div class="diary-stats">
        <p>今日单词数量: {{ todayWordsCount }}</p>
        <p>学习效率: {{ todayEfficiency }}%</p>
      </div>
    </div>
    
    <!-- 日记列表界面 -->
    <div v-else-if="activeTab === 'list'" class="diary-list">
      <div v-if="filteredDiaries.length === 0" class="empty-message">
        <p>暂无日记记录</p>
      </div>
      <div v-else class="diary-items">
        <div
          v-for="diary in filteredDiaries"
          :key="diary.date"
          class="diary-item"
          @click="viewDiary(diary)"
        >
          <div class="diary-item-title">{{ diary.title || getDefaultTitle(diary) }}</div>
          <div class="diary-item-date">{{ formatDate(diary.date) }}</div>
          <div class="diary-item-preview">{{ getPreview(diary.content) }}</div>
        </div>
      </div>
    </div>
    
    <!-- 查看日记详情对话框 -->
    <el-dialog
      :visible.sync="showDiaryDetail"
      :title="selectedDiaryDetail?.title || '日记详情'"
      width="60%"
    >
      <div class="diary-detail">
        <div class="diary-detail-date">{{ formatDate(selectedDiaryDetail?.date) }}</div>
        <div class="diary-detail-content">{{ selectedDiaryDetail?.content }}</div>
      </div>
    </el-dialog>
    
    <div v-if="activeTab === 'edit'" class="diary-footer">
      <el-button @click="clearDiary" type="danger" plain>清空日记</el-button>
      <el-button type="success" @click="saveDiary">保存日记</el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Diary',
  props: {
    words: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const selectedDate = ref(getTodayDateString())
    const currentDiary = ref({ title: '', content: '' })
    const activeTab = ref('edit') // 'edit' 或 'list'
    const diariesList = ref([]) // 所有日记的列表
    const searchQuery = ref('')
    const showDiaryDetail = ref(false)
    const selectedDiaryDetail = ref(null)
    
    // 获取今天的日期字符串 (YYYY-MM-DD 格式)
    function getTodayDateString() {
      const now = new Date()
      return now.toISOString().split('T')[0]
    }
    
    // 计算当天的单词数量
    const todayWordsCount = computed(() => {
      if (!props.words || !Array.isArray(props.words)) return 0
      return props.words.filter(word => word.date === selectedDate.value).length
    })
    
    // 计算当天的学习效率
    const todayEfficiency = computed(() => {
      const todayWords = props.words.filter(word => word.date === selectedDate.value)
      if (todayWords.length === 0) return 0
      
      const masteredWords = todayWords.filter(word => word.mastered).length
      return Math.round((masteredWords / todayWords.length) * 100)
    })
    
    // 过滤日记列表
    const filteredDiaries = computed(() => {
      if (!diariesList.value || diariesList.value.length === 0) return []
      
      const query = searchQuery.value.toLowerCase().trim()
      if (!query) return diariesList.value
      
      return diariesList.value.filter(diary => 
        diary.title?.toLowerCase().includes(query) || 
        diary.content.toLowerCase().includes(query) ||
        diary.date.includes(query)
      )
    })
    
    // 加载指定日期的日记
    function loadDiary(date) {
      try {
        const diaries = JSON.parse(localStorage.getItem('dailyEnglishDiaries') || '{}')
        currentDiary.value = diaries[date] || { title: '', content: '' }
      } catch (error) {
        console.error('加载日记失败:', error)
        currentDiary.value = { title: '', content: '' }
      }
    }
    
    // 加载所有日记到列表
    function loadAllDiaries() {
      try {
        const diaries = JSON.parse(localStorage.getItem('dailyEnglishDiaries') || '{}')
        const diariesArray = []
        
        // 转换为数组格式并添加日期信息
        Object.keys(diaries).forEach(date => {
          if (diaries[date] && diaries[date].content) {
            diariesArray.push({
              date,
              title: diaries[date].title || '',
              content: diaries[date].content
            })
          }
        })
        
        // 按日期降序排序
        diariesList.value = diariesArray.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        )
      } catch (error) {
        console.error('加载日记列表失败:', error)
        diariesList.value = []
      }
    }
    
    // 保存日记
    function saveDiary() {
      try {
        const diaries = JSON.parse(localStorage.getItem('dailyEnglishDiaries') || '{}')
        diaries[selectedDate.value] = currentDiary.value
        localStorage.setItem('dailyEnglishDiaries', JSON.stringify(diaries))
        
        // 保存后刷新日记列表
        loadAllDiaries()
        
        // 清空输入框
        currentDiary.value = {
          title: '',
          content: ''
        }
        
        // 显示保存成功的提示
        ElMessage.success('日记保存成功')
      } catch (error) {
        console.error('保存日记失败:', error)
        ElMessage.error('保存日记失败，请重试')
      }
    }
    
    // 清空日记
    function clearDiary() {
      currentDiary.value = { title: '', content: '' }
      saveDiary()
    }
    
    // 重置日期为今天
    function resetDate() {
      selectedDate.value = getTodayDateString()
    }
    
    // 日期改变时加载对应的日记
    function onDateChange(newDate) {
      loadDiary(newDate)
    }
    
    // 切换标签页
    function onTabChange(tab) {
      if (tab.paneName === 'list') {
        loadAllDiaries()
      }
    }
    
    // 查看日记详情
    function viewDiary(diary) {
      selectedDiaryDetail.value = diary
      showDiaryDetail.value = true
    }
    
    // 获取默认标题
    function getDefaultTitle(diary) {
      if (!diary.content) return '无标题日记'
      
      // 从内容中提取第一行作为默认标题
      const firstLine = diary.content.split('\n')[0]
      return firstLine.length > 20 ? firstLine.substring(0, 20) + '...' : firstLine || '无标题日记'
    }
    
    // 获取内容预览
    function getPreview(content) {
      if (!content) return ''
      return content.length > 80 ? content.substring(0, 80) + '...' : content
    }
    
    // 格式化日期显示
    function formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }
    
    // 监听选中日期变化
    watch(selectedDate, (newDate) => {
      loadDiary(newDate)
    })
    
    // 组件挂载时加载今天的日记
    loadDiary(selectedDate.value)
    
    // 监听单词更新事件
    const handleWordUpdate = () => {
      // 当单词更新时，日记组件不需要重新加载数据，因为它依赖props.words
    }
    
    window.addEventListener('wordUpdated', handleWordUpdate)
    
    // 组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('wordUpdated', handleWordUpdate)
    })
    
    return {
      selectedDate,
      currentDiary,
      todayWordsCount,
      todayEfficiency,
      activeTab,
      diariesList,
      filteredDiaries,
      searchQuery,
      showDiaryDetail,
      selectedDiaryDetail,
      saveDiary,
      clearDiary,
      resetDate,
      onDateChange,
      onTabChange,
      viewDiary,
      getDefaultTitle,
      getPreview,
      formatDate
    }
  }
}
</script>

<style scoped>
.diary-container {
  padding: 20px;
  background: var(--background-card);
  min-height: 100vh;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.diary-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.diary-tabs {
  min-width: 300px;
}

.diary-date-selector {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.diary-content {
  margin-bottom: 20px;
}

.diary-title-input {
  margin-bottom: 10px;
}

.diary-stats {
  margin-top: 15px;
  display: flex;
  gap: 30px;
  color: var(--text-secondary);
}

.diary-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 日记列表样式 */
.diary-list {
  margin-top: 20px;
}

.search-input {
  margin-bottom: 20px;
}

.diary-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.diary-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
}

.diary-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #409eff;
}

.diary-item-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
  word-break: break-word;
}

.diary-item-date {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.diary-item-preview {
  font-size: 14px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-message {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
  font-size: 16px;
}

/* 日记详情样式 */
.diary-detail {
  padding: 10px 0;
}

.diary-detail-date {
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.diary-detail-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.8;
  font-size: 16px;
  color: var(--text-primary);
}
</style>