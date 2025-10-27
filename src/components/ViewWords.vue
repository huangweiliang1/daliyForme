<template>
  <div class="word-list-container">
    <!-- 背景装饰元素 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <div class="container mx-auto px-4 py-8">
      <!-- 标题区域 -->
      <div class="flex justify-between items-center mb-8">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-language"></i>
          </div>
          <h1 class="gradient-text text-3xl">单词列表</h1>
        </div>
        <el-button 
          type="primary" 
          class="search-btn"
          @click="resetDate"
        >
          <i class="fas fa-calendar-alt mr-1"></i>今天
        </el-button>
      </div>

      <!-- 日期筛选区域 -->
      <el-card class="mb-6 gradient-card" :class="{ 'card-loaded': !loading }">
        <div class="current-date-info" v-if="selectedDate">
          <span>当前显示: {{ selectedDate }} 的单词记录</span>
          <el-button type="text" @click="resetDate" class="reset-date-btn">
            <i class="fas fa-redo-alt"></i> 重置为今天
          </el-button>
        </div>
        <div class="filter-section p-4">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <div class="date-picker-wrapper">
                <div class="search-wrapper">
                  <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    placeholder="选择日期过滤（留空显示所有）"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    clearable
                    @change="handleDateFilter"
                    class="date-picker w-full"
                  >
                  </el-date-picker>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-select
                v-model="sortBy"
                placeholder="排序方式"
                class="sort-select w-full"
                @change="handleSort"
              >
                <el-option label="添加时间 (新到旧)" value="newest"></el-option>
                <el-option label="添加时间 (旧到新)" value="oldest"></el-option>
                <el-option label="单词 (A-Z)" value="word-asc"></el-option>
                <el-option label="单词 (Z-A)" value="word-desc"></el-option>
              </el-select>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 单词列表 -->
      <div class="word-list mb-6">
        <div v-if="loading" class="loading-container">
          <div v-for="i in 5" :key="i" class="skeleton-item mb-4 animate-pulse">
            <div class="w-1/4 h-8 bg-gray-200 rounded mb-2"></div>
            <div class="w-full h-4 bg-gray-100 rounded mb-1"></div>
            <div class="w-3/4 h-4 bg-gray-100 rounded mb-1"></div>
            <div class="w-1/2 h-4 bg-gray-100 rounded"></div>
          </div>
        </div>
        
        <el-empty v-else-if="filteredWords.length === 0" description="暂无单词" />
        
        <transition-group name="word-item" tag="div" class="word-items space-y-4">
          <el-card
            v-for="(word, index) in paginatedWords"
            :key="word.id || index"
            class="word-card"
          >
            <div class="word-content">
              <div class="word-main">
                <div class="word-header flex justify-between items-center">
                  <h3 class="word-text">
                    {{ word.word }}
                    <span v-if="word.mastered" class="inline-block ml-2"><i class="fas fa-check-circle text-green-500"></i></span>
                  </h3>
                  <div class="word-actions flex space-x-2">
                    <el-button
                      type="primary"
                      :plain="true"
                      icon="el-icon-edit"
                      circle
                      size="small"
                      class="action-btn"
                      @click="editWord(word)"
                    ></el-button>
                    <el-button
                      type="danger"
                      :plain="true"
                      icon="el-icon-delete"
                      circle
                      size="small"
                      class="action-btn"
                      @click="confirmDelete(word)"
                    ></el-button>
                  </div>
                </div>
                
                <div class="word-info mt-2">
                  <div v-if="word.phonetic" class="word-phonetic">
                    <i class="fas fa-volume-up mr-1 text-purple-500"></i>
                    {{ word.phonetic }}
                  </div>
                  <div v-if="word.partOfSpeech" class="word-pos">
                    {{ word.partOfSpeech }}
                  </div>
                </div>
                
                <div class="word-meaning mt-3">
                  <strong>释义：</strong>
                  {{ word.meaning }}
                </div>
                
                <div v-if="word.example" class="word-example mt-2">
                  <i class="fas fa-quote-left text-purple-400 mr-2"></i>
                  {{ word.example }}
                  <i class="fas fa-quote-right text-purple-400 ml-2"></i>
                </div>
                
                <!-- 标签展示 -->
                <div v-if="word.tags && word.tags.length > 0" class="word-tags mt-2 flex flex-wrap gap-1">
                  <el-tag 
                    v-for="tag in word.tags" 
                    :key="tag" 
                    size="small" 
                    effect="plain" 
                    class="result-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                
                <div class="word-date mt-3">
                  <i class="fas fa-calendar-alt mr-1"></i>
                  {{ formatDate(word.date) }}
                  <span v-if="word.lastReviewed" class="ml-4">
                    <i class="fas fa-history mr-1"></i>
                    最后复习: {{ formatDate(word.lastReviewed) }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </transition-group>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && filteredWords.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredWords.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
        />
      </div>

      <!-- 注意：导入导出和清空数据功能已在全局界面底部提供 -->
      
      <!-- 删除确认对话框 -->
      <el-dialog
        v-model="deleteDialogVisible"
        title="确认删除"
        width="30%"
        class="delete-dialog"
        destroy-on-close
        append-to-body
        lock-scroll=false
      >
        <p class="text-red-600">确定要删除单词 "{{ currentWordToDelete?.word }}" 吗？</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="deleteDialogVisible = false" class="clear-btn">取消</el-button>
            <el-button type="danger" @click="deleteWord" class="search-btn">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ViewWords',
  emits: ['edit-word', 'data-updated'],
  setup(props, { emit }) {
    // 获取今天的日期字符串 (YYYY-MM-DD 格式)
    const getTodayDateString = () => {
      const now = new Date();
      return now.toISOString().split('T')[0];
    }
    
    // 响应式数据
    const words = ref([])
    const loading = ref(false)
    const selectedDate = ref('') // 默认为空，显示所有单词
    const sortBy = ref('newest')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const deleteDialogVisible = ref(false)
    const currentWordToDelete = ref(null)
    const deleting = ref(false)
    
    // 加载单词数据
    const loadWords = () => {
      loading.value = true
      setTimeout(() => {
        const savedWords = localStorage.getItem('dailyEnglishWords')
        const allWords = savedWords ? JSON.parse(savedWords) : []
        
        // 加载所有单词
        words.value = [...allWords]
        
        // 默认设置为当天，方便用户直接查看今天的单词
        selectedDate.value = getTodayDateString()
        
        loading.value = false
      }, 500) // 模拟网络延迟
    }
    
    // 保存单词数据
    const saveWords = () => {
      localStorage.setItem('dailyEnglishWords', JSON.stringify(words.value))
      emit('data-updated')
      
      // 触发自定义事件，通知其他组件单词已更新
      window.dispatchEvent(new CustomEvent('wordUpdated'))
    }
    
    // 计算筛选后的单词列表
    const filteredWords = computed(() => {
      // 使用本地响应式数据，而不是直接从localStorage读取
      let result = [...words.value]
      
      // 日期过滤 - 只有当selectedDate有值时才进行过滤
      if (selectedDate.value) {
        result = result.filter(word => word.date === selectedDate.value)
      }
      
      // 排序
      switch (sortBy.value) {
        case 'newest':
          result.sort((a, b) => new Date(b.date) - new Date(a.date))
          break
        case 'oldest':
          result.sort((a, b) => new Date(a.date) - new Date(b.date))
          break
        case 'word-asc':
          result.sort((a, b) => a.word.localeCompare(b.word))
          break
        case 'word-desc':
          result.sort((a, b) => b.word.localeCompare(a.word))
          break
      }
      
      return result
    })
    
    // 计算分页后的单词列表
    const paginatedWords = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredWords.value.slice(start, end)
    })
    
    // 移除热门标签计算，因为已不在UI中显示
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    
    // 处理日期筛选
    const handleDateFilter = () => {
      currentPage.value = 1
    }
    
    // 处理排序变化
    const handleSort = () => {
      currentPage.value = 1
    }
    
    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }
    
    // 处理当前页变化
    const handleCurrentChange = (current) => {
      currentPage.value = current
    }
    
    // 重置日期为今天
    const resetDate = () => {
      selectedDate.value = getTodayDateString()
      handleDateFilter()
    }
    
    // 确认删除单个单词
    const confirmDelete = (word) => {
      currentWordToDelete.value = word
      deleteDialogVisible.value = true
    }
    
    // 删除单个单词
    const deleteWord = async () => {
      if (!currentWordToDelete.value) return
      
      deleting.value = true
      
      try {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 500))
        
        words.value = words.value.filter(word => word.id !== currentWordToDelete.value.id)
        saveWords()
        
        ElMessage.success({
          message: '单词删除成功',
          duration: 2000
        })
        
        // 关闭对话框并重置
        deleteDialogVisible.value = false
        currentWordToDelete.value = null
        
        // 如果当前页没有数据了，回到上一页
        if (paginatedWords.value.length === 0 && currentPage.value > 1) {
          currentPage.value--
        }
      } catch (error) {
        console.error('删除单词失败:', error)
        ElMessage.error('删除失败，请重试')
      } finally {
        deleting.value = false
      }
    }
    
    // 编辑单词
    const editWord = (word) => {
      emit('edit-word', word)
    }
    
    // 解析CSV文件
    const parseCSV = (csvText) => {
      const lines = csvText.split('\n')
      const headers = lines[0].split(',')
      const result = []
      
      // 找到对应的列索引
      const wordIndex = headers.findIndex(h => h.includes('单词'))
      const meaningIndex = headers.findIndex(h => h.includes('释义'))
      const phoneticIndex = headers.findIndex(h => h.includes('音标'))
      const partOfSpeechIndex = headers.findIndex(h => h.includes('词性'))
      const exampleIndex = headers.findIndex(h => h.includes('例句'))
      const tagsIndex = headers.findIndex(h => h.includes('标签'))
      const dateIndex = headers.findIndex(h => h.includes('日期'))
      
      // 检查必要的列是否存在
      if (wordIndex === -1 || meaningIndex === -1) {
        throw new Error('CSV文件格式不正确，缺少必要的列（单词和释义）')
      }
      
      // 解析数据行
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        const values = lines[i].split(',')
        
        // 创建单词对象
        const word = {
          id: Date.now() + i, // 生成唯一ID
          word: values[wordIndex]?.trim() || '',
          meaning: values[meaningIndex]?.trim() || '',
          phonetic: phoneticIndex !== -1 ? (values[phoneticIndex]?.trim() || '') : '',
          partOfSpeech: partOfSpeechIndex !== -1 ? (values[partOfSpeechIndex]?.trim() || '') : '',
          example: exampleIndex !== -1 ? (values[exampleIndex]?.trim() || '') : '',
          tags: tagsIndex !== -1 && values[tagsIndex] ? values[tagsIndex].split(',').map(t => t.trim()) : [],
          date: dateIndex !== -1 && values[dateIndex] ? values[dateIndex].trim() : getTodayDateString(), // 默认使用今天的日期
          mastered: false,
          lastReviewed: null
        }
        
        if (word.word && word.meaning) {
          result.push(word)
        }
      }
      
      return result
    }
    
    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          let content = e.target.result
          if (content.startsWith('\uFEFF')) {
            content = content.substring(1)
          }
          
          // 根据文件类型处理
          if (file.name.endsWith('.json')) {
            // 导入完整备份（JSON格式）
            const backupData = JSON.parse(content)
            
            // 验证备份数据格式
            if (!backupData || typeof backupData !== 'object') {
              throw new Error('备份文件格式不正确')
            }
            
            // 导入单词数据
            if (Array.isArray(backupData.words)) {
              localStorage.setItem('dailyEnglishWords', JSON.stringify(backupData.words))
              // 直接更新本地数据
              words.value = [...backupData.words]
              // 重置筛选，显示所有导入的单词
              selectedDate.value = '' // 清空日期筛选，让用户看到所有导入的单词
            }
            
            // 导入日记数据
            if (backupData.diaries && typeof backupData.diaries === 'object') {
              localStorage.setItem('dailyEnglishDiaries', JSON.stringify(backupData.diaries))
            }
            
            ElMessage.success({
              message: '数据恢复成功',
              duration: 2000
            })
          } else if (file.name.endsWith('.csv')) {
            // 保持原有的CSV导入功能
            const importedWords = parseCSV(content)
            
            if (importedWords.length === 0) {
              ElMessage.warning('没有找到有效的单词数据')
              return
            }
            
            // 获取现有单词
            const savedWords = localStorage.getItem('dailyEnglishWords')
            const existingWords = savedWords ? JSON.parse(savedWords) : []
            
            // 合并数据（避免重复）
            const mergedWords = [...existingWords]
            const existingWordSet = new Set(existingWords.map(w => w.word))
            
            let newWordCount = 0
            importedWords.forEach(word => {
              if (!existingWordSet.has(word.word)) {
                mergedWords.push(word)
                existingWordSet.add(word.word)
                newWordCount++
              }
            })
            
            // 保存合并后的数据
            localStorage.setItem('dailyEnglishWords', JSON.stringify(mergedWords))
            words.value = mergedWords
            // 重置筛选，显示所有导入的单词
            selectedDate.value = '' // 清空日期筛选，让用户看到所有导入的单词
            
            ElMessage.success({
              message: `成功导入 ${newWordCount} 个新单词`,
              duration: 2000
            })
          } else {
            throw new Error('不支持的文件格式，请使用JSON或CSV格式')
          }
          
          // 通知其他组件数据已更新
          window.dispatchEvent(new CustomEvent('wordUpdated'))
          
          // 重新加载数据
          loadWords()
          
        } catch (error) {
          console.error('导入失败:', error)
          ElMessage.error(`导入失败: ${error.message}`)
        } finally {
          // 清空文件输入，以便可以重复选择同一个文件
          event.target.value = ''
        }
      }
      
      reader.onerror = () => {
        ElMessage.error('读取文件失败')
        event.target.value = ''
      }
      
      reader.readAsText(file, 'UTF-8')
    }
    
    // 确认清空数据
    const confirmClearData = () => {
      ElMessageBox.confirm(
        '确定要清空所有单词数据吗？此操作不可恢复！',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      .then(() => {
        clearAllData()
      })
      .catch(() => {
        // 用户取消操作
      })
    }
    
    // 清空所有数据
    const clearAllData = () => {
      try {
        // 清空单词数据
        localStorage.removeItem('dailyEnglishWords')
        
        // 清空日记数据
        localStorage.removeItem('dailyEnglishDiaries')
        
        // 更新本地数据状态
        words.value = []
        
        ElMessage.success({
          message: '所有数据已清空',
          duration: 2000
        })
        
        // 通知其他组件数据已更新
        window.dispatchEvent(new CustomEvent('wordUpdated'))
        
        // 重新加载数据
        loadWords()
      } catch (error) {
        console.error('清空数据失败:', error)
        ElMessage.error('清空数据失败，请重试')
      }
    }
    
    // 导出完整数据备份
    const exportData = () => {
      // 获取所有单词数据
      const wordsData = localStorage.getItem('dailyEnglishWords')
      const words = wordsData ? JSON.parse(wordsData) : []
      
      // 获取所有日记数据
      const diariesData = localStorage.getItem('dailyEnglishDiaries')
      const diaries = diariesData ? JSON.parse(diariesData) : {}
      
      // 创建备份对象
      const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        words: words,
        diaries: diaries
      }
      
      // 转换为JSON字符串
      const jsonContent = JSON.stringify(backupData, null, 2)
      
      // 创建Blob并下载
      const blob = new Blob([`\uFEFF${jsonContent}`], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `每日英语备份_${new Date().toLocaleDateString()}.json`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success({
        message: '数据备份成功',
        duration: 2000
      })
    }
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadWords()
      
      // 监听单词更新事件
      const handleWordUpdate = () => {
        loadWords()
      }
      
      window.addEventListener('wordUpdated', handleWordUpdate)
      
      return () => {
        window.removeEventListener('wordUpdated', handleWordUpdate)
      }
    })
    
    // 暴露方法和数据给模板
    return {
      words,
      loading,
      selectedDate,
      sortBy,
      currentPage,
      pageSize,
      deleteDialogVisible,
      currentWordToDelete,
      filteredWords,
      paginatedWords,
      formatDate,
      handleDateFilter,
      handleSort,
      handleSizeChange,
      handleCurrentChange,
      resetDate,
      confirmDelete,
      deleteWord,
      editWord
    }
  }
}
</script>

<style scoped>
.word-list-container {
  --primary-color: #4361ee;
  --secondary-color: #4cc9f0;
  --accent-color: #f72585;
  --accent-color-2: #7209b7;
  --bg-color: #f8fafc;
  --text-primary: #334155;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --border-color: #e2e8f0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.1);
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
  --ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  background-color: var(--bg-color);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

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
  filter: blur(80px);
  opacity: 0.5;
}

.bg-circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  top: -250px;
  right: -250px;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-color-2) 100%);
  bottom: -200px;
  left: -200px;
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

.container {
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  animation: float 6s ease-in-out infinite;
}

.gradient-text {
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.5s var(--ease-out);
}

.search-btn {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-normal) var(--ease-bounce);
  box-shadow: var(--shadow-sm);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.clear-btn {
  background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-normal) var(--ease-bounce);
  box-shadow: var(--shadow-sm);
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.gradient-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
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
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color), var(--accent-color-2));
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.gradient-card.card-loaded::before {
  opacity: 1;
}

.gradient-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.search-input {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal) var(--ease-out);
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.date-picker,
.sort-select {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal) var(--ease-out);
}

.date-picker:focus,
.sort-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.el-tag.active {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border: none;
}

.loading-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.word-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal) var(--ease-bounce);
  position: relative;
  overflow: hidden;
}

.word-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.word-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 12px 24px rgba(67, 97, 238, 0.15);
  border-color: var(--primary-color);
}

.word-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.word-phonetic {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.word-pos {
  font-size: 0.875rem;
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  display: inline-block;
  margin-top: 4px;
}

.word-meaning {
  color: var(--text-primary);
  line-height: 1.6;
}

.word-example {
  font-style: italic;
  color: var(--text-secondary);
  padding: 12px;
  background: rgba(238, 242, 255, 0.8);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.result-tag {
    background: rgba(67, 97, 238, 0.1);
    color: var(--primary-color);
    border-color: rgba(67, 97, 238, 0.2);
  }

  .current-date-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: #666;
  }

  .reset-date-btn {
    font-size: 12px;
    padding: 0;
    min-width: auto;
  }

  .date-picker-wrapper {
    width: 100%;
  font-size: 0.75rem;
}

.word-date {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
}

.action-btn {
  transition: all var(--transition-normal) var(--ease-bounce);
}

.action-btn:hover {
  transform: scale(1.1);
}

.pagination-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.pagination {
  display: flex;
  justify-content: center;
}

.delete-dialog {
  border-radius: var(--radius-lg);
  overflow: hidden;
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
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 单词项过渡动画 */
.word-item-enter-active,
.word-item-leave-active {
  transition: all var(--transition-normal) var(--ease-out);
}

.word-item-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.word-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.word-item-move {
  transition: transform var(--transition-normal) var(--ease-out);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .filter-section {
    padding: 15px;
    gap: 15px;
  }
  
  .section-title {
    font-size: 1.3rem;
    text-align: center;
  }
  
  .filter-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-group > div {
    width: 100%;
  }
  
  .date-picker,
  .sort-select {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .word-cards {
    gap: 10px;
  }
  
  .word-card {
    padding: 12px;
    min-height: auto;
  }
  
  .word-text {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }
  
  .word-info {
    gap: 8px;
  }
  
  .word-phonetic {
    font-size: 0.9rem;
  }
  
  .word-meaning {
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .word-example {
    font-size: 0.85rem;
    padding: 8px;
  }
  
  .word-tags {
    gap: 6px;
  }
  
  .word-tags .el-tag {
    font-size: 12px;
    padding: 2px 8px;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .action-buttons {
    gap: 6px;
  }
  
  .action-btn {
    min-width: 36px;
    height: 36px;
    font-size: 12px;
    padding: 0 8px;
  }
  
  .current-date-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    font-size: 12px;
  }
  
  .empty-state {
    padding: 40px 20px;
  }
  
  .empty-state h3 {
    font-size: 1.2rem;
  }
  
  /* 优化分页组件在小屏幕的显示 */
  .pagination-container {
    padding: 10px;
  }
  
  .el-pagination {
    font-size: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .el-pagination .btn-prev, 
  .el-pagination .btn-next {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
  }
  
  .el-pagination .el-pager li {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
  }
  
  .el-pagination__sizes {
    margin-right: 5px;
    margin-bottom: 10px;
  }
  
  /* 修复对话框在小屏幕的宽度 */
  .delete-dialog {
    width: 90% !important;
    margin: 20px;
  }
  
  /* 优化导入导出按钮在移动端的显示 */
  .import-export-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .import-export-actions button {
    width: 100%;
    padding: 8px 16px;
    font-size: 14px;
  }
}

/* 小屏手机专用优化 (375px以下) */
@media (max-width: 375px) {
  .container {
    padding: 5px;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .filter-section {
    padding: 10px;
    gap: 12px;
  }
  
  .filter-group {
    gap: 8px;
  }
  
  .date-picker,
  .sort-select {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .word-card {
    padding: 10px;
  }
  
  .word-text {
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  .word-phonetic {
    font-size: 0.85rem;
  }
  
  .word-meaning {
    font-size: 0.85rem;
  }
  
  .word-example {
    font-size: 0.8rem;
    padding: 6px;
  }
  
  .word-tags .el-tag {
    font-size: 11px;
    padding: 1px 6px;
  }
  
  .action-btn {
    min-width: 32px;
    height: 32px;
    font-size: 11px;
    padding: 0 6px;
  }
  
  .pagination-container {
    padding: 5px;
  }
  
  .el-pagination {
    font-size: 11px;
  }
  
  .el-pagination .btn-prev, 
  .el-pagination .btn-next {
    min-width: 24px;
    height: 24px;
    line-height: 24px;
  }
  
  .el-pagination .el-pager li {
    min-width: 24px;
    height: 24px;
    line-height: 24px;
  }
  
  .empty-state {
    padding: 30px 15px;
  }
  
  .empty-state h3 {
    font-size: 1.1rem;
  }
  
  .empty-state p {
    font-size: 0.9rem;
  }
  
  /* 修复对话框在小屏幕的宽度 */
  .delete-dialog {
    width: 95% !important;
    margin: 10px;
  }
}

/* 极小屏适配 (320px以下) */
@media (max-width: 320px) {
  .container {
    padding: 4px;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .filter-section {
    padding: 8px;
  }
  
  .word-card {
    padding: 8px;
  }
  
  .word-text {
    font-size: 1rem;
  }
  
  .word-phonetic,
  .word-meaning {
    font-size: 0.8rem;
  }
  
  .word-example {
    font-size: 0.75rem;
    padding: 5px;
  }
  
  .action-btn {
    min-width: 28px;
    height: 28px;
    font-size: 10px;
    padding: 0 4px;
  }
  
  .import-export-actions button {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>