<template>
  <div class="container">
    <!-- 顶部标题和统计 - 使用Element Plus卡片 -->
    <el-card class="app-header-card">
      <div class="header-content">
        <div class="app-title">
          <div class="title-icon">
            <i class="fas fa-language"></i>
          </div>
          <h1>英语学习日记</h1>
        </div>
        <div class="header-stats" v-show="currentTab === 'view'">
          <div class="stat-item stat-total" :class="{ 'stat-animate': showStats }">
            <div class="stat-icon"><i class="fas fa-book"></i></div>
            <div class="stat-value">{{ totalWords }}</div>
            <div class="stat-label">总单词</div>
          </div>
          <div class="stat-item stat-today" :class="{ 'stat-animate': showStats }">
            <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
            <div class="stat-value">{{ todayWords }}</div>
            <div class="stat-label">今日</div>
          </div>
          <div class="stat-item stat-days" :class="{ 'stat-animate': showStats }">
            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-value">{{ studyDays }}</div>
            <div class="stat-label">学习天数</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 主内容区 -->
    <main class="main-content" :class="{ 'mobile-container': isMobile }">
      <!-- 背景装饰 -->
      <div class="background-decoration">
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
        <div class="bg-circle bg-circle-3"></div>
        <div class="bg-gradient"></div>
      </div>
      <!-- 桌面端标签页导航 - Element Plus标签页 -->
      <el-tabs 
        v-model="currentTab" 
        class="mobile-hidden tab-container"
        type="card"
        :before-leave="beforeTabLeave"
        @tab-click="onTabClick"
        :tab-position="isMobile ? 'bottom' : 'top'"
      >
        <el-tab-pane label="添加单词" name="add">
          <template #label>
            <span class="tab-label">
              <i class="fas fa-plus-circle tab-icon"></i>
              <span>添加单词</span>
            </span>
          </template>
          <div class="tab-content">
            <AddWord @word-added="refreshStats" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="查看记录" name="view">
          <template #label>
            <span class="tab-label">
              <i class="fas fa-list-alt tab-icon"></i>
              <span>查看记录</span>
            </span>
          </template>
          <div class="tab-content">
            <ViewWords @data-updated="refreshStats" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="搜索单词" name="search">
          <template #label>
            <span class="tab-label">
              <i class="fas fa-search tab-icon"></i>
              <span>搜索单词</span>
            </span>
          </template>
          <div class="tab-content">
            <SearchWords />
          </div>
        </el-tab-pane>
        <el-tab-pane label="单词练习" name="practice">
          <template #label>
            <span class="tab-label">
              <i class="fas fa-book-open tab-icon"></i>
              <span>单词练习</span>
            </span>
          </template>
          <div class="tab-content">
            <PracticeWords />
          </div>
        </el-tab-pane>
        <el-tab-pane label="学习日记" name="diary">
          <template #label>
            <span class="tab-label">
              <i class="fas fa-book tab-icon"></i>
              <span>学习日记</span>
            </span>
          </template>
          <div class="tab-content">
            <Diary :words="words" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="学习统计" name="stats">
          <template #label>
            <span class="tab-label">
              <i class="fas fa-chart-bar tab-icon"></i>
              <span>学习统计</span>
            </span>
          </template>
          <div class="tab-content">
            <StatsView 
              @refresh="refreshStats"
              v-model:dailyTarget="dailyTarget"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 移动端内容 -->
      <div v-if="isMobile" class="mobile-tab-content">
        <div class="mobile-page-title">{{ getPageTitle }}</div>
        <div 
          class="mobile-content" 
          :class="{ 'content-fade-in': contentVisible, 'content-fade-out': !contentVisible }"
        >
          <AddWord v-show="currentTab === 'add'" @word-added="refreshStats" />
          
          <!-- 移动端操作按钮组 - 放在快速添加下方 -->
          <div class="mobile-actions-below-add desktop-hidden">
            <el-button-group>
              <el-button 
                type="primary" 
                size="small"
                icon="el-icon-download" 
                @click="exportData"
                class="mobile-action-btn"
                title="导出数据"
              >导出</el-button>
              <el-button 
                type="info" 
                size="small"
                icon="el-icon-upload" 
                @click="triggerImport"
                class="mobile-action-btn"
                title="导入数据"
              >导入</el-button>
              <el-button 
                type="danger" 
                size="small"
                icon="el-icon-delete" 
                @click="clearData"
                class="mobile-action-btn"
                title="清空数据"
              >清空</el-button>
            </el-button-group>
          </div>
          <ViewWords v-show="currentTab === 'view'" @data-updated="refreshStats" />
          <SearchWords v-show="currentTab === 'search'" />
          <PracticeWords v-show="currentTab === 'practice'" />
          <Diary v-show="currentTab === 'diary'" :words="words" />
          <StatsView v-show="currentTab === 'stats'" @refresh="refreshStats" v-model:dailyTarget="dailyTarget" :words="words" />
        </div>
      </div>

      <!-- 桌面端底部操作区 - Element Plus按钮组 -->
      <div class="desktop-hidden mobile-bottom-padding">
        <!-- 移动端内容底部边距，防止被导航栏遮挡 -->
      </div>

      <!-- 桌面端底部操作区 -->
      <div class="desktop-bottom-actions mobile-hidden">
        <el-button-group>
          <el-button 
            type="primary" 
            icon="el-icon-download" 
            @click="exportData"
            class="action-btn"
          >导出数据</el-button>
          <el-button 
            type="info" 
            icon="el-icon-upload" 
            @click="triggerImport"
            class="action-btn"
          >导入数据</el-button>
          <el-button 
            type="danger" 
            icon="el-icon-delete" 
            @click="clearData"
            class="action-btn"
          >清空数据</el-button>
        </el-button-group>
        <div class="app-info">
          © 2023 英语学习日记 | 让学习更有效率
        </div>
      </div>
    </main>

    <!-- 移动端操作按钮已移至快速添加下方 -->
    
    <!-- 移动端底部导航栏 -->
    <div class="mobile-nav desktop-hidden">
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'add' }"
        @click="switchTab('add')"
      >
        <div class="nav-icon-wrapper">
          <i class="fas fa-plus-circle mobile-nav-icon"></i>
        </div>
        <span>添加</span>
      </div>
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'view' }"
        @click="switchTab('view')"
      >
        <div class="nav-icon-wrapper">
          <i class="fas fa-list-alt mobile-nav-icon"></i>
        </div>
        <span>查看</span>
      </div>
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'search' }"
        @click="switchTab('search')"
      >
        <div class="nav-icon-wrapper">
          <i class="fas fa-search mobile-nav-icon"></i>
        </div>
        <span>搜索</span>
      </div>
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'practice' }"
        @click="switchTab('practice')"
      >
        <div class="nav-icon-wrapper">
          <i class="fas fa-book mobile-nav-icon"></i>
        </div>
        <span>练习</span>
      </div>
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'diary' }"
        @click="switchTab('diary')"
      >
        <div class="nav-icon-wrapper">
          <i class="fas fa-book-open mobile-nav-icon"></i>
        </div>
        <span>日记</span>
      </div>
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'stats' }"
        @click="switchTab('stats')"
      >
        <div class="nav-icon-wrapper">
          <i class="fas fa-chart-line mobile-nav-icon"></i>
        </div>
        <span>统计</span>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      type="file" 
      ref="fileInput" 
      style="display: none" 
      accept=".json"
      @change="handleImport"
    >

    <!-- 使用Element Plus的通知组件 -->
    <el-notification
      v-if="notification.show"
      :title="getNotificationTitle"
      :message="notification.message"
      :type="notification.type"
      :duration="3000"
      @close="hideNotification"
    >
    </el-notification>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AddWord from './components/AddWord.vue'
import ViewWords from './components/ViewWords.vue'
import SearchWords from './components/SearchWords.vue'
import PracticeWords from './components/PracticeWords.vue'
import StatsView from './components/StatsView.vue'
import Diary from './components/Diary.vue'

export default {
  name: 'App',
  components: {
    AddWord,
    ViewWords,
    SearchWords,
    PracticeWords,
    StatsView,
    Diary
  },
  setup() {
    // 状态管理
    const currentTab = ref('add')
    const fileInput = ref(null)
    const windowWidth = ref(window.innerWidth)
    const contentVisible = ref(true)
    const showStats = ref(false)
    // 每日目标设置 - 从localStorage初始化，如果没有则为默认值
    const savedTarget = localStorage.getItem('dailyEnglishTarget')
    const dailyTarget = ref(savedTarget ? parseInt(savedTarget) : 20)
    
    // 通知状态
    const notification = ref({
      show: false,
      message: '',
      type: 'success'
    })
    
    // 判断是否为移动端
    const isMobile = computed(() => windowWidth.value <= 768)

    // 获取所有单词数据
    const getAllWords = () => {
      const savedWords = localStorage.getItem('dailyEnglishWords')
      return savedWords ? JSON.parse(savedWords) : []
    }

    // 计算统计数据
    const totalWords = computed(() => {
      const words = getAllWords()
      return words.length
    })

    const todayWords = computed(() => {
      const words = getAllWords()
      const today = new Date().toISOString().split('T')[0]
      return words.filter(word => word.date === today).length
    })

    const studyDays = computed(() => {
      const words = getAllWords()
      const uniqueDates = new Set(words.map(word => word.date))
      return uniqueDates.size
    })

    // 获取页面标题
    const getPageTitle = computed(() => {
      const titles = {
        add: '添加单词',
        view: '查看记录',
        search: '搜索单词',
        practice: '单词练习',
        diary: '学习日记',
        stats: '学习统计'
      }
      return titles[currentTab.value] || '英语学习日记'
    })
    
    // 切换标签页动画
    const switchTab = (tab) => {
      contentVisible.value = false
      setTimeout(() => {
        currentTab.value = tab
        setTimeout(() => {
          contentVisible.value = true
        }, 50)
      }, 200)
    }
    
    // 标签页离开前的钩子
    const beforeTabLeave = () => {
      contentVisible.value = false
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 200)
      })
    }
    
    // 标签页点击事件
    const onTabClick = () => {
      contentVisible.value = true
      if (currentTab.value === 'view') {
        setTimeout(() => {
          showStats.value = true
        }, 300)
      }
    }

    // 显示通知
    const showNotification = (message, type = 'success') => {
      notification.value = {
        show: true,
        message,
        type
      }
    }
    
    // 通知标题计算属性
    const getNotificationTitle = computed(() => {
      const titles = {
        success: '成功',
        warning: '警告',
        error: '错误',
        info: '提示'
      }
      return titles[notification.value.type] || '提示'
    })
    
    // 窗口大小变化处理
    const handleResize = () => {
      windowWidth.value = window.innerWidth
    }
    
    // 监听标签页变化
    watch(currentTab, (newTab) => {
      if (newTab === 'view') {
        setTimeout(() => {
          showStats.value = true
        }, 300)
      }
    })
    
    onMounted(() => {
      window.addEventListener('resize', handleResize)
      
      // 从localStorage读取保存的每日目标
      const savedTarget = localStorage.getItem('dailyEnglishTarget')
      if (savedTarget) {
        dailyTarget.value = parseInt(savedTarget)
      }
      
      // 确保不会有默认单词数据
      if (!localStorage.getItem('dailyEnglishWords')) {
        localStorage.setItem('dailyEnglishWords', JSON.stringify([]))
      }
      
      // 页面加载时的动画效果
      setTimeout(() => {
        showStats.value = true
      }, 500)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    // 隐藏通知
    const hideNotification = () => {
      notification.value.show = false
    }

    // 刷新统计和所有数据
    const refreshStats = () => {
      // 强制刷新数据 - 通过触发响应式更新
      window.location.reload() // 直接刷新页面以确保所有组件重新加载最新数据
    }

    // 导出数据（包含单词和日记）
    const exportData = () => {
      const words = getAllWords()
      // 获取日记数据
      const diaries = JSON.parse(localStorage.getItem('dailyEnglishDiaries') || '{}')
      
      // 创建完整的数据导出对象
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        words: words,
        diaries: diaries
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `english_learning_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      showNotification('数据导出成功（包含单词和日记）', 'success')
      // 导出后刷新页面，确保所有数据都是最新的
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }

    // 触发文件选择
    const triggerImport = () => {
      fileInput.value?.click()
    }

    // 获取今天的日期字符串 YYYY-MM-DD
    const getTodayDateString = () => {
      return new Date().toISOString().split('T')[0]
    }

    // 导入数据（支持单词和日记）
    const handleImport = (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          let wordsImported = 0
          let diariesImported = 0
          
          // 判断是新格式（包含words和diaries）还是旧格式（仅words数组）
          if (importedData.words && importedData.diaries) {
            // 新格式：同时导入单词和日记
            const importedWords = importedData.words
            const importedDiaries = importedData.diaries
            
            // 处理单词数据
            if (Array.isArray(importedWords)) {
              // 为导入的单词添加必要的字段
              const processedWords = importedWords.map(word => ({
                id: word.id || Date.now() + Math.random().toString(36).substr(2, 9),
                word: word.word || word.name || word.wordName || '',
                meaning: word.meaning || word.definition || word.translation || '',
                phonetic: word.phonetic || word.pronunciation || '',
                example: word.example || word.sample || '',
                tags: word.tags || [],
                date: word.date || getTodayDateString(),
                reviewCount: word.reviewCount || 0,
                mastered: word.mastered || false
              })).filter(word => word.word && word.meaning)
              
              // 合并数据（保留现有数据）
              const currentWords = getAllWords()
              const currentWordIds = new Set(currentWords.map(w => w.id))
              const uniqueNewWords = processedWords.filter(w => !currentWordIds.has(w.id))
              const mergedWords = [...currentWords, ...uniqueNewWords]
              
              // 保存单词到localStorage
              localStorage.setItem('dailyEnglishWords', JSON.stringify(mergedWords))
              wordsImported = uniqueNewWords.length
            }
            
            // 处理日记数据
            if (typeof importedDiaries === 'object') {
              // 获取现有日记
              const currentDiaries = JSON.parse(localStorage.getItem('dailyEnglishDiaries') || '{}')
              // 合并日记（保留现有日记，导入新日记）
              const mergedDiaries = { ...currentDiaries, ...importedDiaries }
              // 保存日记到localStorage
              localStorage.setItem('dailyEnglishDiaries', JSON.stringify(mergedDiaries))
              
              // 计算导入的日记数量（只统计新的日记）
              Object.keys(importedDiaries).forEach(date => {
                if (!currentDiaries[date] || 
                    currentDiaries[date].content !== importedDiaries[date].content) {
                  diariesImported++
                }
              })
            }
            
            showNotification(`成功导入 ${wordsImported} 个单词和 ${diariesImported} 篇日记`, 'success')
          } else if (Array.isArray(importedData)) {
            // 旧格式：仅导入单词
            const importedWords = importedData
            
            // 为导入的单词添加必要的字段
            const processedWords = importedWords.map(word => ({
              id: word.id || Date.now() + Math.random().toString(36).substr(2, 9),
              word: word.word || word.name || word.wordName || '',
              meaning: word.meaning || word.definition || word.translation || '',
              phonetic: word.phonetic || word.pronunciation || '',
              example: word.example || word.sample || '',
              tags: word.tags || [],
              date: word.date || getTodayDateString(),
              reviewCount: word.reviewCount || 0,
              mastered: word.mastered || false
            })).filter(word => word.word && word.meaning)
            
            // 合并数据（保留现有数据）
            const currentWords = getAllWords()
            const currentWordIds = new Set(currentWords.map(w => w.id))
            const uniqueNewWords = processedWords.filter(w => !currentWordIds.has(w.id))
            const mergedWords = [...currentWords, ...uniqueNewWords]
            
            // 保存到localStorage
            localStorage.setItem('dailyEnglishWords', JSON.stringify(mergedWords))
            
            showNotification(`成功导入 ${uniqueNewWords.length} 个单词`, 'success')
          } else {
            throw new Error('无效的数据格式，请确保是正确的单词或完整备份文件')
          }
          
          refreshStats()
          
          // 清空文件输入
          event.target.value = ''
          
          // 导入后立即刷新页面
          setTimeout(() => {
            window.location.reload()
          }, 500)
        } catch (error) {
          showNotification('数据导入失败：' + error.message, 'error')
        }
      }
      reader.readAsText(file)
    }

    // 清空数据（包括单词和日记）
    const clearData = () => {
      if (confirm('确定要清空所有数据吗？此操作不可恢复！这将删除所有单词和日记。')) {
        localStorage.removeItem('dailyEnglishWords')
        localStorage.removeItem('dailyEnglishDiaries')
        showNotification('所有数据已清空（包括单词和日记）', 'warning')
        // 清空后立即刷新页面
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    }

    // 初始化数据 - 不再提供默认数据
    const initializeMockData = () => {
      // 不再自动添加默认数据，用户需要手动添加单词
    }

    return {
      currentTab,
      fileInput,
      notification,
      totalWords,
      todayWords,
      studyDays,
      isMobile,
      contentVisible,
      showStats,
      getNotificationTitle,
      getPageTitle,
        switchTab,
        showNotification,
        hideNotification,
        refreshStats,
        exportData,
        triggerImport,
        handleImport,
        clearData,
        beforeTabLeave,
        onTabClick,
        dailyTarget
    }
  }
}
</script>

<style scoped>
/* App特定样式 */
.app-header-card {
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-xl);
  margin-bottom: var(--space-xl);
  transition: transform var(--transition-normal) var(--ease-bounce);
  animation: statSlideIn 0.8s var(--ease-out);
}

.app-header-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-2xl);
}

.app-header-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
  pointer-events: none;
}

.app-header-card::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 10%;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  transform: translateY(-50%);
  animation: pulse 8s ease-in-out infinite;
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.app-title {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  position: relative;
}

.title-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal) ease;
  animation: rotate 20s linear infinite;
  position: relative;
  overflow: hidden;
}

.title-icon::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s infinite;
}

.app-header-card:hover .title-icon {
  animation-duration: 10s;
  transform: scale(1.05);
}

.app-title h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  position: relative;
  background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.app-title h1::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  transition: width var(--transition-normal) ease;
}

.app-header-card:hover .app-title h1::after {
  width: 100%;
}

/* 统计卡片样式 */
.header-stats {
  display: flex;
  gap: var(--space-lg);
}

.stat-item {
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  min-width: 120px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.6s var(--ease-bounce);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color-light));
  transform: scaleX(0);
  transition: transform var(--transition-normal) ease;
}

.stat-item:hover {
  transform: translateY(-5px) scale(1.02);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.stat-item:hover::before {
  transform: scaleX(1);
}

.stat-item.stat-animate {
  transform: translateY(0);
  opacity: 1;
}

.stat-total {
  transition-delay: 0.1s;
}

.stat-today {
  transition-delay: 0.2s;
}

.stat-days {
  transition-delay: 0.3s;
}

.stat-icon {
  font-size: 1.8rem;
  margin-bottom: var(--space-sm);
  animation: pulse 3s infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-xs);
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 主内容区样式 */
.main-content {
  position: relative;
  overflow: hidden;
  margin-bottom: var(--space-xl);
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(67, 97, 238, 0.05) 0%, rgba(67, 97, 238, 0) 70%);
  animation: float 15s ease-in-out infinite;
}

.bg-circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -100px;
  animation-duration: 20s;
}

.bg-circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -100px;
  animation-duration: 15s;
  animation-delay: 2s;
  background: radial-gradient(circle, rgba(76, 201, 240, 0.05) 0%, rgba(76, 201, 240, 0) 70%);
}

.bg-circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 20%;
  animation-duration: 12s;
  animation-delay: 1s;
  background: radial-gradient(circle, rgba(247, 37, 133, 0.05) 0%, rgba(247, 37, 133, 0) 70%);
}

.bg-gradient {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(76, 201, 240, 0.03) 0%, rgba(76, 201, 240, 0) 70%);
  transform: translate(-50%, -50%);
  z-index: -1;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* 闪光动画 */
@keyframes shine {
  0% {
    left: -100%;
  }
  20%, 100% {
    left: 150%;
  }
}

/* 滑入动画 */
@keyframes statSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 数字增长动画 */
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 标签页样式 */
.tab-container {
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--background-card);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal) ease;
  animation: statSlideIn 0.6s var(--ease-out) 0.3s both;
}

.tab-container:hover {
  box-shadow: var(--shadow-xl);
}

.el-tabs--card > .el-tabs__header .el-tabs__nav {
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.el-tabs--card > .el-tabs__header .el-tabs__item {
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  transition: all var(--transition-normal) ease;
  font-weight: 500;
  padding: 16px 24px;
  position: relative;
  overflow: hidden;
}

.el-tabs--card > .el-tabs__header .el-tabs__item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: var(--gradient-primary);
  transition: width var(--transition-normal) ease, left var(--transition-normal) ease;
}

.el-tabs--card > .el-tabs__header .el-tabs__item:hover {
  background: rgba(67, 97, 238, 0.05);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  background: var(--background-card);
  color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.el-tabs--card > .el-tabs__header .el-tabs__item.is-active::after {
  width: 100%;
  left: 0;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-icon {
  font-size: 18px;
  transition: transform var(--transition-normal) ease;
}

.el-tabs--card > .el-tabs__header .el-tabs__item:hover .tab-icon {
  transform: scale(1.1) rotate(10deg);
}

.el-tabs--card > .el-tabs__header .el-tabs__item.is-active .tab-icon {
  color: var(--primary-color);
  animation: pulse 2s infinite;
}

.tab-content {
  padding: var(--space-xl);
  min-height: 400px;
  background: var(--background-card);
  position: relative;
  overflow: hidden;
}

.tab-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-color-light), transparent);
}

/* 移动端样式 */
.mobile-page-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  padding: var(--space-md);
  background: var(--background-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  background: linear-gradient(90deg, var(--background-card), rgba(255, 255, 255, 0.9));
}

.mobile-content {
  padding: var(--space-md);
  min-height: calc(100vh - 120px);
}

.content-fade-in {
  animation: fadeIn 0.4s var(--ease-out);
}

.content-fade-out {
  animation: fadeOut 0.2s var(--ease-in);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* 移动端导航栏样式增强 */
.mobile-nav {
  background: var(--background-card);
  box-shadow: var(--shadow-lg);
  border-top-left-radius: var(--radius-xl);
  border-top-right-radius: var(--radius-xl);
  margin-bottom: 0;
  padding: 10px 0 20px 0;
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.mobile-nav-item {
  transition: all var(--transition-normal) var(--ease-bounce);
  padding: 8px 0;
  position: relative;
}

.mobile-nav-item.active {
  transform: translateY(-5px);
}

.nav-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  border-radius: 50%;
  background: rgba(67, 97, 238, 0.1);
  transition: all var(--transition-normal) ease;
  position: relative;
  overflow: hidden;
}

.nav-icon-wrapper::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: rotate(45deg);
  transition: transform var(--transition-normal) ease;
}

.mobile-nav-item:hover .nav-icon-wrapper::before {
  transform: rotate(45deg) translateX(100%);
}

.mobile-nav-item.active .nav-icon-wrapper {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
  transform: scale(1.1);
}

.mobile-nav-icon {
  font-size: 22px;
  transition: all var(--transition-normal) ease;
}

.mobile-nav-item.active .mobile-nav-icon {
  transform: scale(1.1);
  animation: pulse 2s infinite;
}

/* 底部操作区样式 */
.desktop-bottom-actions {
  margin-top: var(--space-xl);
  text-align: center;
  animation: statSlideIn 0.6s var(--ease-out) 0.5s both;
}

.action-btn {
  border-radius: var(--radius-full);
  padding: 10px 24px;
  margin: 0 8px;
  transition: all var(--transition-normal) ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
  z-index: -1;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:active {
  transform: translateY(0);
}

.app-info {
  margin-top: var(--space-lg);
  color: var(--text-secondary);
  font-size: 0.9rem;
  opacity: 0.8;
  transition: opacity var(--transition-normal) ease;
}

.app-info:hover {
  opacity: 1;
  color: var(--text-primary);
}

/* 移动端全局操作按钮样式 */
.mobile-global-actions {
  position: fixed;
  top: 10px; /* 移到页面顶部 */
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 999; /* 提高层级确保在其他元素之上 */
}

.action-buttons {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.mobile-action-btn {
  flex: 1;
  font-size: 12px;
  padding: 8px 0;
}

/* 移动端快速添加下方操作按钮样式 */
.mobile-actions-below-add {
  margin: 15px 0;
  text-align: center;
}

.mobile-actions-below-add .el-button-group {
  display: flex;
  justify-content: center;
  gap: 5px;
  width: 100%;
}

.mobile-actions-below-add .mobile-action-btn {
  flex: 1;
  min-width: 80px;
  padding: 8px 5px;
  font-size: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
    padding: var(--space-md);
  }
  
  .header-stats {
    width: 100%;
    justify-content: space-around;
    gap: var(--space-xs);
  }
  
  .stat-item {
    min-width: 90px;
    padding: var(--space-sm);
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .app-title h1 {
    font-size: 1.5rem;
  }
  
  .tab-content {
    padding: var(--space-md);
  }
  
  .action-btn {
    margin: 4px;
    padding: 8px 16px;
  }
}

/* 平板设备响应式 */
@media (max-width: 1024px) {
  .header-stats {
    gap: var(--space-md);
  }
  
  .stat-item {
    min-width: 100px;
  }
}
  </style>